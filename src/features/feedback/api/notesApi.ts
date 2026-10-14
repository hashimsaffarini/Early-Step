import { httpClient } from '@/services/http/httpClient';

/**
 * Teacher feedback notes (Swagger): `POST Teacher/children/{childId}/notes { content }`,
 * `PUT { content } / DELETE Teacher/notes/{noteId}`; the child's notes are listed by
 * `GET Teacher/children/{childId}/feedbacks` (`services/api/teacherFeedback.ts`). Teacher-only
 * writes, NOT LIVE-VERIFIED (no usable Teacher account).
 */
export async function createNote(childId: string, content: string): Promise<void> {
  await httpClient.post(`Teacher/children/${encodeURIComponent(childId)}/notes`, { content });
}

export async function updateNote(noteId: string, content: string): Promise<void> {
  await httpClient.put(`Teacher/notes/${encodeURIComponent(noteId)}`, { content });
}

export async function deleteNote(noteId: string): Promise<void> {
  await httpClient.delete(`Teacher/notes/${encodeURIComponent(noteId)}`);
}
