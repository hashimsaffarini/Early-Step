import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { signInAs } from '@/test/session';

import { fetchChildReport } from './childReports';

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

describe('fetchChildReport (one report per child)', () => {
  beforeEach(() => {
    signInAs('Parent');
  });

  it('returns the single report object the backend sends', async () => {
    server.use(http.get(apiUrl(`Reports/child/${CHILD}`), () => HttpResponse.json(REPORT)));
    const report = await fetchChildReport(CHILD);
    expect(report?.id).toBe('r-1');
    expect(report?.authorName).toBe('أ. ليلى حسن');
  });

  it('maps the "no report" 404 to null but keeps other 404s as errors', async () => {
    server.use(
      http.get(apiUrl(`Reports/child/${CHILD}`), () =>
        HttpResponse.json({ message: ' لا يوجد تقرير .' }, { status: 404 }),
      ),
    );
    expect(await fetchChildReport(CHILD)).toBeNull();

    server.use(
      http.get(apiUrl(`Reports/child/${CHILD}`), () =>
        HttpResponse.json({ message: 'الطفل غير موجود.' }, { status: 404 }),
      ),
    );
    await expect(fetchChildReport(CHILD)).rejects.toThrow('الطفل غير موجود.');
  });
});
