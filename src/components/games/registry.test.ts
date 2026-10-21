import {
  buildGameSlug,
  engineFor,
  GAME_TEMPLATE_LIST,
  GAME_TEMPLATES,
  gameSlugSuffix,
  resolveGameTemplate,
} from './registry';

describe('game registry', () => {
  it('has the four templates with their slugs, Arabic names and question types', () => {
    expect(GAME_TEMPLATE_LIST.map((template) => [template.slug, template.name])).toEqual([
      ['letter-hunt', 'صيد الحروف'],
      ['number-match', 'طابق الرقم'],
      ['memory-sequence', 'تحدي الذاكرة'],
      ['focus-challenge', 'تحدي التركيز'],
    ]);
    expect(GAME_TEMPLATES['letter-hunt'].questionTypes).toEqual(['SingleChoice']);
    expect(GAME_TEMPLATES['number-match'].questionTypes).toEqual(['SingleChoice']);
    expect(GAME_TEMPLATES['memory-sequence'].questionTypes).toEqual(['Sequence']);
    expect(GAME_TEMPLATES['focus-challenge'].questionTypes).toEqual(['MultiSelect']);
  });

  it.each([
    ['letter-hunt', 'letter-hunt'],
    ['number-match', 'number-match'],
    ['memory-sequence', 'memory-sequence'],
    ['focus-challenge', 'focus-challenge'],
    ['letter-hunt-2', 'letter-hunt'],
    [' Focus-Challenge-arabic ', 'focus-challenge'],
  ])('resolves the saved slug %s to %s', (slug, expected) => {
    expect(resolveGameTemplate(slug)?.slug).toBe(expected);
  });

  it.each([null, undefined, '', 'memory-game', 'letters-test', 'letter-hunting', 'hunt-letter'])(
    'falls back (null) for %s — the generic player is used',
    (slug) => {
      expect(resolveGameTemplate(slug)).toBeNull();
    },
  );

  it('builds and splits the saved slug with an optional suffix', () => {
    expect(buildGameSlug('number-match', '')).toBe('number-match');
    expect(buildGameSlug('number-match', ' 2 ')).toBe('number-match-2');
    expect(gameSlugSuffix('number-match-2', 'number-match')).toBe('2');
    expect(gameSlugSuffix('number-match', 'number-match')).toBe('');
  });

  it("uses the template's engine for its type and the type's engine otherwise", () => {
    const letters = GAME_TEMPLATES['letter-hunt'];
    expect(engineFor(letters, 'SingleChoice')).toBe('letter-hunt');
    expect(engineFor(letters, 'Sequence')).toBe('memory-sequence');
    expect(engineFor(letters, 'MultiSelect')).toBe('focus-challenge');
    expect(engineFor(GAME_TEMPLATES['number-match'], 'SingleChoice')).toBe('number-match');
  });
});
