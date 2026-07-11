import { useState, useEffect, useCallback } from "react";
import { getUserData, updateSyllabusProgress, logDailyHours, bulkUpdateSyllabus } from "../utils/api";
import { SYLLABUS, deepClone } from "../data/PYQs/syllabusData";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { getISTDateString } from "../utils/dateUtils";
import timerStore from "./timerStore";


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
          profile:            res.profile,
          syllabus:           mergeProgressIntoSyllabus(res.syllabus_progress || {}),
          answers:            res.answers            || [],
          daily_logs:         res.daily_logs         || [],
          spaced_repetition:  res.spaced_repetition  || { queue: [] },
          question_attempts:  res.question_attempts  || [],
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

  useEffect(() => {
    if (!enabled || !token) {
      disconnectSocket();
      timerStore.detachSocket();
      return;
    }

    const socket = connectSocket(token);
    if (!socket) return;
    timerStore.attachSocket(socket);

    const onLogUpdated = ({ log, streak, longest_streak }) => {
      setData((prev) => {
        if (!prev) return prev;
        const logs = Array.isArray(prev.daily_logs) ? [...prev.daily_logs] : [];
        const idx = logs.findIndex((l) => l.date === log.date);
        if (idx >= 0) logs[idx] = log; else logs.push(log);
        return {
          ...prev,
          daily_logs: logs,
          profile: { ...prev.profile, streak, longest_streak },
        };
      });
    };

    const onSyllabusUpdated = ({ syllabus_progress }) => {
      setData((prev) => (prev ? { ...prev, syllabus: mergeProgressIntoSyllabus(syllabus_progress || {}) } : prev));
    };

    socket.on("dashboard:log-updated", onLogUpdated);
    socket.on("dashboard:syllabus-updated", onSyllabusUpdated);

    return () => {
      socket.off("dashboard:log-updated", onLogUpdated);
      socket.off("dashboard:syllabus-updated", onSyllabusUpdated);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token]);

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
          // completedTopics was being dropped here on every fetch/refetch/
          // socket sync, silently resetting every checked topic tag back
          // to unchecked even though progress % and status were correct.
          base[stage][paperId].modules[modName].completedTopics = saved.completedTopics ?? [];
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
      syllabus:           deepClone(SYLLABUS),
      answers:            [],
      daily_logs:         [],
      spaced_repetition:  { queue: [] },
      question_attempts:  [],
    };
  }

  // ─── Optimistic syllabus update → PATCH backend ──────────────────────────────
  const updateProgress = useCallback(async (stage, paper, moduleName, progress, statusOrState, completedTopics) => {
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
                  ...(completedTopics !== undefined ? { completedTopics } : {}),
                },
              },
            },
          },
        },
      };
    });
    try {
      await updateSyllabusProgress(stage, paper, moduleName, progress, statusOrState, completedTopics);
    } catch (e) {
      setError(`Sync failed: ${e.message}`);
      fetchData(token);
    }
  }, [fetchData, token]);

  // ─── Bulk syllabus update - single request for multiple modules ─────────────
  // Used by useQuestionAttempts when several topics cross the threshold at once.
  const bulkUpdateProgress = useCallback(async (updates) => {
    // Optimistic local update
    setData((prev) => {
      if (!prev) return prev;
      let syllabus = prev.syllabus;
      for (const { stage, paper, module: moduleName, progress, state: statusOrState, completedTopics } of updates) {
        const mod = syllabus?.[stage]?.[paper]?.modules?.[moduleName];
        if (!mod) continue;
        syllabus = {
          ...syllabus,
          [stage]: {
            ...syllabus[stage],
            [paper]: {
              ...syllabus[stage][paper],
              modules: {
                ...syllabus[stage][paper].modules,
                [moduleName]: {
                  ...mod,
                  progress,
                  ...(statusOrState ? { status: statusOrState, state: statusOrState } : {}),
                  ...(completedTopics !== undefined ? { completedTopics } : {}),
                },
              },
            },
          },
        };
      }
      return { ...prev, syllabus };
    });
    try {
      await bulkUpdateSyllabus(updates);
    } catch (e) {
      setError(`Bulk sync failed: ${e.message}`);
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
        const today = getISTDateString();
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
          dates.push(getISTDateString(d));
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
    bulkUpdateProgress,
    updateProfile,
    logHours,
    overallProgress,
    todayHours,
    weekAvgHours,
  };
}