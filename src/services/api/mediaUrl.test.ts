import { resolveMediaUrl } from './mediaUrl';

describe('resolveMediaUrl', () => {
  it('resolves server-relative uploads against the API origin', () => {
    expect(resolveMediaUrl('/uploads/a.png')).toBe('https://api.test/uploads/a.png');
  });

  it('rejects unsafe schemes and empty values', () => {
    expect(resolveMediaUrl('javascript:alert(1)')).toBeNull();
    expect(resolveMediaUrl(null)).toBeNull();
  });
});
