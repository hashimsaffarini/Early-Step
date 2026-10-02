import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RoleAreaContext } from '@/hooks/useRoleArea';
import { renderInRouter } from '@/test/renderWithRouter';

import { getMockChildrenForRole } from '../mock/children.mock';

import { ChildrenListPage } from './ChildrenListPage';

const MOCK_PARENT_CHILDREN_LIST = getMockChildrenForRole('Parent');

const openDialog = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'إضافة طفل' }));
  return screen.getByRole('dialog', { name: 'إضافة ملف طفل جديد' });
};

describe('ChildrenListPage — list', () => {
  it('renders one card per mock child with neutral statuses', () => {
    renderInRouter(<ChildrenListPage />);
    const list = screen.getByRole('list', { name: 'قائمة الأطفال' });

    expect(within(list).getAllByRole('article')).toHaveLength(MOCK_PARENT_CHILDREN_LIST.length);
    for (const child of MOCK_PARENT_CHILDREN_LIST) {
      expect(within(list).getByRole('heading', { name: child.name })).toBeInTheDocument();
    }
    expect(within(list).getByText('لديه خطة تدريبية')).toBeInTheDocument();
    expect(within(list).getByText('بانتظار بدء التقييم')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('links "عرض الملف" to each child profile', () => {
    renderInRouter(<ChildrenListPage />);

    for (const child of MOCK_PARENT_CHILDREN_LIST) {
      expect(screen.getByRole('link', { name: `عرض ملف ${child.name}` })).toHaveAttribute(
        'href',
        `/parent/children/${child.id}`,
      );
    }
  });

  it('filters children by name', async () => {
    renderInRouter(<ChildrenListPage />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'البحث عن طفل' }), 'نور');

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'نور' })).toBeInTheDocument();
  });
});

describe('ChildrenListPage — add child', () => {
  it('opens the dialog and validates required fields', async () => {
    renderInRouter(<ChildrenListPage />);
    const dialog = await openDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(within(dialog).getByText('اسم الطفل مطلوب')).toBeInTheDocument();
    expect(within(dialog).getByText('تاريخ الميلاد مطلوب')).toBeInTheDocument();
    expect(within(dialog).getByText('يرجى اختيار الجنس')).toBeInTheDocument();
  });

  it('rejects a birth date in the future', async () => {
    renderInRouter(<ChildrenListPage />);
    const dialog = await openDialog();

    await userEvent.type(within(dialog).getByLabelText(/اسم الطفل/), 'سارة');
    await userEvent.type(within(dialog).getByLabelText(/تاريخ الميلاد/), '2999-01-01');
    await userEvent.selectOptions(within(dialog).getByLabelText(/الجنس/), 'girl');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(
      within(dialog).getByText('تاريخ الميلاد لا يمكن أن يكون في المستقبل'),
    ).toBeInTheDocument();
  });

  it('adds the child locally, closes the dialog and confirms', async () => {
    renderInRouter(<ChildrenListPage />);
    const dialog = await openDialog();

    await userEvent.type(within(dialog).getByLabelText(/اسم الطفل/), 'سارة');
    await userEvent.type(within(dialog).getByLabelText(/تاريخ الميلاد/), '2020-05-14');
    await userEvent.selectOptions(within(dialog).getByLabelText(/الجنس/), 'girl');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    await waitFor(() => {
      expect(dialog).not.toHaveAttribute('open');
    });
    expect(screen.getAllByRole('article')).toHaveLength(MOCK_PARENT_CHILDREN_LIST.length + 1);
    const newCard = screen.getByRole('heading', { name: 'سارة' }).closest('article');
    if (!newCard) throw new Error('new card not found');
    expect(within(newCard).getByText('بانتظار بدء التقييم')).toBeInTheDocument();
    expect(within(newCard).getByText('الجنس: بنت')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('تمت إضافة سارة');
  });
});

describe('ChildrenListPage — empty state', () => {
  it('shows the empty state when there are no children', () => {
    renderInRouter(<ChildrenListPage initialChildren={[]} />);

    expect(screen.getByText('لا يوجد أطفال هنا')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'قائمة الأطفال' })).not.toBeInTheDocument();
  });

  it('opens the add-child form from the empty-state CTA', async () => {
    renderInRouter(<ChildrenListPage initialChildren={[]} />);

    const dialog = await openDialog();

    expect(dialog).toHaveAttribute('open');
  });
});

describe('ChildrenListPage — staff roles', () => {
  const renderAs = (role: 'Teacher' | 'Specialist' | 'Admin') =>
    renderInRouter(
      <RoleAreaContext value={role}>
        <ChildrenListPage />
      </RoleAreaContext>,
    );

  it('shows the teacher their class with parent names and no add button', () => {
    renderAs('Teacher');

    expect(screen.getByRole('heading', { level: 1, name: 'الأطفال' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'قائمة الأطفال' });
    expect(within(list).getAllByRole('article')).toHaveLength(
      getMockChildrenForRole('Teacher').length,
    );
    expect(within(list).getByRole('heading', { name: 'سلمى' })).toBeInTheDocument();
    expect(within(list).getByText('ولي الأمر: خالد يوسف')).toBeInTheDocument();
    expect(within(list).queryByRole('heading', { name: 'عمر' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إضافة طفل' })).not.toBeInTheDocument();
  });

  it('links staff cards to the role-scoped profile', () => {
    renderAs('Specialist');

    expect(screen.getByRole('link', { name: 'عرض ملف ليان' })).toHaveAttribute(
      'href',
      '/specialist/children/mock-child-7',
    );
  });

  it('shows the admin every child', () => {
    renderAs('Admin');

    expect(screen.getAllByRole('article')).toHaveLength(7);
  });

  it('shows a staff empty state without an add action', () => {
    renderInRouter(
      <RoleAreaContext value="Teacher">
        <ChildrenListPage initialChildren={[]} />
      </RoleAreaContext>,
    );

    expect(screen.getByText('لا توجد ملفات أطفال مرتبطة بحسابك')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إضافة طفل' })).not.toBeInTheDocument();
  });
});
