import type { GameSlug } from '@/components/games';
import type { QuestionFormValues } from '../schemas/contentForms';

/** Editable authoring drafts. They become real content only after the Admin reviews and saves. */
export function gameLevelDraft(template: GameSlug | undefined): QuestionFormValues {
  const option = (text: string, isCorrect = false, correctOrder = '') => ({
    text,
    isCorrect,
    correctOrder,
    image: null,
  });
  switch (template) {
    case 'letter-hunt':
      return {
        text: 'اصطد حرف الباء: ب',
        type: 'SingleChoice',
        image: null,
        options: [option('ت'), option('ب', true), option('ث'), option('ن')],
      };
    case 'number-match':
      return {
        text: 'طابق عدد النجوم: ⭐ ⭐ ⭐',
        type: 'SingleChoice',
        image: null,
        options: [option('٢'), option('٤'), option('٣', true), option('٥')],
      };
    case 'memory-sequence':
      return {
        text: 'رتّب مراحل نمو النبتة: البذرة، ثم النبتة، ثم الشجرة.',
        type: 'Sequence',
        image: null,
        options: [
          option('🌳 الشجرة', false, '3'),
          option('🌰 البذرة', false, '1'),
          option('🌱 النبتة', false, '2'),
        ],
      };
    case 'focus-challenge':
    case 'spot-it':
    default:
      return {
        text: 'ابحث عن كل القطط 🐱 في اللوحة.',
        type: 'MultiSelect',
        image: null,
        options: ['🐯', '🐺', '🦁', '🐔', '🐱', '🦊', '🐱', '🐷', '🐱', '🦄', '🐼', '🐶'].map(
          (text) => option(text, text === '🐱'),
        ),
      };
  }
}
