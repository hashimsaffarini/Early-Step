import { childFormSchema } from './childForm';

describe('childFormSchema', () => {
  it('accepts a whole-number age and an Arabic gender value', () => {
    expect(childFormSchema.parse({ name: ' سارة ', age: '6', gender: 'بنت' })).toEqual({
      name: 'سارة',
      age: 6,
      gender: 'بنت',
    });
  });

  it.each(['0', '1', '11', '19', '5.5', 'abc'])('rejects age %s (range 2–10)', (age) => {
    const result = childFormSchema.safeParse({ name: 'سارة', age, gender: 'ولد' });
    expect(result.success).toBe(false);
  });

  it.each(['2', '10'])('accepts the boundary age %s', (age) => {
    expect(childFormSchema.safeParse({ name: 'سارة', age, gender: 'ولد' }).success).toBe(true);
  });

  it('explains the 2–10 range in Arabic', () => {
    const result = childFormSchema.safeParse({ name: 'سارة', age: '11', gender: 'ولد' });
    expect(result.error?.issues[0]?.message).toBe(
      'يجب أن يكون العمر عدداً صحيحاً من 2 إلى 10 سنوات',
    );
  });

  it('rejects unknown gender values', () => {
    expect(childFormSchema.safeParse({ name: 'سارة', age: '5', gender: 'girl' }).success).toBe(
      false,
    );
  });
});
