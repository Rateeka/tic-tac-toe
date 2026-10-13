import { findWinningMove, getEmptyCells } from './gameLogic.js';
import { getMinimaxMove } from './minimax.js';

const CORNERS = [0, 2, 6, 8];
const EDGES = [1, 3, 5, 7];

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

/** Easy: any empty cell. */
export function getEasyMove(board, rng = Math.random) {
  const empties = getEmptyCells(board);
  return empties.length ? pick(empties, rng) : -1;
}

/**
 * Medium: win if possible, otherwise block the opponent's immediate win,
 * otherwise take centre, then a corner, then an edge.
 */
export function getMediumMove(board, ai, human, rng = Math.random) {
  const win = findWinningMove(board, ai);
  if (win !== -1) return win;

  const block = findWinningMove(board, human);
  if (block !== -1) return block;

  if (!board[4]) return 4;

  const corners = CORNERS.filter((i) => !board[i]);
  if (corners.length) return pick(corners, rng);

  const edges = EDGES.filter((i) => !board[i]);
  return edges.length ? pick(edges, rng) : -1;
}

/** Hard: optimal play via minimax. */
export function getHardMove(board, ai, rng = Math.random) {
  return getMinimaxMove(board, ai, rng);
}

/** Returns a cell index for the AI, or -1 when the board is full. */
export function getAIMove(board, ai, human, difficulty, rng = Math.random) {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board, rng);
    case 'hard':
      return getHardMove(board, ai, rng);
    case 'medium':
    default:
      return getMediumMove(board, ai, human, rng);
  }
}
