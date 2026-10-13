import { calculateWinner, getEmptyCells, other } from './gameLogic.js';

/**
 * Classic minimax with alpha-beta pruning. Scores are from the AI's point of
 * view and depth-adjusted so the AI prefers faster wins and slower losses.
 * `board` is mutated during the search and always restored.
 */
export function minimax(board, turn, ai, depth = 0, alpha = -Infinity, beta = Infinity) {
  const result = calculateWinner(board);
  if (result) return result.winner === ai ? 10 - depth : depth - 10;

  const empties = getEmptyCells(board);
  if (empties.length === 0) return 0;

  const maximizing = turn === ai;
  let best = maximizing ? -Infinity : Infinity;

  for (const index of empties) {
    board[index] = turn;
    const score = minimax(board, other(turn), ai, depth + 1, alpha, beta);
    board[index] = null;

    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

/** Every root move that achieves the optimal minimax score. */
export function getBestMoves(board, ai) {
  const work = [...board];
  let bestScore = -Infinity;
  let best = [];

  for (const index of getEmptyCells(work)) {
    work[index] = ai;
    // Full window at the root so tied moves keep their exact score.
    const score = minimax(work, other(ai), ai, 1);
    work[index] = null;

    if (score > bestScore) {
      bestScore = score;
      best = [index];
    } else if (score === bestScore) {
      best.push(index);
    }
  }
  return best;
}

/** Optimal move; ties are broken randomly so games don't feel scripted. */
export function getMinimaxMove(board, ai, rng = Math.random) {
  const best = getBestMoves(board, ai);
  if (best.length === 0) return -1;
  return best[Math.floor(rng() * best.length)];
}
