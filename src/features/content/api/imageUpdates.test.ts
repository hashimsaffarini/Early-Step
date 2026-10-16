import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { signInAs } from '@/test/session';

import { updateActivity, updateOption, updateQuestionInfo } from './contentApi';

const png = () => new File(['png'], 'new.png', { type: 'image/png' });

function capture(method: 'put', path: string) {
  const received: { form?: FormData } = {};
  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      received.form = await request.formData();
      return HttpResponse.json({});
    }),
  );
  return received;
}

describe('image replacement payloads (multipart, Swagger field names)', () => {
  beforeEach(() => {
    signInAs('Admin');
  });

  it('activity edit sends the new Icon; without a file the field is omitted (image kept)', async () => {
    const received = capture('put', 'Admin/activities/:type/:id');
    const base = { title: 'ت', description: 'و', slug: 'e2e', categoryId: 'c' };
    await updateActivity('test', 'a1', { ...base, icon: png() });
    expect(received.form?.get('Icon')).toMatchObject({ type: 'image/png', size: 3 });

    await updateActivity('test', 'a1', { ...base, icon: null });
    expect(received.form?.has('Icon')).toBe(false);
  });

  it('question edit sends QuestionImage', async () => {
    const received = capture('put', 'Admin/questions/:questionId/info');
    await updateQuestionInfo('q1', { text: 'س', image: png(), type: 'SingleChoice' });
    expect(received.form?.get('QuestionImage')).toMatchObject({ type: 'image/png', size: 3 });
  });

  it('option edit sends OptionImage with its current correctness', async () => {
    const received = capture('put', 'Admin/question-options/:optionId');
    await updateOption('o1', {
      text: 'أ',
      image: png(),
      order: 2,
      isCorrect: true,
      correctOrder: null,
    });
    expect(received.form?.get('OptionImage')).toMatchObject({ type: 'image/png', size: 3 });
    expect(received.form?.get('IsCorrect')).toBe('true');
    expect(received.form?.get('Order')).toBe('2');
  });
});
