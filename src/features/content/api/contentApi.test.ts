import { buildQuestionForm, normalizeQuestionType } from './contentApi';

const image = new File(['x'], 'a.png', { type: 'image/png' });

describe('buildQuestionForm', () => {
  it('sends IsCorrect for single choice and omits sequence/matching fields', () => {
    const form = buildQuestionForm({
      text: 'أي كلمة تبدأ بالباء؟',
      image,
      type: 'SingleChoice',
      options: [
        { text: 'بطة', image: null, isCorrect: true, correctOrder: 3, pairKey: 'x' },
        { text: 'تفاحة', image: null, isCorrect: false, correctOrder: null, pairKey: null },
      ],
    });

    expect(form.get('QuestionText')).toBe('أي كلمة تبدأ بالباء؟');
    expect(form.get('Type')).toBe('SingleChoice');
    expect(form.get('QuestionImage')).toBeInstanceOf(File);
    expect(form.get('Options[0].OptionText')).toBe('بطة');
    expect(form.get('Options[0].IsCorrect')).toBe('true');
    expect(form.get('Options[1].IsCorrect')).toBe('false');
    expect(form.get('Options[1].Order')).toBe('2');
    expect(form.has('Options[0].CorrectOrder')).toBe(false);
    expect(form.has('Options[0].PairKey')).toBe(false);
  });

  it('sends CorrectOrder for sequence questions', () => {
    const form = buildQuestionForm({
      text: 'رتّب',
      image: null,
      type: 'Sequence',
      options: [
        { text: 'ب', image: null, isCorrect: false, correctOrder: 2, pairKey: null },
        { text: 'أ', image: null, isCorrect: false, correctOrder: 1, pairKey: null },
      ],
    });

    expect(form.has('QuestionImage')).toBe(false);
    expect(form.get('Options[0].CorrectOrder')).toBe('2');
    expect(form.get('Options[1].CorrectOrder')).toBe('1');
  });

  it('sends PairKey and option images for matching questions', () => {
    const form = buildQuestionForm({
      text: 'طابق',
      image: null,
      type: 'Matching',
      options: [
        { text: '', image, isCorrect: false, correctOrder: null, pairKey: 'أ' },
        { text: 'قطة', image: null, isCorrect: false, correctOrder: null, pairKey: 'أ' },
      ],
    });

    expect(form.has('Options[0].OptionText')).toBe(false);
    expect(form.get('Options[0].OptionImage')).toBeInstanceOf(File);
    expect(form.get('Options[0].PairKey')).toBe('أ');
  });
});

describe('normalizeQuestionType', () => {
  it('maps known values case-insensitively and rejects others', () => {
    expect(normalizeQuestionType('singlechoice')).toBe('SingleChoice');
    expect(normalizeQuestionType('Matching')).toBe('Matching');
    expect(normalizeQuestionType('Essay')).toBeNull();
  });
});
