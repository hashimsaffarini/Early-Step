/** TEMPORARY MOCK DATA — teacher notes table (fictional). Starts empty: the API cannot list notes. */
import { registerMockTable } from '../db';

export interface MockNoteRow {
  id: string;
  childId: string;
  teacherId: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export const mockNotes: MockNoteRow[] = [];

registerMockTable(() => {
  mockNotes.splice(0, mockNotes.length);
});
