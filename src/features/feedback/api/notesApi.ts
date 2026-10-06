import { z } from 'zod';

import { httpClient } from '@/services/http/httpClient';

/**
 * Teacher feedback notes (Swagger): `POST Teacher/children/{childId}/notes { content }`,
 * `GET / PUT { content } / DELETE Teacher/notes/{noteId}`. Response shapes are undocumented —
 * read leniently (NOT LIVE-VERIFIED). There is **no endpoint that lists a child's notes**
 * (BLOCKED BY BACKEND), so earlier notes cannot be shown.
 */
const noteSchema = z.looseObject({
  id: z.string().nullish(),
  noteId: z.string().nullish(),
  content: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export interface TeacherNote {
  id: string;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The created note's id, when the server returns one (object `{ id }` or a bare id string). */
export function readCreatedNoteId(data: unknown): string | null {
  if (typeof data === 'string') return GUID.test(data.trim()) ? data.trim() : null;
  const parsed = noteSchema.safeParse(data);
  return parsed.success ? (parsed.data.id ?? parsed.data.noteId ?? null) : null;
}

export async function createNote(childId: string, content: string): Promise<string | null> {
  const { data } = await httpClient.post<unknown>(
    `Teacher/children/${encodeURIComponent(childId)}/notes`,
    { content },
  );
  return readCreatedNoteId(data);
}

export async function fetchNote(noteId: string): Promise<TeacherNote> {
  const { data } = await httpClient.get<unknown>(`Teacher/notes/${encodeURIComponent(noteId)}`);
  const dto = noteSchema.parse(data);
  return {
    id: dto.id ?? dto.noteId ?? noteId,
    content: dto.content ?? '',
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export async function updateNote(noteId: string, content: string): Promise<void> {
  await httpClient.put(`Teacher/notes/${encodeURIComponent(noteId)}`, { content });
}

export async function deleteNote(noteId: string): Promise<void> {
  await httpClient.delete(`Teacher/notes/${encodeURIComponent(noteId)}`);
}
