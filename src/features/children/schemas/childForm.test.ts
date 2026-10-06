import { childFormSchema } from './childForm';

describe('childFormSchema', () => {
  it('accepts a whole-number age and an Arabic gender value', () => {
    expect(childFormSchema.parse({ name: ' سارة ', age: '6', gender: 'بنت' })).toEqual({
      name: 'سارة',
      age: 6,
      gender: 'بنت',
    });
  });

  it.each(['0', '19', '5.5', 'abc'])('rejects age %s', (age) => {
    expect(childFormSchema.safeParse({ name: 'سارة', age, gender: 'ولد' }).success).toBe(false);
  });

  it('rejects unknown gender values', () => {
    expect(childFormSchema.safeParse({ name: 'سارة', age: '5', gender: 'girl' }).success).toBe(
      false,
    );
  });
});
