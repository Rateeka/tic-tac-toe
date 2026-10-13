import { DIFFICULTIES, DIFFICULTY_LABELS, MARKS, MODES } from './constants.js';

export const MAX_HISTORY = 30;

export function createHistoryEntry({ id, ts, mode, difficulty, humanMark, winner, moves }) {
  const isAi = mode === 'ai';
  return {
    id,
    ts,
    mode,
    difficulty: isAi ? difficulty : null,
    humanMark: isAi ? humanMark : null,
    winner: winner ?? null,
    moves,
  };
}

export function addHistoryEntry(history, entry) {
  return [entry, ...history].slice(0, MAX_HISTORY);
}

export function isValidEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (typeof entry.id !== 'string' || entry.id.length === 0) return false;
  if (typeof entry.ts !== 'number' || !Number.isFinite(entry.ts)) return false;
  if (!MODES.includes(entry.mode)) return false;
  if (entry.winner !== null && !MARKS.includes(entry.winner)) return false;
  if (!Number.isInteger(entry.moves) || entry.moves < 5 || entry.moves > 9) return false;
  if (entry.mode === 'ai') {
    return DIFFICULTIES.includes(entry.difficulty) && MARKS.includes(entry.humanMark);
  }
  return entry.difficulty === null && entry.humanMark === null;
}

/** Drops anything malformed, so corrupted storage can never crash the UI. */
export function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidEntry).slice(0, MAX_HISTORY);
}

export function describeEntry(entry) {
  let title;
  if (entry.winner === null) title = 'Draw';
  else if (entry.mode === 'ai') title = entry.winner === entry.humanMark ? 'You won' : 'AI won';
  else title = `Player ${entry.winner} won`;

  const context =
    entry.mode === 'ai' ? `vs AI · ${DIFFICULTY_LABELS[entry.difficulty]}` : 'Friend match';
  return { title, detail: `${context} · ${entry.moves} moves` };
}

export function formatTimestamp(ts, now = Date.now()) {
  const date = new Date(ts);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === new Date(now).toDateString()) return time;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}
