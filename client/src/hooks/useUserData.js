import { useState, useEffect, useCallback } from "react";
import { getUserData, updateSyllabusProgress, logDailyHours } from "../utils/api";
import { SYLLABUS, deepClone } from "../data/syllabusData";

/**
 * useUserData({ enabled, token })
 *
 * `token` must be passed explicitly from App.jsx.
 * This is the race-condition fix: on the very first post-login render,
 * the module-level _token in api.js may not be set yet because
 * setAuthToken() is a synchronous side-effect inside useAuth's login()
 * callback, but React batches state updates — so by the time useUserData
 * runs its useEffect and calls fetchData(), _token could still be null.
 *
 * Passing the raw token string here and forwarding it directly to
 * getUserData() as an explicit override guarantees the Authorization
 * header is always present on that first critical fetch.
 */
export function useUserData({ enabled = true, token = null } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async (explicitToken = null) => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      // Pass whichever token we have: argument > prop > module-level (handled inside api.js)
      const res = await getUserData(explicitToken || token);

      if (res?.success) {
        setData({
          profile:           res.profile,
          syllabus:          mergeProgressIntoSyllabus(res.syllabus_progress || {}),
          answers:           res.answers           || [],
          daily_logs:        res.daily_logs        || [],
          spaced_repetition: res.spaced_repetition || { queue: [] },
        });
      } else {
        setData(buildFallback());
      }
    } catch (e) {
      setError(e.message || "Failed to load dashboard data");
      setData((prev) => prev ?? buildFallback());
    } finally {
      setLoading(false);
    }
  // token in dep array: re-fetches automatically if token changes (login/logout)
  }, [enabled, token]);

  useEffect(() => {
    if (enabled && token) {
      // Pass token explicitly on every fetch triggered by this effect
      fetchData(token);
    } else if (!enabled) {
      setLoading(false);
      setData(null);
    }
  }, [fetchData, enabled, token]);

  // ─── Merge saved progress onto the static syllabus structure ────────────────
  function mergeProgressIntoSyllabus(progress) {
    const base = deepClone(SYLLABUS);
    for (const [stage, papers] of Object.entries(progress)) {
      if (!base[stage]) continue;
      for (const [paperId, modules] of Object.entries(papers)) {
        if (!base[stage][paperId]) continue;
        for (const [modName, saved] of Object.entries(modules)) {
          if (!base[stage][paperId].modules[modName]) continue;
          base[stage][paperId].modules[modName].progress = saved.progress ?? 0;
          base[stage][paperId].modules[modName].status   = saved.state   ?? "pending";
        }
      }
    }
    return base;
  }

  function buildFallback() {
    return {
      profile: {
        name: "Aspirant",
        target_year: 2027,
        streak: 0,
        longest_streak: 0,
        daily_target_hours: 8,
        examDate: null,
      },
      syllabus:          deepClone(SYLLABUS),
      answers:           [],
      daily_logs:        [],
      spaced_repetition: { queue: [] },
    };
  }

  // ─── Optimistic syllabus update → PATCH backend ──────────────────────────────
  const updateProgress = useCallback(async (stage, paper, moduleName, progress, statusOrState) => {
    setData((prev) => {
      if (!prev) return prev;
      const mod = prev.syllabus?.[stage]?.[paper]?.modules?.[moduleName];
      if (!mod) return prev;
      return {
        ...prev,
        syllabus: {
          ...prev.syllabus,
          [stage]: {
            ...prev.syllabus[stage],
            [paper]: {
              ...prev.syllabus[stage][paper],
              modules: {
                ...prev.syllabus[stage][paper].modules,
                [moduleName]: {
                  ...mod,
                  progress,
                  ...(statusOrState ? { status: statusOrState, state: statusOrState } : {}),
                },
              },
            },
          },
        },
      };
    });
    try {
      await updateSyllabusProgress(stage, paper, moduleName, progress, statusOrState);
    } catch (e) {
      setError(`Sync failed: ${e.message}`);
      fetchData(token);
    }
  }, [fetchData, token]);

  const logHours = useCallback(async (hours, notes) => {
    try {
      const result = await logDailyHours(hours, notes);
      await fetchData(token);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [fetchData, token]);

  const updateProfile = useCallback((fields) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev?.profile, ...fields },
    }));
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const overallProgress = data
    ? (() => {
        let total = 0, count = 0;
        for (const stage of Object.values(data.syllabus)) {
          for (const paper of Object.values(stage)) {
            for (const mod of Object.values(paper.modules || {})) {
              total += mod.progress || 0;
              count++;
            }
          }
        }
        return count > 0 ? Math.round(total / count) : 0;
      })()
    : 0;

  const todayHours = data
    ? (() => {
        const today = new Date().toISOString().split("T")[0];
        const log   = data.daily_logs?.find((l) => l.date === today);
        return log?.hours || 0;
      })()
    : 0;

  const weekAvgHours = data
    ? (() => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split("T")[0]);
        }
        const total = dates.reduce((sum, d) => {
          const log = data.daily_logs?.find((l) => l.date === d);
          return sum + (log?.hours || 0);
        }, 0);
        return (total / 7).toFixed(1);
      })()
    : 0;

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateProgress,
    updateProfile,
    logHours,
    overallProgress,
    todayHours,
    weekAvgHours,
  };
}