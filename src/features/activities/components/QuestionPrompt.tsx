import { Fragment } from 'react';

import type { PromptPart } from '../data/tests';

export interface QuestionPromptProps {
  parts: readonly PromptPart[];
}

/** Renders prompt parts; LTR fragments (math, sequences) are isolated so they never reorder. */
export function QuestionPrompt({ parts }: QuestionPromptProps) {
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 ? ' ' : null}
          {typeof part === 'string' ? part : <bdi dir="ltr">{part.ltr}</bdi>}
        </Fragment>
      ))}
    </>
  );
}
