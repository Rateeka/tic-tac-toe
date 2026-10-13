import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AI_THINK_MS } from '../utils/constants.js';
import { deriveGame, other } from '../utils/gameLogic.js';
import { getAIMove } from '../utils/ai.js';
import { playSound } from '../utils/sound.js';
import {
  loadHistory,
  loadScores,
  loadSettings,
  saveHistory,
  saveScores,
  saveSettings,
} from '../utils/storage.js';
import { canUndo, createInitialState, gameReducer } from './gameReducer.js';

const stamp = () => {
  const now = Date.now();
  return { now, id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}` };
};

/**
 * All game state and rules live here; components only render and dispatch.
 * Handles persistence, the AI turn loop and sound effects.
 */
export function useTicTacToe() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState({
      settings: loadSettings(),
      scores: loadScores(),
      history: loadHistory(),
    }),
  );

  const { settings, scores, history } = state;
  const game = useMemo(() => deriveGame(state.game), [state.game]);

  const aiMark = other(settings.humanMark);
  const aiThinking = settings.mode === 'ai' && !game.isOver && game.current === aiMark;
  const canPlay = !game.isOver && !aiThinking;
  const undoable = canUndo(state);
  const moveCount = state.game.moves.length;

  // ---- persistence -------------------------------------------------------
  useEffect(() => void saveScores(scores), [scores]);
  useEffect(() => void saveHistory(history), [history]);
  useEffect(() => void saveSettings(settings), [settings]);

  // ---- AI turn loop ------------------------------------------------------
  // The timer is tied to the exact game position. Any change (undo, new game,
  // settings, unmount) cancels it, and the reducer additionally rejects a move
  // whose `expect` no longer matches, so two AI moves can never fire together.
  useEffect(() => {
    if (!aiThinking) return undefined;
    const expect = state.game.moves.length;
    const board = [...game.board];
    const delay = AI_THINK_MS.min + Math.random() * (AI_THINK_MS.max - AI_THINK_MS.min);

    const timer = setTimeout(() => {
      const index = getAIMove(board, aiMark, settings.humanMark, settings.difficulty);
      dispatch({ type: 'MOVE', index, by: 'ai', expect, ...stamp() });
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiThinking, state.game, settings.difficulty, settings.humanMark]);

  // ---- sound effects -----------------------------------------------------
  const prevMoves = useRef(moveCount);
  useEffect(() => {
    const previous = prevMoves.current;
    prevMoves.current = moveCount;
    if (moveCount > previous) {
      const { mark } = state.game.moves[moveCount - 1];
      playSound(mark === 'X' ? 'placeX' : 'placeO', settings.sound);
    } else if (moveCount < previous) {
      playSound(moveCount === 0 ? 'click' : 'undo', settings.sound);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount]);

  useEffect(() => {
    if (!game.isOver) return;
    if (game.isDraw) playSound('draw', settings.sound);
    else if (settings.mode === 'ai' && game.winner !== settings.humanMark) playSound('lose', settings.sound);
    else playSound('win', settings.sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.isOver]);

  // ---- actions -----------------------------------------------------------
  const play = useCallback(
    (index) => dispatch({ type: 'MOVE', index, by: 'human', expect: moveCount, ...stamp() }),
    [moveCount],
  );
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const newGame = useCallback(() => dispatch({ type: 'NEW_GAME' }), []);
  const resetScores = useCallback(() => dispatch({ type: 'RESET_SCORES' }), []);
  const clearHistory = useCallback(() => dispatch({ type: 'CLEAR_HISTORY' }), []);
  const setConfig = useCallback((config) => dispatch({ type: 'SET_CONFIG', config }), []);
  const setPref = useCallback((prefs) => dispatch({ type: 'SET_PREF', prefs }), []);

  return {
    settings,
    scores,
    history,
    game,
    aiMark,
    aiThinking,
    canPlay,
    canUndo: undoable,
    play,
    undo,
    newGame,
    resetScores,
    clearHistory,
    setConfig,
    setPref,
  };
}
