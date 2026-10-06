import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import type { AreaRole } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';
import { mockMessages, PARENT_TEACHER_CONVERSATION } from '@/mocks/fixtures/chat';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { CHAT_POLL_MS } from '../api/chatQueries';

import { MessagesPage } from './MessagesPage';

function renderMessages(role: AreaRole = 'Parent') {
  signInAs(role);
  return renderInRouter(
    <RoleAreaContext value={role}>
      <MessagesPage />
    </RoleAreaContext>,
  );
}

const getList = () => screen.getByRole('region', { name: 'المحادثات' });
const thread = () => screen.getByRole('list', { name: 'الرسائل' });
async function openConversation(name: RegExp) {
  await userEvent.click(await within(getList()).findByRole('button', { name }));
}

/** Records requests to an endpoint while still answering with the default mock handler. */
function spyOn(method: 'get' | 'post', path: string) {
  const calls: Request[] = [];
  server.events.on('request:start', ({ request }) => {
    if (request.method === method.toUpperCase() && new URL(request.url).pathname.endsWith(path)) {
      calls.push(request.clone());
    }
  });
  return calls;
}

// The app registers these in AuthHttpBridge (AppProviders); render helpers don't mount it.

afterEach(() => {
  server.events.removeAllListeners();
  vi.useRealTimers();
});

describe('MessagesPage — conversations', () => {
  it('lists the conversations from the API and prompts to pick one', async () => {
    renderMessages('Parent');

    const items = await within(getList()).findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(getList()).getByRole('button', { name: /أ\. سارة خالد/ })).toHaveTextContent(
      '1 رسائل غير مقروءة',
    );
    expect(screen.getByText('اختر محادثة لتبدأ')).toBeInTheDocument();
  });

  it('opens a thread, marks it seen and clears its unread badge', async () => {
    const seen = spyOn('post', '/Chats/mark-conversation-seen');
    renderMessages('Parent');

    await openConversation(/أ\. سارة خالد/);

    expect(await within(thread()).findByText(/سأرسل لكم ملاحظات الأسبوع/)).toBeInTheDocument();
    await waitFor(() => {
      expect(seen).toHaveLength(1);
    });
    expect(new URL(seen[0]?.url ?? '').searchParams.get('conversationId')).toBe(
      PARENT_TEACHER_CONVERSATION,
    );
    expect(within(getList()).getByRole('button', { name: /أ\. سارة خالد/ })).not.toHaveTextContent(
      'غير مقروءة',
    );
  });

  it('shows an error with retry when conversations fail to load', async () => {
    server.use(
      http.get(apiUrl('Chats/conversations'), () => new HttpResponse(null, { status: 500 })),
    );
    renderMessages('Parent');

    expect(await screen.findByText('تعذّر تحميل المحادثات')).toBeInTheDocument();
    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(await within(getList()).findAllByRole('listitem')).toHaveLength(2);
  });

  it('switches between list and thread views for small screens', async () => {
    const { container } = renderMessages('Parent');
    const layout = container.querySelector('[data-view]');
    expect(layout).toHaveAttribute('data-view', 'list');

    await openConversation(/أ\. سارة خالد/);
    expect(layout).toHaveAttribute('data-view', 'thread');
    expect(screen.getByRole('heading', { name: 'أ. سارة خالد' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'العودة إلى المحادثات' }));
    expect(layout).toHaveAttribute('data-view', 'list');
    expect(within(getList()).getByRole('button', { name: /أ\. سارة خالد/ })).toHaveFocus();
  });
});

