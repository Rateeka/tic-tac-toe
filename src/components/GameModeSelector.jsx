import { motion } from 'framer-motion';
import { Bot, Users } from 'lucide-react';

const OPTIONS = [
  { id: 'ai', label: 'Play with AI', hint: 'Solo vs computer', Icon: Bot },
  { id: 'friend', label: 'Play with a Friend', hint: 'Same device', Icon: Users },
];

export default function GameModeSelector({ mode, onChange }) {
  return (
    <div role="radiogroup" aria-label="Game mode" className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {OPTIONS.map(({ id, label, hint, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`relative min-h-[60px] overflow-hidden rounded-2xl border p-3 text-left transition duration-200 active:scale-[0.98] sm:p-4 ${
              active ? 'border-accent/60' : 'border-line/15 bg-card/60 hover:border-accent/40'
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 bg-linear-to-br from-accent/25 to-violet/25"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                  active ? 'bg-linear-to-br from-accent to-violet text-onaccent' : 'bg-card text-muted'
                }`}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-ink sm:text-[15px]">{label}</span>
                <span className="hidden text-xs text-muted sm:block">{hint}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
