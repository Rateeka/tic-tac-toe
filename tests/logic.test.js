import { describe, expect, it } from 'vitest';
import {
  WIN_LINES,
  calculateWinner,
  deriveGame,
  findWinningMove,
  getEmptyCells,
  isBoardFull,
  other,
} from '../src/utils/gameLogic.js';
import { getAIMove, getEasyMove, getMediumMove } from '../src/utils/ai.js';
import { getBestMoves, minimax } from '../src/utils/minimax.js';

const b = (str) => str.split('').map((c) => (c === '.' ? null : c));

describe('win and draw detection', () => {
  it('defines all eight winning lines', () => {
    expect(WIN_LINES).toHaveLength(8);
    expect(new Set(WIN_LINES.map((l) => l.join()))).toHaveProperty('size', 8);
  });

  it.each(WIN_LINES)('detects a win on line %i,%i,%i for both marks', (...line) => {
    for (const mark of ['X', 'O']) {
      const board = Array(9).fill(null);
      line.forEach((i) => (board[i] = mark));
      expect(calculateWinner(board)).toEqual({ winner: mark, line });
    }
  });

  it('returns null for incomplete and drawn boards', () => {
    expect(calculateWinner(b('XO.......'))).toBeNull();
    expect(calculateWinner(b('XOXXOOOXX'))).toBeNull();
    expect(isBoardFull(b('XOXXOOOXX'))).toBe(true);
    expect(deriveGame({ start: 'X', moves: [] }).isOver).toBe(false);
  });

  it('derives draw only when the board is full without a winner', () => {
    // X O X / X O O / O X X  -> draw
    const order = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    const moves = order.map((index, n) => ({ index, mark: n % 2 === 0 ? 'X' : 'O' }));
    const d = deriveGame({ start: 'X', moves });
    expect(d.isDraw).toBe(true);
    expect(d.winner).toBeNull();
    expect(d.isOver).toBe(true);
  });

  it('finds immediate winning moves', () => {
    expect(findWinningMove(b('XX.......'), 'X')).toBe(2);
    expect(findWinningMove(b('X...X....'), 'X')).toBe(8);
    expect(findWinningMove(b('X.O.O.X..'), 'O')).toBe(-1);
    expect(findWinningMove(b('.........'), 'X')).toBe(-1);
  });

  it('derives turn from the starting player', () => {
    expect(deriveGame({ start: 'O', moves: [] }).current).toBe('O');
    expect(deriveGame({ start: 'O', moves: [{ index: 0, mark: 'O' }] }).current).toBe('X');
  });
});

describe('easy AI', () => {
  it('only ever picks empty cells', () => {
    const board = b('XOXO.OX.X');
    for (let i = 0; i < 200; i += 1) {
      expect([4, 7]).toContain(getEasyMove(board));
    }
  });

  it('eventually picks every empty cell (random)', () => {
    const seen = new Set();
    for (let i = 0; i < 400; i += 1) seen.add(getAIMove(Array(9).fill(null), 'O', 'X', 'easy'));
    expect(seen.size).toBe(9);
  });

  it('returns -1 on a full board', () => {
    expect(getEasyMove(b('XOXXOOOXX'))).toBe(-1);
  });
});

describe('medium AI', () => {
  it('takes a winning move over blocking', () => {
    // O can win at 2; X threatens 6
    expect(getMediumMove(b('OO.XX....'), 'O', 'X')).toBe(2);
  });

  it('blocks the human immediate win', () => {
    expect(getMediumMove(b('XX.......'), 'O', 'X')).toBe(2);
    expect(getMediumMove(b('X...X....'), 'O', 'X')).toBe(8);
    expect(getMediumMove(b('..X.X....'), 'O', 'X')).toBe(6);
  });

  it('prefers centre, then corners', () => {
    expect(getMediumMove(b('X........'), 'O', 'X')).toBe(4);
    for (let i = 0; i < 50; i += 1) {
      expect([0, 2, 6, 8]).toContain(getMediumMove(b('....X....'), 'O', 'X'));
    }
  });

  it('takes the last empty cell when only one is left', () => {
    expect(getMediumMove(b('XOXOOXXX.'), 'O', 'X')).toBe(8);
  });

  it('always returns a legal move across many positions', () => {
    for (let n = 0; n < 300; n += 1) {
      const board = Array(9).fill(null);
      const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
      const fill = Math.floor(Math.random() * 7);
      cells.slice(0, fill).forEach((c, i) => (board[c] = i % 2 ? 'O' : 'X'));
      if (calculateWinner(board)) continue;
      const move = getMediumMove(board, 'O', 'X');
      expect(board[move]).toBeNull();
    }
  });
});

describe('hard AI (minimax)', () => {
  it('scores terminal positions with depth preference', () => {
    expect(minimax(b('OO.XX.X..'), 'O', 'O')).toBeGreaterThan(0);
    expect(minimax(b('XXXOO....'), 'O', 'O')).toBeLessThan(0);
    expect(minimax(b('XOXXOOOXX'), 'X', 'O')).toBe(0);
  });

  it('takes an immediate win', () => {
    expect(getBestMoves(b('OO.XX....'), 'O')).toEqual([2]);
  });

  it('blocks an immediate loss', () => {
    expect(getBestMoves(b('XX.......'), 'O')).toEqual([2]);
    expect(getBestMoves(b('X...O...X'), 'O').every((i) => [1, 3, 5, 7].includes(i))).toBe(true);
  });

  it('answers a corner opening with the centre', () => {
    expect(getBestMoves(b('X........'), 'O')).toEqual([4]);
  });

  it('never loses: exhaustive over every possible human line', () => {
    for (const rng of [() => 0, () => 0.5, () => 0.999]) {
      for (const ai of ['X', 'O']) {
        for (const first of ['X', 'O']) {
          const human = other(ai);
          let games = 0;
          const walk = (board, turn) => {
            const result = calculateWinner(board);
            if (result) {
              if (result.winner !== ai) throw new Error(`AI lost as ${ai}: ${board.join('|')}`);
              games += 1;
              return;
            }
            if (isBoardFull(board)) {
              games += 1;
              return;
            }
            if (turn === ai) {
              const move = getAIMove(board, ai, human, 'hard', rng);
              expect(board[move]).toBeNull();
              board[move] = ai;
              walk(board, human);
              board[move] = null;
            } else {
              for (const move of getEmptyCells(board)) {
                board[move] = human;
                walk(board, ai);
                board[move] = null;
              }
            }
          };
          walk(Array(9).fill(null), first);
          expect(games).toBeGreaterThan(0);
        }
      }
    }
  });

  it('never makes a strategically losing move when a better one exists', () => {
    // Empty board: every opening is a draw for minimax; centre/corners/edges all legal.
    const first = getBestMoves(Array(9).fill(null), 'X');
    expect(first.length).toBe(9);
    // After X centre, a corner draws but an edge loses for O.
    const reply = getBestMoves(b('....X....'), 'O');
    expect(reply.sort()).toEqual([0, 2, 6, 8]);
  });
});
