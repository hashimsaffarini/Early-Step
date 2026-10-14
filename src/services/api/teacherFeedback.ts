import { z } from 'zod';

import { httpClient } from '@/services/http/httpClient';

/**
 * Teacher feedback notes on a child (shared by the teacher notes page and the specialist's child
 * profile). `GET Teacher/children/{childId}/feedbacks` — added 2026-10-14; live: Specialist 200
 * (their children), 404 `{ message }` for a child that is not theirs, Parent / Admin / Super Admin
 * 403. The Teacher could not be verified (no usable Teacher account). Every list returned `[]`, so
 * the item fields are NOT LIVE-VERIFIED and are read leniently, like `Teacher/notes/{id}`.
 */
const feedbackSchema = z.looseObject({
  id: z.string().nullish(),
  noteId: z.string().nullish(),
  content: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export interface TeacherFeedback {
  /** Null when the server sends no id (the note can then be read but not edited). */
  id: string | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export async function fetchChildFeedbacks(childId: string): Promise<TeacherFeedback[]> {
  const { data } = await httpClient.get<unknown>(
    `Teacher/children/${encodeURIComponent(childId)}/feedbacks`,
  );
  return z
    .array(feedbackSchema)
    .parse(data)
    .map((dto) => ({
      id: dto.id ?? dto.noteId ?? null,
      content: dto.content?.trim() ?? '',
      createdAt: dto.createdAt ?? null,
      updatedAt: dto.updatedAt ?? null,
    }));
}
