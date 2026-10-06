# Integration — Chat & notifications

Contracts: Swagger `/api/Chats/*` (`ConversationResponse`, `MessageResponse`, `ChatUserResponse`,
`SendMessageRequest` are documented). Nothing below has been live-verified (no working account).

| Feature                | API                                                        | UI                                     | Integration                                                              | Tests (MSW)                       | Status                         |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ | --------------------------------- | ------------------------------ |
| Conversation list      | `GET Chats/conversations`                                  | list + per-conversation unread, states | query, polled every 30 s                                                 | list, unread badge, error + retry | IMPLEMENTED, NOT LIVE-VERIFIED |
| Open thread            | `GET Chats?conversationId=&take=30`                        | bubbles, day separators, loading/error | query per conversation                                                   | open thread                       | IMPLEMENTED, NOT LIVE-VERIFIED |
| Older messages         | `GET Chats/messages/old?conversationId=&beforeId=&take=30` | "تحميل رسائل أقدم"                     | merged by id, hidden when a page < 30                                    | load older                        | IMPLEMENTED, NOT LIVE-VERIFIED |
| New messages           | `GET Chats/messages/new?conversationId=&afterId=&take=30`  | appear in the open thread              | polling every 7 s while visible; cleared on unmount                      | fake-timer polling                | IMPLEMENTED, NOT LIVE-VERIFIED |
| Send                   | `POST Chats/send { conversationId, receiverId, text }`     | composer (Enter / Shift+Enter)         | optimistic bubble → replaced by server message; rollback + draft restore | body, no duplicate, failure       | IMPLEMENTED, NOT LIVE-VERIFIED |
| New conversation       | `GET Chats/users` + send with `conversationId: null`       | picker with client-side search         | draft thread → switches to the server conversation id                    | null id then real id              | IMPLEMENTED, NOT LIVE-VERIFIED |
| Seen state             | `POST Chats/mark-conversation-seen?conversationId=`        | row unread cleared                     | on open + when polling brings incoming messages; refreshes unread count  | seen called                       | IMPLEMENTED, NOT LIVE-VERIFIED |
| Unread badge (sidebar) | `GET Chats/unread-count`                                   | nav badge                              | polled every 30 s (not in the Super Admin area)                          | badge from API                    | IMPLEMENTED, NOT LIVE-VERIFIED |
| Real-time (SignalR)    | only `wss://localhost:7256/chatHub`, no methods/events     | —                                      | not implemented — polling instead                                        | —                                 | BLOCKED BY BACKEND             |
| Notifications          | none                                                       | disabled bell "الإشعارات (قريباً)"     | mock notifications removed from production code                          | bell disabled                     | BLOCKED BY BACKEND             |

## Assumptions to verify live

- `ConversationResponse.receiverId` / `receiverName` describe the **other participant** from the
  signed-in user's point of view.
- Own vs received bubbles compare `senderId` with the session user id. The login response may not
  include an id (NOT LIVE-VERIFIED); then a message counts as ours when its sender is not the other
  participant.
- `GET Chats?receiverId=` for a pair without a conversation returns an empty list (or messages of
  the existing conversation).
- `createdAt` is parsed with `Date` (ISO); ordering ties are broken by id.
- Role labels in the contact picker come from `normalizeRole`; unknown role values show no label.

## Gaps

- Hub URL, methods and events are undocumented → no real-time delivery, typing or presence.
- No search parameter on `Chats/users` (filtered client-side).
- No notifications API.
