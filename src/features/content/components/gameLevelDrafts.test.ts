import { GAME_SLUGS } from '@/components/games';
import { questionSchema } from '../schemas/contentForms';
import { gameLevelDraft } from './gameLevelDrafts';

describe('editable game content', () => {
  it.each(GAME_SLUGS)('provides a valid level with options and answers for %s', (template) => {
    const draft = gameLevelDraft(template);
    expect(questionSchema.safeParse(draft).success).toBe(true);
    expect(draft.options.length).toBeGreaterThanOrEqual(2);
  });
  it('keeps each target as a distinct option, with distractors, for visual search', () => {
    const draft = gameLevelDraft('spot-it');
    expect(draft.type).toBe('MultiSelect');
    expect(draft.options.filter((option) => option.isCorrect)).toHaveLength(3);
    expect(draft.options.some((option) => !option.isCorrect)).toBe(true);
  });
});
