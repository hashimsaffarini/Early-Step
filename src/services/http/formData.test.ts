import { toFormData } from './formData';

describe('toFormData', () => {
  it('flattens nested arrays with ASP.NET indexed keys and skips empty values', () => {
    const image = new Blob(['x'], { type: 'image/png' });
    const data = toFormData({
      QuestionText: 'سؤال',
      Type: 'SingleChoice',
      QuestionImage: null,
      Options: [
        { OptionText: 'أ', IsCorrect: true, Order: 1, OptionImage: image },
        { OptionText: 'ب', IsCorrect: false, Order: 2 },
      ],
    });

    expect(data.get('QuestionText')).toBe('سؤال');
    expect(data.has('QuestionImage')).toBe(false);
    expect(data.get('Options[0].IsCorrect')).toBe('true');
    expect(data.get('Options[1].Order')).toBe('2');
    expect(data.get('Options[0].OptionImage')).toBeInstanceOf(Blob);
  });
});
