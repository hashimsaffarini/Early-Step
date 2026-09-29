/**
 * Neutral, non-diagnostic stage of a child's journey in the product (UI-level).
 * TBD: map to real backend fields when the API is integrated.
 */
export type ChildJourneyStatus =
  'assessment-pending' | 'assessment-completed' | 'training-plan-active';

/** UI gender values (Replit: ولد / بنت). Backend values TBD (API docs show Arabic strings). */
export type ChildGender = 'boy' | 'girl';
