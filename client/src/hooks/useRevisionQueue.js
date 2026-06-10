// hooks/useRevisionQueue.js
// ─── Revision Queue Hook ──────────────────────────────────────────────────────
// Stores pinned questions in localStorage so they survive page refreshes.
// Each pinned item = the full question object + subject/paper metadata.
//
// Usage in Topicwise:
//   const revQueue = useRevisionQueue();
//   revQueue.isPinned(qId)           → boolean
//   revQueue.toggle(questionObj, { subject, paper }) → pin / unpin
//   revQueue.unpin(qId)              → remove one
//   revQueue.clearQueue()            → remove all
//   revQueue.queue                   → array of pinned question objects

import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "upsc-revision-queue";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

export function useRevisionQueue() {
  const [queue, setQueue] = useState(load);

  // Set of pinned IDs for O(1) lookup
  const pinnedIds = useMemo(() => new Set(queue.map((q) => q._id || q.id)), [queue]);

  const isPinned = useCallback((id) => pinnedIds.has(id), [pinnedIds]);

  const toggle = useCallback((question, meta = {}) => {
    const id = question._id || question.id;
    setQueue((prev) => {
      let next;
      if (prev.some((q) => (q._id || q.id) === id)) {
        // unpin
        next = prev.filter((q) => (q._id || q.id) !== id);
      } else {
        // pin — merge in subject/paper metadata
        next = [{ ...question, ...meta }, ...prev];
      }
      save(next);
      return next;
    });
  }, []);

  const unpin = useCallback((id) => {
    setQueue((prev) => {
      const next = prev.filter((q) => (q._id || q.id) !== id);
      save(next);
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => {
    save([]);
    setQueue([]);
  }, []);

  return { queue, isPinned, toggle, unpin, clearQueue };
}