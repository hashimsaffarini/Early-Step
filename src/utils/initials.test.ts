import { getNameInitial } from './initials';

describe('getNameInitial', () => {
  it('returns the first letter of the name', () => {
    expect(getNameInitial('محمد أحمد')).toBe('م');
  });

  it('skips a leading honorific', () => {
    expect(getNameInitial('أ. سارة خالد')).toBe('س');
    expect(getNameInitial('د. ليلى حسن')).toBe('ل');
  });

  it('keeps names that merely start with أ', () => {
    expect(getNameInitial('أحمد')).toBe('أ');
  });
});
