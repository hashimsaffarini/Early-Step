import { useCallback, useState } from 'react';

/**
 * Ids of notes this teacher created for a child **in this browser session** (sessionStorage,
 * ids only). The API cannot list a child's notes, so this is the only honest way to show them
 * again. Keyed by user and child, so another account never sees them.
 */
function storageKey(userId: string, childId: string): string {
  return `early-step.session-notes.${userId}.${childId}`;
}

function read(key: string): string[] {
  try {
    const raw = window.sessionStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: readonly string[]): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode): the list still works for this page view.
  }
}

export function useSessionNoteIds(userId: string, childId: string) {
  const key = storageKey(userId, childId);
  const [ids, setIds] = useState<string[]>(() => read(key));

  const add = useCallback(
    (id: string) => {
      setIds((current) => {
        const next = [id, ...current.filter((value) => value !== id)];
        write(key, next);
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      setIds((current) => {
        const next = current.filter((value) => value !== id);
        write(key, next);
        return next;
      });
    },
    [key],
  );

  return { ids, add, remove };
}
