import { motion } from 'framer-motion';
import { Cpu, Users } from 'lucide-react';
import { DIFFICULTY_LABELS, MODE_LABELS } from '../utils/constants.js';
import DifficultySelector from './DifficultySelector.jsx';
import Segmented from './Segmented.jsx';

const MARK_OPTIONS = [
  { value: 'X', label: 'X' },
  { value: 'O', label: 'O' },
];

function Field({ label, children }) {
  return (
    <div className="mt-4">
      <p className="section-label mb-2">{label}</p>
      {children}
    </div>
  );
}

export default function SettingsPanel({ settings, onChange }) {
  const { mode, difficulty, humanMark, firstPlayer } = settings;
  const Icon = mode === 'ai' ? Cpu : Users;

  const firstHint =
    mode === 'ai'
      ? firstPlayer === humanMark
        ? 'You move first.'
        : 'AI moves first.'
      : `Player ${firstPlayer} moves first.`;

  return (
    <section aria-labelledby="settings-title" className="glass p-4 sm:p-5">
      <h2 id="settings-title" className="text-base font-bold">
        Game setup
      </h2>

      <div className="surface mt-3 flex items-center gap-3 p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-accent to-violet text-onaccent">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="section-label">Current mode</p>
          <p className="truncate text-sm font-semibold" data-testid="current-mode">
            {MODE_LABELS[mode]}
            {mode === 'ai' && <span className="text-muted"> · {DIFFICULTY_LABELS[difficulty]}</span>}
          </p>
        </div>
      </div>

      {mode === 'ai' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Field label="Difficulty">
            <DifficultySelector value={difficulty} onChange={(value) => onChange({ difficulty: value })} />
          </Field>
          <Field label="You play as">
            <Segmented
              id="human-mark"
              label="You play as"
              value={humanMark}
              options={MARK_OPTIONS}
              onChange={(value) => onChange({ humanMark: value })}
            />
          </Field>
        </motion.div>
      )}

      <Field label="First move">
        <Segmented
          id="first-player"
          label="First move"
          value={firstPlayer}
          options={MARK_OPTIONS}
          onChange={(value) => onChange({ firstPlayer: value })}
        />
        <p className="mt-2 text-xs text-muted" data-testid="first-hint">
          {firstHint}
        </p>
      </Field>
    </section>
  );
}
