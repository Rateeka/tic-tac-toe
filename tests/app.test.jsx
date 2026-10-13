import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import { STORAGE_KEYS } from '../src/utils/storage.js';

const cell = (n) => screen.getByTestId(`cell-${n}`);
const score = (tone) => screen.getByTestId(`score-${tone}`).textContent;
const emptyCount = () => screen.queryAllByLabelText(/, empty$/).length;
const markedCount = () => screen.queryAllByLabelText(/, (X|O)$/).length;
const radio = (group, name) =>
  within(screen.getByRole('radiogroup', { name: group })).getByRole('radio', { name });

let user;
beforeEach(() => {
  user = userEvent.setup();
});
afterEach(() => cleanup());

async function chooseFriendMode() {
  await user.click(screen.getByRole('radio', { name: /play with a friend/i }));
  await screen.findByText("Player X's turn");
}

async function playFriendXWin() {
  for (const n of [0, 3, 1, 4, 2]) await user.click(cell(n));
}

describe('initial state', () => {
  it('starts clean: no fake scores or history, all controls present', () => {
    render(<App />);
    expect(score('X')).toBe('0');
    expect(score('O')).toBe('0');
    expect(score('draws')).toBe('0');
    expect(screen.getByText(/no matches yet/i)).toBeInTheDocument();
    expect(emptyCount()).toBe(9);
    expect(screen.getByText('TIC TAC TOE')).toBeInTheDocument();
    expect(screen.getByText('Think smart. Make your move.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /play with ai/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clear history/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /new game/i })).toBeEnabled();
  });

  it('recovers from corrupted storage', () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.setItem(k, '%%%'));
    render(<App />);
    expect(score('X')).toBe('0');
    expect(emptyCount()).toBe(9);
  });
});

