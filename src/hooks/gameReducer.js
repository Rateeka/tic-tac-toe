import { EMPTY_SCORES } from '../utils/constants.js';
import { deriveGame } from '../utils/gameLogic.js';
import { addHistoryEntry, createHistoryEntry } from '../utils/matchHistory.js';

const CONFIG_KEYS = ['mode', 'difficulty', 'humanMark', 'firstPlayer'];
const PREF_KEYS = ['sound', 'theme'];

const pick = (source = {}, keys) =>
  Object.fromEntries(keys.filter((key) => key in source).map((key) => [key, source[key]]));

export const freshGame = (start) => ({ start, moves: [] });

export function createInitialState({ settings, scores = { ...EMPTY_SCORES }, history = [] }) {
  return { settings, scores, history, game: freshGame(settings.firstPlayer) };
}

/** Undo is allowed only on the human's turn in AI mode, and never after a finished game. */
export function canUndo(state) {
  const derived = deriveGame(state.game);
  if (derived.isOver) return false;
  const { mode, humanMark } = state.settings;
  if (mode === 'friend') return state.game.moves.length > 0;
  if (derived.current !== humanMark) return false;
  return state.game.moves.some((move) => move.mark === humanMark);
}

/**
 * Pure reducer. Scores and history are updated in the same transition that
 * finishes a game, which guarantees a result is counted exactly once. Stale or
 * illegal moves (wrong turn, occupied cell, finished game, outdated `expect`)
 * are ignored.
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'MOVE': {
      const { index, by, expect, id, now } = action;
      const { settings, game } = state;
      const derived = deriveGame(game);

      if (derived.isOver) return state;
      if (!Number.isInteger(index) || index < 0 || index > 8) return state;
      if (derived.board[index]) return state;
      if (expect !== game.moves.length) return state;

      if (settings.mode === 'ai') {
        if (by !== 'human' && by !== 'ai') return state;
        const humanTurn = derived.current === settings.humanMark;
        if ((by === 'human') !== humanTurn) return state;
      }

      const nextGame = { ...game, moves: [...game.moves, { index, mark: derived.current }] };
      const next = deriveGame(nextGame);
      if (!next.isOver) return { ...state, game: nextGame };

      const scoreKey = next.winner ?? 'draws';
      const entry = createHistoryEntry({
        id,
        ts: now,
        mode: settings.mode,
        difficulty: settings.difficulty,
        humanMark: settings.humanMark,
        winner: next.winner,
        moves: nextGame.moves.length,
      });

      return {
        ...state,
        game: nextGame,
        scores: { ...state.scores, [scoreKey]: state.scores[scoreKey] + 1 },
        history: addHistoryEntry(state.history, entry),
      };
    }

    case 'UNDO': {
      if (!canUndo(state)) return state;
      const { moves } = state.game;
      if (state.settings.mode === 'friend') {
        return { ...state, game: { ...state.game, moves: moves.slice(0, -1) } };
      }
      // AI mode: remove the human's last move together with the AI's reply.
      let lastHuman = -1;
      for (let i = moves.length - 1; i >= 0; i -= 1) {
        if (moves[i].mark === state.settings.humanMark) {
          lastHuman = i;
          break;
        }
      }
      return { ...state, game: { ...state.game, moves: moves.slice(0, lastHuman) } };
    }

    case 'NEW_GAME':
      return { ...state, game: freshGame(state.settings.firstPlayer) };

    case 'SET_CONFIG': {
      const patch = pick(action.config, CONFIG_KEYS);
      const changed = Object.keys(patch).some((key) => patch[key] !== state.settings[key]);
      if (!changed) return state;
      const settings = { ...state.settings, ...patch };
      return { ...state, settings, game: freshGame(settings.firstPlayer) };
    }

    case 'SET_PREF':
      return { ...state, settings: { ...state.settings, ...pick(action.prefs, PREF_KEYS) } };

    case 'RESET_SCORES':
      return { ...state, scores: { ...EMPTY_SCORES } };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    default:
      return state;
  }
}
