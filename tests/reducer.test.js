import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/utils/constants.js';
import { deriveGame } from '../src/utils/gameLogic.js';
import { getAIMove } from '../src/utils/ai.js';
import { canUndo, createInitialState, gameReducer } from '../src/hooks/gameReducer.js';

let counter = 0;
const move = (state, index, by = 'human') =>
  gameReducer(state, {
    type: 'MOVE',
    index,
    by,
    expect: state.game.moves.length,
    id: `m${(counter += 1)}`,
    now: 1_700_000_000_000 + counter,
  });
const playAll = (state, indices) => indices.reduce((s, i) => move(s, i), state);
const friend = (patch = {}) =>
  createInitialState({ settings: { ...DEFAULT_SETTINGS, mode: 'friend', ...patch } });
const ai = (patch = {}) => createInitialState({ settings: { ...DEFAULT_SETTINGS, mode: 'ai', ...patch } });
const derived = (s) => deriveGame(s.game);

describe('friend mode', () => {
  it('alternates turns and ignores occupied cells', () => {
    let s = friend();
    expect(derived(s).current).toBe('X');
    s = move(s, 4);
    expect(derived(s).current).toBe('O');
    const same = move(s, 4);
    expect(same).toBe(s);
    expect(derived(same).current).toBe('O');
  });

  it('detects a win, updates scores and history exactly once, and blocks further moves', () => {
    let s = playAll(friend(), [0, 3, 1, 4, 2]);
    expect(derived(s)).toMatchObject({ winner: 'X', isOver: true, line: [0, 1, 2] });
    expect(s.scores).toEqual({ X: 1, O: 0, draws: 0 });
    expect(s.history).toHaveLength(1);
    expect(s.history[0]).toMatchObject({ mode: 'friend', winner: 'X', moves: 5, difficulty: null, humanMark: null });

    const after = move(s, 8);
    expect(after).toBe(s);
    expect(after.scores).toEqual({ X: 1, O: 0, draws: 0 });
    expect(after.history).toHaveLength(1);
  });

  it('detects a draw and counts it once', () => {
    const s = playAll(friend(), [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(derived(s)).toMatchObject({ isDraw: true, winner: null, isOver: true });
    expect(s.scores).toEqual({ X: 0, O: 0, draws: 1 });
    expect(s.history[0].winner).toBeNull();
    expect(s.history[0].moves).toBe(9);
  });

  it('lets O win too', () => {
    const s = playAll(friend(), [0, 3, 1, 4, 8, 5]);
    expect(derived(s).winner).toBe('O');
    expect(s.scores.O).toBe(1);
  });

  it('keeps scores across new games and only resets them on request', () => {
    let s = playAll(friend(), [0, 3, 1, 4, 2]);
    s = gameReducer(s, { type: 'NEW_GAME' });
    expect(s.game.moves).toEqual([]);
    expect(s.scores.X).toBe(1);
    expect(s.history).toHaveLength(1);
    s = gameReducer(s, { type: 'RESET_SCORES' });
    expect(s.scores).toEqual({ X: 0, O: 0, draws: 0 });
    expect(s.history).toHaveLength(1);
    s = gameReducer(s, { type: 'CLEAR_HISTORY' });
    expect(s.history).toEqual([]);
  });

  it('honours the chosen first player on new games', () => {
    let s = friend({ firstPlayer: 'O' });
    expect(derived(s).current).toBe('O');
    s = move(s, 0);
    expect(s.game.moves[0].mark).toBe('O');
    expect(derived(s).current).toBe('X');
    s = gameReducer(s, { type: 'NEW_GAME' });
    expect(derived(s).current).toBe('O');
  });

  it('undo restores board and turn, and is disabled when empty or finished', () => {
    let s = friend();
    expect(canUndo(s)).toBe(false);
    s = playAll(s, [0, 1, 2]);
    expect(derived(s).current).toBe('O');
    s = gameReducer(s, { type: 'UNDO' });
    expect(derived(s)).toMatchObject({ current: 'X', moveCount: 2 });
    expect(derived(s).board[2]).toBeNull();
    s = gameReducer(s, { type: 'UNDO' });
    s = gameReducer(s, { type: 'UNDO' });
    expect(derived(s).moveCount).toBe(0);
    expect(gameReducer(s, { type: 'UNDO' })).toBe(s);

    const done = playAll(friend(), [0, 3, 1, 4, 2]);
    expect(canUndo(done)).toBe(false);
    expect(gameReducer(done, { type: 'UNDO' })).toBe(done);
  });

  it('ignores stale moves whose expected move count is outdated', () => {
    const s = move(friend(), 0);
    const stale = gameReducer(s, { type: 'MOVE', index: 1, by: 'human', expect: 0, id: 'x', now: 1 });
    expect(stale).toBe(s);
  });

  it('rejects out-of-range indices', () => {
    const s = friend();
    expect(move(s, -1)).toBe(s);
    expect(move(s, 9)).toBe(s);
    expect(move(s, 1.5)).toBe(s);
  });
});

describe('AI mode', () => {
  it('rejects a human move on the AI turn and an AI move on the human turn', () => {
    let s = ai({ humanMark: 'X', firstPlayer: 'X' });
    expect(move(s, 0, 'ai')).toBe(s);
    s = move(s, 0, 'human');
    expect(move(s, 1, 'human')).toBe(s);
    expect(derived(move(s, 1, 'ai')).moveCount).toBe(2);
    expect(move(s, 1, undefined)).toBe(s);
  });

  it('lets the AI open when it moves first', () => {
    const s = ai({ humanMark: 'X', firstPlayer: 'O' });
    expect(derived(s).current).toBe('O');
    expect(move(s, 4, 'human')).toBe(s);
    expect(derived(move(s, 4, 'ai')).board[4]).toBe('O');
  });

  it('records difficulty and human mark in history', () => {
    let s = ai({ difficulty: 'hard', humanMark: 'O', firstPlayer: 'X' });
    // AI is X: X wins on top row, human (O) plays 3, 4.
    s = move(s, 0, 'ai');
    s = move(s, 3, 'human');
    s = move(s, 1, 'ai');
    s = move(s, 4, 'human');
    s = move(s, 2, 'ai');
    expect(s.history[0]).toMatchObject({ mode: 'ai', difficulty: 'hard', humanMark: 'O', winner: 'X' });
    expect(s.scores.X).toBe(1);
  });

  it('undo removes the last human move and the AI reply, only on the human turn', () => {
    let s = ai({ humanMark: 'X', firstPlayer: 'X' });
    expect(canUndo(s)).toBe(false);
    s = move(s, 0, 'human');
    expect(canUndo(s)).toBe(false); // AI turn
    expect(gameReducer(s, { type: 'UNDO' })).toBe(s);
    s = move(s, 4, 'ai');
    s = move(s, 1, 'human');
    s = move(s, 2, 'ai');
    expect(canUndo(s)).toBe(true);
    s = gameReducer(s, { type: 'UNDO' });
    expect(s.game.moves).toEqual([
      { index: 0, mark: 'X' },
      { index: 4, mark: 'O' },
    ]);
    expect(derived(s).current).toBe('X');
  });

  it('undo with an AI opening keeps the AI opening move', () => {
    let s = ai({ humanMark: 'X', firstPlayer: 'O' });
    expect(canUndo(s)).toBe(false);
    s = move(s, 4, 'ai');
    expect(canUndo(s)).toBe(false); // human has not moved yet
    s = move(s, 0, 'human');
    s = move(s, 8, 'ai');
    s = gameReducer(s, { type: 'UNDO' });
    expect(s.game.moves).toEqual([{ index: 4, mark: 'O' }]);
    expect(derived(s).current).toBe('X');
  });
});

describe('configuration', () => {
  it('changing mode or options starts a fresh game but keeps scores and history', () => {
    let s = playAll(friend(), [0, 3, 1, 4, 2]);
    s = gameReducer(s, { type: 'SET_CONFIG', config: { mode: 'ai' } });
    expect(s.settings.mode).toBe('ai');
    expect(s.game.moves).toEqual([]);
    expect(s.scores.X).toBe(1);
    expect(s.history).toHaveLength(1);
  });

  it('is a no-op when nothing changes, and sound/theme never reset the board', () => {
    const s = move(friend(), 0);
    expect(gameReducer(s, { type: 'SET_CONFIG', config: { mode: 'friend' } })).toBe(s);
    const t = gameReducer(s, { type: 'SET_PREF', prefs: { sound: false, theme: 'light' } });
    expect(t.settings).toMatchObject({ sound: false, theme: 'light' });
    expect(t.game).toBe(s.game);
  });

  it('first player follows config', () => {
    const s = gameReducer(friend(), { type: 'SET_CONFIG', config: { firstPlayer: 'O' } });
    expect(derived(s).current).toBe('O');
  });
});

describe('full simulated games at every difficulty', () => {
  it.each(['easy', 'medium', 'hard'])('%s: scores always equal games played', (difficulty) => {
    let s = ai({ difficulty, humanMark: 'X', firstPlayer: 'X' });
    const games = 60;
    for (let g = 0; g < games; g += 1) {
      s = gameReducer(s, { type: 'SET_CONFIG', config: { firstPlayer: g % 2 ? 'O' : 'X' } });
      s = gameReducer(s, { type: 'NEW_GAME' });
      let guard = 0;
      while (!derived(s).isOver && guard < 20) {
        guard += 1;
        const d = derived(s);
        if (d.current === s.settings.humanMark) {
          const empties = d.board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
          s = move(s, empties[Math.floor(Math.random() * empties.length)], 'human');
        } else {
          s = move(s, getAIMove(d.board, d.current, s.settings.humanMark, difficulty), 'ai');
        }
      }
      expect(derived(s).isOver).toBe(true);
    }
    expect(s.scores.X + s.scores.O + s.scores.draws).toBe(games);
    if (difficulty === 'hard') expect(s.scores.X).toBe(0); // random human can never beat minimax
    expect(s.history.length).toBe(Math.min(games, 30));
  });
});
