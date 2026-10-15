import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';

import { createNote, deleteNote, updateNote } from './notesApi';

/** Every note write refreshes the child's list (`Teacher/children/{childId}/feedbacks`). */
function useRefreshChildNotes(childId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.byChild(childId) });
}

export function useCreateNote(childId: string) {
  const refresh = useRefreshChildNotes(childId);
  return useMutation({
    mutationFn: (content: string) => createNote(childId, content),
    onSuccess: refresh,
  });
}

export function useUpdateNote(childId: string, noteId: string) {
  const refresh = useRefreshChildNotes(childId);
  return useMutation({
    mutationFn: (content: string) => updateNote(noteId, content),
    onSuccess: refresh,
  });
}

export function useDeleteNote(childId: string) {
  const refresh = useRefreshChildNotes(childId);
  return useMutation({ mutationFn: (noteId: string) => deleteNote(noteId), onSuccess: refresh });
}
