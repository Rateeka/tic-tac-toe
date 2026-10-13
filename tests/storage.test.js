import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/utils/constants.js';
import {
  STORAGE_KEYS,
  loadHistory,
  loadScores,
  loadSettings,
  sanitizeScores,
  saveHistory,
  saveScores,
  saveSettings,
} from '../src/utils/storage.js';
import {
  MAX_HISTORY,
  addHistoryEntry,
  createHistoryEntry,
  describeEntry,
  sanitizeHistory,
} from '../src/utils/matchHistory.js';

const entry = (over = {}) =>
  createHistoryEntry({
    id: 'a',
    ts: 1_700_000_000_000,
    mode: 'ai',
    difficulty: 'hard',
    humanMark: 'X',
    winner: 'O',
    moves: 6,
    ...over,
  });

beforeEach(() => localStorage.clear());

describe('persistence', () => {
  it('starts clean for new users', () => {
    expect(loadScores()).toEqual({ X: 0, O: 0, draws: 0 });
    expect(loadHistory()).toEqual([]);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips scores, history and settings', () => {
    saveScores({ X: 3, O: 2, draws: 1 });
    saveHistory([entry(), entry({ id: 'b', mode: 'friend', winner: null, moves: 9 })]);
    saveSettings({ ...DEFAULT_SETTINGS, difficulty: 'hard', theme: 'light', sound: false });

    expect(loadScores()).toEqual({ X: 3, O: 2, draws: 1 });
    expect(loadHistory()).toHaveLength(2);
    expect(loadSettings()).toMatchObject({ difficulty: 'hard', theme: 'light', sound: false });
  });

  it('survives corrupted JSON', () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.setItem(key, '{not json'));
    expect(loadScores()).toEqual({ X: 0, O: 0, draws: 0 });
    expect(loadHistory()).toEqual([]);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('validation', () => {
  it('rejects invalid score values field by field', () => {
    expect(sanitizeScores({ X: -1, O: 'five', draws: 2.5 })).toEqual({ X: 0, O: 0, draws: 0 });
    expect(sanitizeScores({ X: 4, O: NaN, draws: 1 })).toEqual({ X: 4, O: 0, draws: 1 });
    expect(sanitizeScores(null)).toEqual({ X: 0, O: 0, draws: 0 });
    expect(sanitizeScores([1, 2, 3])).toEqual({ X: 0, O: 0, draws: 0 });
  });

  it('falls back to defaults for invalid settings', () => {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ mode: 'online', difficulty: 'insane', humanMark: 'Z', firstPlayer: 1, sound: 'yes', theme: 'neon' }),
    );
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid settings while discarding invalid ones', () => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ mode: 'friend', difficulty: 'nope', theme: 'light' }));
    expect(loadSettings()).toMatchObject({ mode: 'friend', difficulty: 'medium', theme: 'light' });
  });

  it('drops malformed history entries but keeps valid ones', () => {
    const good = entry();
    const raw = [
      good,
      null,
      'x',
      { ...good, id: '' },
      { ...good, ts: 'now' },
      { ...good, mode: 'online' },
      { ...good, winner: 'Z' },
      { ...good, moves: 2 },
      { ...good, difficulty: 'impossible' },
      { ...good, mode: 'friend' }, // friend entries must not carry ai fields
    ];
    expect(sanitizeHistory(raw)).toEqual([good]);
    expect(sanitizeHistory({ not: 'an array' })).toEqual([]);
  });

  it('caps history length', () => {
    let history = [];
    for (let i = 0; i < MAX_HISTORY + 10; i += 1) history = addHistoryEntry(history, entry({ id: `e${i}` }));
    expect(history).toHaveLength(MAX_HISTORY);
    expect(history[0].id).toBe(`e${MAX_HISTORY + 9}`);
  });

  it('describes entries for display', () => {
    expect(describeEntry(entry({ winner: 'X' })).title).toBe('You won');
    expect(describeEntry(entry({ winner: 'O' })).title).toBe('AI won');
    expect(describeEntry(entry({ winner: null, moves: 9 })).title).toBe('Draw');
    expect(describeEntry(entry({ mode: 'friend', difficulty: null, humanMark: null, winner: 'O' })).title).toBe(
      'Player O won',
    );
  });
});
