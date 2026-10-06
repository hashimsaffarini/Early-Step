import { assessmentsHandlers } from './assessments';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';
import { childrenHandlers } from './children';
import { contentHandlers } from './content';
import { reportsHandlers } from './reports';
import { staffHandlers } from './staff';
import { trainingPlansHandlers } from './trainingPlans';

/**
 * Every mock handler. Each domain owns its file. Order matters: MSW uses the first match, so
 * specific paths (`.../activities/summary`) must come before patterns (`.../activities/:id`).
 */
export const handlers = [
  ...authHandlers,
  ...childrenHandlers,
  ...contentHandlers,
  ...trainingPlansHandlers,
  ...assessmentsHandlers,
  ...reportsHandlers,
  ...staffHandlers,
  ...chatHandlers,
];