describe('MessagesPage — sending and receiving', () => {
  it('sends with the Swagger body and never duplicates the message after polling', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    const sends = spyOn('post', '/Chats/send');
    renderMessages('Parent');
    await user.click(await within(getList()).findByRole('button', { name: /أ\. سارة خالد/ }));
    await within(thread()).findByText(/سأرسل لكم/);

    await user.type(screen.getByLabelText('اكتب رسالتك'), 'شكراً لكم{Enter}');

    await waitFor(() => {
      expect(sends).toHaveLength(1);
    });
    expect(await sends[0]?.json()).toEqual({
      conversationId: PARENT_TEACHER_CONVERSATION,
      receiverId: 'u-teacher',
      text: 'شكراً لكم',
    });
    expect(screen.getByLabelText('اكتب رسالتك')).toHaveValue('');
    await waitFor(() => {
      expect(within(thread()).queryByText('جارٍ الإرسال…')).not.toBeInTheDocument();
    });

    await act(() => vi.advanceTimersByTimeAsync(CHAT_POLL_MS.messages * 2));
    expect(within(thread()).getAllByText('شكراً لكم')).toHaveLength(1);
  });

  it('shows new messages from the other participant by polling and marks them seen', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    const seen = spyOn('post', '/Chats/mark-conversation-seen');
    renderMessages('Parent');
    await user.click(await within(getList()).findByRole('button', { name: /أ\. سارة خالد/ }));
    await within(thread()).findByText(/سأرسل لكم/);
    await waitFor(() => {
      expect(seen).toHaveLength(1);
    });

    mockMessages.push({
      id: 'e0000000-0000-4000-8000-000000000099',
      conversationId: PARENT_TEACHER_CONVERSATION,
      senderId: 'u-teacher',
      receiverId: 'u-parent',
      text: 'رسالة جديدة من المعلمة',
      createdAt: '2026-09-29T08:00:00Z',
      seen: false,
    });
    await act(() => vi.advanceTimersByTimeAsync(CHAT_POLL_MS.messages));

    expect(await within(thread()).findByText('رسالة جديدة من المعلمة')).toBeInTheDocument();
    await waitFor(() => {
      expect(seen).toHaveLength(2);
    });
  });

  it('restores the draft and shows an error when sending fails', async () => {
    server.use(http.post(apiUrl('Chats/send'), () => new HttpResponse(null, { status: 500 })));
    renderMessages('Parent');
    await openConversation(/أ\. سارة خالد/);
    await within(thread()).findByText(/سأرسل لكم/);

    await userEvent.type(screen.getByLabelText('اكتب رسالتك'), 'مرحباً{Enter}');

    expect(await screen.findByText('تعذّر إرسال الرسالة. حاول مرة أخرى.')).toBeInTheDocument();
    expect(screen.getByLabelText('اكتب رسالتك')).toHaveValue('مرحباً');
    expect(within(thread()).queryByText('مرحباً')).not.toBeInTheDocument();
  });

  it('loads older messages on demand', async () => {
    for (let index = 0; index < 34; index += 1) {
      mockMessages.push({
        id: `e1000000-0000-4000-8000-${index.toString().padStart(12, '0')}`,
        conversationId: PARENT_TEACHER_CONVERSATION,
        senderId: 'u-teacher',
        receiverId: 'u-parent',
        text: `رسالة قديمة ${index.toString()}`,
        createdAt: new Date(Date.UTC(2026, 7, 1, 0, index)).toISOString(),
        seen: true,
      });
    }
    renderMessages('Parent');
    await openConversation(/أ\. سارة خالد/);
    await within(thread()).findByText(/سأرسل لكم/);
    expect(within(thread()).queryByText('رسالة قديمة 0')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'تحميل رسائل أقدم' }));

    expect(await within(thread()).findByText('رسالة قديمة 0')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'تحميل رسائل أقدم' })).not.toBeInTheDocument();
  });
});

describe('MessagesPage — new conversation', () => {
  it('starts a conversation with conversationId null, then uses the id from the server', async () => {
    const sends = spyOn('post', '/Chats/send');
    renderMessages('Parent');
    await within(getList()).findAllByRole('listitem');

    await userEvent.click(screen.getByRole('button', { name: 'محادثة جديدة' }));
    const dialog = screen.getByRole('dialog', { name: 'محادثة جديدة' });
    await userEvent.type(within(dialog).getByRole('searchbox'), 'خالد سعيد');
    await userEvent.click(await within(dialog).findByRole('button', { name: /خالد سعيد/ }));

    expect(dialog).not.toHaveAttribute('open');
    expect(await screen.findByRole('heading', { name: 'خالد سعيد' })).toBeInTheDocument();
    expect(within(thread()).getByText('ابدأ المحادثة')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('اكتب رسالتك'), 'السلام عليكم{Enter}');
    await waitFor(() => {
      expect(sends).toHaveLength(1);
    });
    const first = (await sends[0]?.json()) as { conversationId: string | null; receiverId: string };
    expect(first).toMatchObject({ conversationId: null, receiverId: 'u-admin' });
    expect(await within(getList()).findByRole('button', { name: /خالد سعيد/ })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('اكتب رسالتك'), 'رسالة ثانية{Enter}');
    await waitFor(() => {
      expect(sends).toHaveLength(2);
    });
    const second = (await sends[1]?.json()) as { conversationId: string | null };
    expect(second.conversationId).toEqual(expect.any(String));
    expect(within(thread()).getAllByText('السلام عليكم')).toHaveLength(1);
  });
});
