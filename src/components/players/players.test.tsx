import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderInRouter } from '@/test/renderWithRouter';

import { AnswerTile } from './AnswerTile';
import { FeedbackMessage } from './FeedbackMessage';
import { PlayerShell } from './PlayerShell';
import { QuestionProgress } from './QuestionProgress';
import { starsForScore } from './scoring';
import { StarRating } from './StarRating';
import { useSoundEffects } from './useSoundEffects';
import { SoundToggle } from './SoundToggle';

describe('starsForScore', () => {
  it('scales correct answers to stars and clamps the range', () => {
    expect(starsForScore(8, 8)).toBe(5);
    expect(starsForScore(4, 8)).toBe(3);
    expect(starsForScore(0, 8)).toBe(0);
    expect(starsForScore(3, 3, 3)).toBe(3);
    expect(starsForScore(5, 0)).toBe(0);
  });
});

describe('StarRating', () => {
  it('announces earned stars in words', () => {
    render(<StarRating value={3} />);
    expect(screen.getByRole('img', { name: '3 من 5 نجوم' })).toBeInTheDocument();
  });
});

describe('AnswerTile', () => {
  it('is a button that reports clicks', async () => {
    const onClick = vi.fn();
    render(<AnswerTile label="بطة" emoji="🦆" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button', { name: /بطة/ }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('describes correct and wrong states in text, not only colour', () => {
    const { rerender } = render(<AnswerTile label="7" state="correct" />);
    expect(screen.getByRole('button', { name: /7.*إجابة صحيحة/ })).toBeInTheDocument();

    rerender(<AnswerTile label="7" state="wrong" />);
    expect(screen.getByRole('button', { name: /7.*إجابة غير صحيحة/ })).toBeInTheDocument();
  });
});

describe('QuestionProgress', () => {
  it('shows the counter and exposes it as the progress value text', () => {
    render(<QuestionProgress current={2} total={8} />);

    expect(screen.getByText('السؤال 2 من 8')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'السؤال 2 من 8');
  });
});

describe('FeedbackMessage', () => {
  it('uses words for feedback and stays empty when there is none', () => {
    const { rerender } = render(<FeedbackMessage kind={null} />);
    expect(screen.getByRole('status')).toHaveTextContent('');

    rerender(<FeedbackMessage kind="correct" />);
    expect(screen.getByRole('status')).toHaveTextContent('أحسنت! إجابة صحيحة');
  });
});

describe('PlayerShell', () => {
  it('renders the title as the page heading and an exit link', () => {
    renderInRouter(
      <PlayerShell exitTo="/parent/games" title="مطابقة البطاقات" category="memory" emoji="🧩">
        <p>المحتوى</p>
      </PlayerShell>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'مطابقة البطاقات' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'خروج' })).toHaveAttribute('href', '/parent/games');
  });
});

function SoundHarness() {
  const sound = useSoundEffects();
  return <SoundToggle isMuted={sound.isMuted} onToggle={sound.toggleMuted} />;
}

describe('SoundToggle', () => {
  it('toggles mute with a pressed state', async () => {
    render(<SoundHarness />);

    await userEvent.click(screen.getByRole('button', { name: 'كتم الصوت' }));

    expect(screen.getByRole('button', { name: 'تشغيل الصوت' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
