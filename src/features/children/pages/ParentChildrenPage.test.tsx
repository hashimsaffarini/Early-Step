import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderInRouter } from '@/test/renderWithRouter';

import { MOCK_PARENT_CHILDREN_LIST } from '../mock/parentChildren.mock';

import { ParentChildrenPage } from './ParentChildrenPage';

const openDialog = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'إضافة طفل' }));
  return screen.getByRole('dialog', { name: 'إضافة ملف طفل جديد' });
};

describe('ParentChildrenPage — list', () => {
  it('renders one card per mock child with neutral statuses', () => {
    renderInRouter(<ParentChildrenPage />);
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
    renderInRouter(<ParentChildrenPage />);

    for (const child of MOCK_PARENT_CHILDREN_LIST) {
      expect(screen.getByRole('link', { name: `عرض ملف ${child.name}` })).toHaveAttribute(
        'href',
        `/parent/children/${child.id}`,
      );
    }
  });

  it('filters children by name', async () => {
    renderInRouter(<ParentChildrenPage />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'البحث عن طفل' }), 'نور');

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'نور' })).toBeInTheDocument();
  });
});

describe('ParentChildrenPage — add child', () => {
  it('opens the dialog and validates required fields', async () => {
    renderInRouter(<ParentChildrenPage />);
    const dialog = await openDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(within(dialog).getByText('اسم الطفل مطلوب')).toBeInTheDocument();
    expect(within(dialog).getByText('تاريخ الميلاد مطلوب')).toBeInTheDocument();
    expect(within(dialog).getByText('يرجى اختيار الجنس')).toBeInTheDocument();
  });

  it('rejects a birth date in the future', async () => {
    renderInRouter(<ParentChildrenPage />);
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
    renderInRouter(<ParentChildrenPage />);
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

describe('ParentChildrenPage — empty state', () => {
  it('shows the empty state when there are no children', () => {
    renderInRouter(<ParentChildrenPage initialChildren={[]} />);

    expect(screen.getByText('لا يوجد أطفال هنا')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'قائمة الأطفال' })).not.toBeInTheDocument();
  });

  it('opens the add-child form from the empty-state CTA', async () => {
    renderInRouter(<ParentChildrenPage initialChildren={[]} />);

    const dialog = await openDialog();

    expect(dialog).toHaveAttribute('open');
  });
});
