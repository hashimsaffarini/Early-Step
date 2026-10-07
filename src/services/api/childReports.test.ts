import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { signInAs } from '@/test/session';

import { fetchChildReports } from './childReports';

const CHILD = 'c0000000-0000-4000-8000-000000000001';
const REPORT = {
  id: 'r-1',
  childId: CHILD,
  childName: 'يوسف',
  specialistId: 's-1',
  specialistName: 'أ. ليلى حسن',
  title: 'تقرير',
  weaknesses: 'أ',
  recommendations: 'ب',
  createdAt: '2026-10-07T10:00:00Z',
};

describe('fetchChildReports (live contract)', () => {
  beforeEach(() => {
    signInAs('Parent');
  });

  it('accepts the single report object the backend returns', async () => {
    server.use(http.get(apiUrl(`Reports/child/${CHILD}`), () => HttpResponse.json(REPORT)));
    const reports = await fetchChildReports(CHILD);
    expect(reports).toHaveLength(1);
    expect(reports[0]?.authorName).toBe('أ. ليلى حسن');
  });

  it('still accepts an array (requested from the backend)', async () => {
    server.use(
      http.get(apiUrl(`Reports/child/${CHILD}`), () => HttpResponse.json([REPORT, REPORT])),
    );
    expect(await fetchChildReports(CHILD)).toHaveLength(2);
  });

  it('maps the "no reports" 404 to an empty list but keeps other 404s as errors', async () => {
    server.use(
      http.get(apiUrl(`Reports/child/${CHILD}`), () =>
        HttpResponse.json({ message: ' لا يوجد تقرير .' }, { status: 404 }),
      ),
    );
    expect(await fetchChildReports(CHILD)).toEqual([]);

    server.use(
      http.get(apiUrl(`Reports/child/${CHILD}`), () =>
        HttpResponse.json({ message: 'الطفل غير موجود.' }, { status: 404 }),
      ),
    );
    await expect(fetchChildReports(CHILD)).rejects.toThrow('الطفل غير موجود.');
  });
});
