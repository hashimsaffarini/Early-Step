import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RoleAreaContext } from '@/hooks/useRoleArea';
import { renderInRouter } from '@/test/renderWithRouter';

import { ActivityCatalog } from '../components/ActivityCatalog';
import { GAMES } from '../data/games';
import { TESTS } from '../data/tests';

import { GamesCatalogPage } from './GamesCatalogPage';
import { TestsCatalogPage } from './TestsCatalogPage';

describe('TestsCatalogPage', () => {
  it('renders every test with a role-scoped start link', () => {
    renderInRouter(<TestsCatalogPage />);
    const list = screen.getByRole('list', { name: 'قائمة الاختبارات' });

    expect(within(list).getAllByRole('article')).toHaveLength(TESTS.length);
    expect(screen.getByRole('link', { name: 'ابدأ: اختبار الأعداد' })).toHaveAttribute(
      'href',
      '/parent/tests/numbers-test/play',
    );
  });

  it('filters by category and updates the chip state and count', async () => {
    renderInRouter(<TestsCatalogPage />);
    const mathChip = screen.getByRole('button', { name: /الرياضيات/ });

    await userEvent.click(mathChip);

    expect(mathChip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /الكل/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2, name: 'الرياضيات' })).toBeInTheDocument();
    expect(screen.getByText('اختبار واحد في هذا التصنيف')).toBeInTheDocument();
  });

  it('shows no percentages or AI claims', () => {
    renderInRouter(<TestsCatalogPage />);

    expect(screen.queryByText(/%|ذكي|AI/)).not.toBeInTheDocument();
  });
});

describe('GamesCatalogPage', () => {
  it('links games to the current role area', () => {
    renderInRouter(
      <RoleAreaContext value="Teacher">
        <GamesCatalogPage />
      </RoleAreaContext>,
    );

    expect(screen.getAllByRole('article')).toHaveLength(GAMES.length);
    expect(screen.getByRole('link', { name: 'العب: فقّع البالون' })).toHaveAttribute(
      'href',
      '/teacher/games/balloon-pop/play',
    );
  });

  it('shows the empty state for a category without items', async () => {
    renderInRouter(
      <ActivityCatalog
        kind="game"
        items={[
          {
            id: 'memory-match',
            title: 'مطابقة البطاقات',
            description: 'وصف',
            category: 'memory',
            emoji: '🧩',
            difficulty: 'easy',
            meta: [],
            playTo: '/parent/games/memory-match/play',
          },
        ]}
        banner={{ title: 'الألعاب', subtitle: 'وصف', eyebrow: 'ألعاب', tone: 'sunset' }}
        playLabel="العب"
        emptyIcon={null}
        emptyTitle="لا توجد ألعاب في هذا التصنيف"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /الكتابة/ }));

    expect(screen.getByText('لا توجد ألعاب في هذا التصنيف')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('labels the content as practice and offers no fake assignment', () => {
    renderInRouter(
      <RoleAreaContext value="Specialist">
        <GamesCatalogPage />
      </RoleAreaContext>,
    );

    expect(screen.getByText(/تدريب — لا تُحفظ النتائج/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /تعيين/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'قائمة الأطفال' })).toHaveAttribute(
      'href',
      '/specialist/children',
    );
  });
});
