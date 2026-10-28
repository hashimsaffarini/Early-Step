import { mapChildSummary } from './childrenLists';

describe('child age at the API boundary', () => {
  it.each([0, 1, -1, 1.5, 11])('does not display unsupported age %s as a real child age', (age) => {
    expect(mapChildSummary({ id: 'child', age }).age).toBeNull();
  });
  it.each([2, 5, 10])('preserves supported age %s', (age) => {
    expect(mapChildSummary({ id: 'child', age }).age).toBe(age);
  });
});
