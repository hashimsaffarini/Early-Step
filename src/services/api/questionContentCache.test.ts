import {
  correctedQuestionText,
  forgetOptionContent,
  recalledQuestionContent,
  rememberQuestionContent,
} from './questionContentCache';

const question = () => ({
  id: 'q-real',
  text: 'ما الحرف الأول؟',
  type: 'SingleChoice',
  imageUrl: null,
  options: [
    { id: 'real-d', text: 'د', imageUrl: null, isCorrect: true },
    { id: 'real-b', text: 'ب', imageUrl: null, isCorrect: false },
  ],
});

describe('actual question-content fallback', () => {
  it('stores actual options without leaking correct answers or other admin fields', () => {
    rememberQuestionContent(question());
    const cached = recalledQuestionContent('q-real');
    expect(cached?.options.map((option) => option.id)).toEqual(['real-d', 'real-b']);
    expect(JSON.stringify(cached)).not.toContain('isCorrect');
  });
  it('removes explicitly deleted choices from the fallback', () => {
    rememberQuestionContent(question());
    forgetOptionContent('real-d');
    expect(recalledQuestionContent('q-real')?.options.map((option) => option.id)).toEqual([
      'real-b',
    ]);
  });
  it('corrects only the reported missing-راء phrase', () => {
    expect(correctedQuestionText('تّب الحروف التالية لتكوين كلمة «قلم».')).toBe(
      'رتّب الحروف التالية لتكوين كلمة «قلم».',
    );
    expect(correctedQuestionText('رتّب الحروف التالية لتكوين كلمة «قلم».')).toBe(
      'رتّب الحروف التالية لتكوين كلمة «قلم».',
    );
    expect(correctedQuestionText('اكتب الحروف')).toBe('اكتب الحروف');
  });
});
