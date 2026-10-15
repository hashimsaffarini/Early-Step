import {
  childListItemSchema,
  mapChildSummary,
  type ChildGenderValue,
  type ChildSummary,
} from '@/services/api/childrenLists';
import { toFormData } from '@/services/http/formData';
import { httpClient } from '@/services/http/httpClient';

/**
 * Parent child management (Swagger tag "Parent"). Paths are relative to `VITE_API_BASE_URL`.
 * Request bodies are documented (`multipart/form-data`: `FullName`, `Age` int32, `Gender`
 * `ولد`|`بنت`). VERIFIED LIVE — WRITE (disposable `E2E Test` children, cleanup verified); child
 * objects are read with the shared child schema.
 */
export const CHILDREN_PATHS = {
  collection: 'Parent',
  child: (childId: string) => `Parent/${encodeURIComponent(childId)}`,
} as const;

export interface ChildInput {
  fullName: string;
  age: number;
  gender: ChildGenderValue;
}

function toChildForm(input: ChildInput): FormData {
  return toFormData({ FullName: input.fullName, Age: input.age, Gender: input.gender });
}

/** `GET Parent/{childId}` — the parent's own child (403/404 for anyone else's). */
export async function fetchParentChild(childId: string): Promise<ChildSummary> {
  const { data } = await httpClient.get<unknown>(CHILDREN_PATHS.child(childId));
  return mapChildSummary(childListItemSchema.parse(data));
}

/** `POST Parent` */
export async function createChild(input: ChildInput): Promise<void> {
  await httpClient.post(CHILDREN_PATHS.collection, toChildForm(input));
}

/** `PATCH Parent/{id}` */
export async function updateChild(childId: string, input: ChildInput): Promise<void> {
  await httpClient.patch(CHILDREN_PATHS.child(childId), toChildForm(input));
}

/** `DELETE Parent/{id}` */
export async function deleteChild(childId: string): Promise<void> {
  await httpClient.delete(CHILDREN_PATHS.child(childId));
}
