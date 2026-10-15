import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { signInAs } from '@/test/session';

import { fetchAssessmentResult } from './assessmentResult';

const CHILD = 'c0000000-0000-4000-8000-000000000001';

describe('fetchAssessmentResult (not completed vs. real errors)', () => {
  beforeEach(() => {
    signInAs('Specialist');
  });

  it('maps the live "not completed" 404 to null', async () => {
    server.use(
      http.get(
        apiUrl(`initial-assessment/${CHILD}/result`),
        () => new HttpResponse('No completed assessment found for this child.', { status: 404 }),
      ),
    );
    expect(await fetchAssessmentResult(CHILD)).toBeNull();
  });

  it('keeps any other 404 as an error (never shown as "not completed")', async () => {
    server.use(
      http.get(apiUrl(`initial-assessment/${CHILD}/result`), () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
    );
    await expect(fetchAssessmentResult(CHILD)).rejects.toMatchObject({ status: 404 });
  });
});
