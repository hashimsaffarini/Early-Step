/** DOM id of a conversation's list button (focus returns here from the thread on mobile). */
export function getConversationButtonId(conversationId: string): string {
  return `conversation-button-${conversationId}`;
}

export const THREAD_TITLE_ID = 'chat-thread-title';
