import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';

import { createNote, deleteNote, fetchNote, updateNote } from './notesApi';

export function useNote(noteId: string) {
  return useQuery({ queryKey: queryKeys.notes.detail(noteId), queryFn: () => fetchNote(noteId) });
}

export function useCreateNote(childId: string) {
  return useMutation({ mutationFn: (content: string) => createNote(childId, content) });
}

export function useUpdateNote(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => updateNote(noteId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(noteId) }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: (_result, noteId) => {
      queryClient.removeQueries({ queryKey: queryKeys.notes.detail(noteId) });
    },
  });
}
