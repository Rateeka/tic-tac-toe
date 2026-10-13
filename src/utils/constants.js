export const MODES = ['ai', 'friend'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const MARKS = ['X', 'O'];
export const THEMES = ['dark', 'light'];

export const MODE_LABELS = { ai: 'Play with AI', friend: 'Play with a Friend' };
export const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export const DEFAULT_SETTINGS = Object.freeze({
  mode: 'ai',
  difficulty: 'medium',
  humanMark: 'X',
  firstPlayer: 'X',
  sound: true,
  theme: 'dark',
});

export const EMPTY_SCORES = Object.freeze({ X: 0, O: 0, draws: 0 });

/** Range (ms) of the artificial "thinking" delay before the AI moves. */
export const AI_THINK_MS = { min: 450, max: 800 };
