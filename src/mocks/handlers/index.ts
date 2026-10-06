import { assessmentsHandlers } from './assessments';
import { authHandlers } from './auth';
import { chatHandlers } from './chat';
import { childrenHandlers } from './children';
import { contentHandlers } from './content';
import { reportsHandlers } from './reports';
import { staffHandlers } from './staff';
import { trainingPlansHandlers } from './trainingPlans';

/** Every mock handler. Each domain owns its file. */
export const handlers = [
  ...authHandlers,
  ...childrenHandlers,
  ...contentHandlers,
  ...assessmentsHandlers,
  ...trainingPlansHandlers,
  ...reportsHandlers,
  ...staffHandlers,
  ...chatHandlers,
];
