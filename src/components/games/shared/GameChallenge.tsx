import { SpotIt } from '../spot-it/SpotIt';
import { FocusChallenge } from '../focus-challenge/FocusChallenge';
import { LetterHunt } from '../letter-hunt/LetterHunt';
import { MemorySequence } from '../memory-sequence/MemorySequence';
import { NumberMatch } from '../number-match/NumberMatch';
import { engineFor } from '../registry';
import type { ChallengeProps, GameTemplate } from '../types';

/** Renders one real question with the engine `engineFor` picks for the template. */
export function GameChallenge({ template, ...props }: ChallengeProps & { template: GameTemplate }) {
  switch (engineFor(template, props.question.type)) {
    case 'spot-it':
      return <SpotIt {...props} />;
    case 'letter-hunt':
      return <LetterHunt {...props} />;
    case 'number-match':
      return <NumberMatch {...props} />;
    case 'memory-sequence':
      return <MemorySequence {...props} />;
    case 'focus-challenge':
      return <FocusChallenge {...props} />;
  }
}
