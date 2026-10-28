import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { signInAs } from '@/test/session';

import { saveLocalMedia, readLocalMedia, mediaKeys } from '@/services/media/localMedia';
import { LETTERS_TEST_ID } from '@/test/contentTestUtils';
import {
  createQuestion,
  fetchActivity,
  updateActivity,
  updateOption,
  updateQuestionInfo,
} from './contentApi';

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
  it('binds new question and choice uploads to the real ids returned after saving', async () => {
    const questionImage = png();
    const choiceImage = png();
    await createQuestion(LETTERS_TEST_ID, {
      text: 'سؤال مصور جديد',
      image: questionImage,
      type: 'SingleChoice',
      options: [
        { text: 'صورة جديدة', image: choiceImage, isCorrect: true, correctOrder: null },
        { text: 'خيار آخر', image: null, isCorrect: false, correctOrder: null },
      ],
    });
    const detail = await fetchActivity('test', LETTERS_TEST_ID);
    const question = detail.questions.find((item) => item.text === 'سؤال مصور جديد');
    const choice = question?.options.find((item) => item.text === 'صورة جديدة');
    if (!question || !choice) throw new Error('saved ids missing');
    expect(await readLocalMedia(mediaKeys.question(question.id))).toBe(questionImage);
    expect(await readLocalMedia(mediaKeys.option(choice.id))).toBe(choiceImage);
  });

  it('does not replace the saved local image if the server rejects the upload', async () => {
    const previous = png();
    await saveLocalMedia(mediaKeys.option('o1'), previous);
    server.use(
      http.put(apiUrl('Admin/question-options/:optionId'), () =>
        HttpResponse.json({ message: 'رفض' }, { status: 400 }),
      ),
    );
    await expect(
      updateOption('o1', {
        text: 'أ',
        image: png(),
        order: 1,
        isCorrect: true,
        correctOrder: null,
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(await readLocalMedia(mediaKeys.option('o1'))).toBe(previous);
  });
  it('also binds images when create returns a single question rather than the whole activity', async () => {
    const file = png();
    server.use(
      http.post(apiUrl('Admin/activities/:id/questions'), () =>
        HttpResponse.json({
          id: 'saved-question',
          questionText: 'سؤال بصورة',
          type: 'SingleChoice',
          options: [
            { id: 'saved-option', optionText: 'أ', isCorrect: true, order: 1 },
            { id: 'saved-other', optionText: 'ب', isCorrect: false, order: 2 },
          ],
        }),
      ),
    );
    await createQuestion(LETTERS_TEST_ID, {
      text: 'سؤال بصورة',
      image: file,
      type: 'SingleChoice',
      options: [
        { text: 'أ', image: file, isCorrect: true, correctOrder: null },
        { text: 'ب', image: null, isCorrect: false, correctOrder: null },
      ],
    });
    expect(await readLocalMedia(mediaKeys.question('saved-question'))).toBe(file);
    expect(await readLocalMedia(mediaKeys.option('saved-option'))).toBe(file);
  });
  it('does not guess image ownership for indistinguishable choices when Order is missing', async () => {
    server.use(
      http.post(apiUrl('Admin/activities/:id/questions'), () =>
        HttpResponse.json({
          id: 'ambiguous',
          questionText: 'صور',
          type: 'MultiSelect',
          options: [
            { id: 'ambiguous-a', optionText: '', order: 0, isCorrect: true },
            { id: 'ambiguous-b', optionText: '', order: 0, isCorrect: true },
          ],
        }),
      ),
    );
    await createQuestion(LETTERS_TEST_ID, {
      text: 'صور',
      image: null,
      type: 'MultiSelect',
      options: [
        { text: '', image: png(), isCorrect: true, correctOrder: null },
        { text: '', image: png(), isCorrect: true, correctOrder: null },
      ],
    });
    expect(await readLocalMedia(mediaKeys.option('ambiguous-a'))).toBeNull();
    expect(await readLocalMedia(mediaKeys.option('ambiguous-b'))).toBeNull();
  });
});
