import { DEFAULT_SETTINGS, DIFFICULTIES, EMPTY_SCORES, MARKS, MODES, THEMES } from './constants.js';
import { sanitizeHistory } from './matchHistory.js';

export const STORAGE_KEYS = {
  scores: 'ttt.v1.scores',
  history: 'ttt.v1.history',
  settings: 'ttt.v1.settings',
};

function read(key) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const isCount = (n) => Number.isInteger(n) && n >= 0 && n <= 1_000_000;

export function sanitizeScores(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SCORES };
  return {
    X: isCount(raw.X) ? raw.X : 0,
    O: isCount(raw.O) ? raw.O : 0,
    draws: isCount(raw.draws) ? raw.draws : 0,
  };
}

export function sanitizeSettings(raw) {
  const settings = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== 'object') return settings;
  if (MODES.includes(raw.mode)) settings.mode = raw.mode;
  if (DIFFICULTIES.includes(raw.difficulty)) settings.difficulty = raw.difficulty;
  if (MARKS.includes(raw.humanMark)) settings.humanMark = raw.humanMark;
  if (MARKS.includes(raw.firstPlayer)) settings.firstPlayer = raw.firstPlayer;
  if (typeof raw.sound === 'boolean') settings.sound = raw.sound;
  if (THEMES.includes(raw.theme)) settings.theme = raw.theme;
  return settings;
}

export const loadScores = () => sanitizeScores(read(STORAGE_KEYS.scores));
export const loadHistory = () => sanitizeHistory(read(STORAGE_KEYS.history));
export const loadSettings = () => sanitizeSettings(read(STORAGE_KEYS.settings));

export const saveScores = (scores) => write(STORAGE_KEYS.scores, scores);
export const saveHistory = (history) => write(STORAGE_KEYS.history, history);
export const saveSettings = (settings) => write(STORAGE_KEYS.settings, settings);
