export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const other = (mark) => (mark === 'X' ? 'O' : 'X');

/** Returns `{ winner, line }` when a player has three in a row, otherwise null. */
export function calculateWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

export const isBoardFull = (board) => board.every(Boolean);

export const isDraw = (board) => !calculateWinner(board) && isBoardFull(board);

export function getEmptyCells(board) {
  const cells = [];
  board.forEach((value, index) => {
    if (!value) cells.push(index);
  });
  return cells;
}

/** Index where `mark` can complete a line right now, or -1. */
export function findWinningMove(board, mark) {
  for (const line of WIN_LINES) {
    const owned = line.filter((i) => board[i] === mark).length;
    const empty = line.find((i) => !board[i]);
    if (owned === 2 && empty !== undefined) return empty;
  }
  return -1;
}

export function boardFromMoves(moves) {
  const board = Array(9).fill(null);
  for (const move of moves) board[move.index] = move.mark;
  return board;
}

/**
 * Pure projection of a stored game (`{ start, moves }`) into everything the UI
 * needs. The move list is the single source of truth, which keeps undo and turn
 * restoration trivially correct.
 */
export function deriveGame(game) {
  const board = boardFromMoves(game.moves);
  const current = game.moves.length % 2 === 0 ? game.start : other(game.start);
  const result = calculateWinner(board);
  const draw = !result && isBoardFull(board);
  return {
    board,
    current,
    winner: result ? result.winner : null,
    line: result ? result.line : [],
    isDraw: draw,
    isOver: Boolean(result) || draw,
    moveCount: game.moves.length,
  };
}

export function getPlayerLabel(mark, mode, humanMark) {
  if (mode === 'ai') return mark === humanMark ? 'You' : 'AI';
  return `Player ${mark}`;
}