describe('Play with a Friend', () => {
  it('plays a full game to a win, highlights, shows modal, scores and history', async () => {
    render(<App />);
    await chooseFriendMode();

    await user.click(cell(0));
    await screen.findByText("Player O's turn");
    await user.click(cell(0)); // occupied: ignored
    expect(screen.getByText("Player O's turn")).toBeInTheDocument();

    for (const n of [3, 1, 4, 2]) await user.click(cell(n));

    expect(await screen.findByRole('heading', { name: /player x wins/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(score('X')).toBe('1');
    expect(screen.getByTestId('history-list')).toHaveTextContent('Player X won');

    // board is locked after the game finishes
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(cell(8));
    expect(cell(8)).toHaveAccessibleName(/empty/);
    expect(score('X')).toBe('1');
  });

  it('detects a draw', async () => {
    render(<App />);
    await chooseFriendMode();
    for (const n of [0, 1, 2, 4, 3, 5, 7, 6, 8]) await user.click(cell(n));
    expect(await screen.findByRole('heading', { name: /it's a draw/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(score('draws')).toBe('1');
    expect(screen.getByTestId('history-list')).toHaveTextContent('Draw');
  });

  it('play again starts a new board and keeps scores', async () => {
    render(<App />);
    await chooseFriendMode();
    await playFriendXWin();
    await user.click(await screen.findByRole('button', { name: /play again/i }, { timeout: 3000 }));
    await waitFor(() => expect(emptyCount()).toBe(9));
    expect(score('X')).toBe('1');
    expect(await screen.findByText("Player X's turn")).toBeInTheDocument();
  });

  it('undo restores the board and the turn', async () => {
    render(<App />);
    await chooseFriendMode();
    await user.click(cell(4));
    await user.click(cell(0));
    await screen.findByText("Player X's turn");
    await user.click(screen.getByRole('button', { name: /undo/i }));
    await screen.findByText("Player O's turn");
    expect(cell(0)).toHaveAccessibleName(/empty/);
    expect(cell(4)).toHaveAccessibleName(/, X$/);
  });

  it('lets the players choose who moves first', async () => {
    render(<App />);
    await chooseFriendMode();
    await user.click(radio('First move', 'O'));
    await screen.findByText("Player O's turn");
    await user.click(cell(4));
    expect(cell(4)).toHaveAccessibleName(/, O$/);
    await screen.findByText("Player X's turn");
    // New Game keeps the chosen first player
    await user.click(screen.getByRole('button', { name: /new game/i }));
    await screen.findByText("Player O's turn");
  });
});

describe('Play with AI', () => {
  it('shows the thinking state, blocks the user meanwhile and never double-moves', async () => {
    render(<App />);
    await user.click(radio('Difficulty', 'Easy'));
    expect(screen.getByTestId('current-mode')).toHaveTextContent('Play with AI · Easy');

    await user.click(cell(4));
    expect(await screen.findByText('AI is thinking...')).toBeInTheDocument();

    const before = markedCount();
    await user.click(cell(0)); // ignored while the AI thinks
    expect(markedCount()).toBe(before);

    await screen.findByText('Your turn', {}, { timeout: 3000 });
    expect(markedCount()).toBe(2);
    // exactly one AI move happened
    await new Promise((r) => setTimeout(r, 1200));
    expect(markedCount()).toBe(2);
  });

  it('lets the AI open when it is chosen to move first', async () => {
    render(<App />);
    await user.click(radio('First move', 'O')); // human is X, AI is O
    expect(screen.getByTestId('first-hint')).toHaveTextContent('AI moves first');
    await screen.findByText('AI is thinking...');
    await screen.findByText('Your turn', {}, { timeout: 3000 });
    expect(markedCount()).toBe(1);
  });

  it('can play as O', async () => {
    render(<App />);
    await user.click(radio('You play as', 'O')); // X (AI) moves first by default
    await screen.findByText('AI is thinking...');
    await screen.findByText('Your turn', {}, { timeout: 3000 });
    await user.click(screen.getAllByLabelText(/, empty$/)[0]);
    expect(screen.getAllByLabelText(/, O$/)).toHaveLength(1);
  });

  it('undo reverses the latest human + AI turn', async () => {
    render(<App />);
    await user.click(radio('Difficulty', 'Easy'));
    await user.click(cell(4));
    await waitFor(() => expect(markedCount()).toBe(2), { timeout: 3000 });
    await screen.findByText('Your turn');
    await waitFor(() => expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled());

    await user.click(screen.getByRole('button', { name: /undo/i }));
    await waitFor(() => expect(emptyCount()).toBe(9));
    expect(await screen.findByText('Your turn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });

  it.each(['easy', 'medium', 'hard'])('completes a full game on %s and records one result', async (level) => {
    render(<App />);
    await user.click(radio('Difficulty', level[0].toUpperCase() + level.slice(1)));

    for (let turns = 0; turns < 6; turns += 1) {
      await waitFor(() => expect(screen.queryByText('AI is thinking...')).not.toBeInTheDocument(), { timeout: 3000 });
      // Stop on board state, not status text (the status line animates out for ~150ms).
      if (emptyCount() === 0 || screen.queryByRole('dialog')) break;
      const before = emptyCount();
      await user.click(screen.getAllByLabelText(/, empty$/)[0]);
      // Either the AI replied (-2 cells), the board filled, or the human's own move ended the game.
      await waitFor(
        () => expect(emptyCount() <= before - 2 || emptyCount() === 0 || screen.queryByRole('dialog') !== null).toBe(true),
        { timeout: 3000 },
      );
    }

    await screen.findByRole('dialog', {}, { timeout: 3000 });
    const total = Number(score('X')) + Number(score('O')) + Number(score('draws'));
    expect(total).toBe(1);
    expect(screen.getByTestId('history-list').children).toHaveLength(1);
    expect(screen.getByTestId('history-list')).toHaveTextContent(`vs AI · ${level[0].toUpperCase() + level.slice(1)}`);
    if (level === 'hard') expect(score('X')).toBe('0'); // the human can never beat minimax
  });
});

describe('destructive actions and persistence', () => {
  it('asks for confirmation before resetting scores, and cancel keeps them', async () => {
    render(<App />);
    await chooseFriendMode();
    await playFriendXWin();
    await user.click(await screen.findByRole('button', { name: /review board/i }, { timeout: 3000 }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /reset scores/i }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(score('X')).toBe('1');

    await user.click(screen.getByRole('button', { name: /reset scores/i }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: /reset scores/i }));
    await waitFor(() => expect(score('X')).toBe('0'));
    expect(screen.getByTestId('history-list')).toBeInTheDocument(); // history untouched
  });

  it('asks for confirmation before clearing history', async () => {
    render(<App />);
    await chooseFriendMode();
    await playFriendXWin();
    await user.click(await screen.findByRole('button', { name: /review board/i }, { timeout: 3000 }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /clear history/i }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: /clear history/i }));
    await screen.findByText(/no matches yet/i);
    expect(score('X')).toBe('1'); // scores untouched
  });

  it('restores scores, history and settings after a reload', async () => {
    const first = render(<App />);
    await chooseFriendMode();
    await user.click(radio('First move', 'O'));
    for (const n of [0, 3, 1, 4, 2]) await user.click(cell(n)); // O wins first row
    await screen.findByRole('heading', { name: /player o wins/i }, { timeout: 3000 });
    first.unmount();

    render(<App />);
    expect(score('O')).toBe('1');
    expect(screen.getByRole('radio', { name: /play with a friend/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('history-list')).toHaveTextContent('Player O won');
    expect(emptyCount()).toBe(9);
  });
});

describe('sound and theme', () => {
  it('toggles and persists sound and theme', async () => {
    const first = render(<App />);
    const sound = screen.getByRole('button', { name: /sound/i });
    expect(sound).toHaveAttribute('aria-pressed', 'true');
    await user.click(sound);
    expect(screen.getByRole('button', { name: /sound/i })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: /theme/i }));
    expect(document.documentElement.dataset.theme).toBe('light');

    first.unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: /sound/i })).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('shows toast feedback for important actions', async () => {
    render(<App />);
    await user.click(screen.getByRole('button', { name: /new game/i }));
    expect(await screen.findByText('New game started')).toBeInTheDocument();
  });
});
