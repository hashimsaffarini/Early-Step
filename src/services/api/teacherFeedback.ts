import { z } from 'zod';

import { httpClient } from '@/services/http/httpClient';

/**
 * Teacher feedback notes on a child (shared by the teacher notes page and the specialist's child
 * profile). `GET Teacher/children/{childId}/feedbacks` — added 2026-10-14; live: Specialist 200
 * (their children), 404 `{ message }` for a child that is not theirs, Parent / Admin / Super Admin
 * 403. Items VERIFIED LIVE 2026-10-15 (Specialist read): `{ id, childId, childName, teacherId,
 * teacherName, content, createdAt }`. The Teacher's own calls are not verified (login bug).
 */
const feedbackSchema = z.looseObject({
  id: z.string(),
  teacherName: z.string().nullish(),
  content: z.string().nullish(),
  createdAt: z.string().nullish(),
});

export interface TeacherFeedback {
  id: string;
  teacherName: string | null;
  content: string;
  createdAt: string | null;
}

export async function fetchChildFeedbacks(childId: string): Promise<TeacherFeedback[]> {
  const { data } = await httpClient.get<unknown>(
    `Teacher/children/${encodeURIComponent(childId)}/feedbacks`,
  );
  return z
    .array(feedbackSchema)
    .parse(data)
    .map((dto) => ({
      id: dto.id,
      // An empty name is treated as missing.
      teacherName: dto.teacherName?.trim() ? dto.teacherName.trim() : null,
      content: dto.content?.trim() ?? '',
      createdAt: dto.createdAt ?? null,
    }));
}
