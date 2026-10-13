import { motion } from 'framer-motion';
import { getPlayerLabel } from '../utils/gameLogic.js';

const TONES = {
  X: { text: 'text-accent', ring: 'border-accent/60 shadow-glow' },
  O: { text: 'text-violet', ring: 'border-violet/60 shadow-[0_0_24px_-4px_rgb(var(--c-accent2)/0.55)]' },
  draws: { text: 'text-muted', ring: 'border-line/40' },
};

function Stat({ title, sub, value, tone, active }) {
  const styles = TONES[tone];
  return (
    <div
      className={`surface min-w-0 px-2 py-2.5 text-center transition-all duration-300 sm:px-4 sm:py-3 ${
        active ? styles.ring : ''
      }`}
    >
      <p className="section-label truncate">{title}</p>
      <div className="relative h-8 overflow-hidden sm:h-9">
        <motion.p
          key={value}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${styles.text}`}
          data-testid={`score-${tone}`}
        >
          {value}
        </motion.p>
      </div>
      <p className="truncate text-[11px] text-muted sm:text-xs">{sub}</p>
    </div>
  );
}

export default function ScoreBoard({ scores, mode, humanMark, current, isOver }) {
  return (
    <section aria-label="Scoreboard" className="grid grid-cols-3 gap-2 sm:gap-3">
      <Stat
        title="X wins"
        sub={getPlayerLabel('X', mode, humanMark)}
        value={scores.X}
        tone="X"
        active={!isOver && current === 'X'}
      />
      <Stat title="Draws" sub="Even match" value={scores.draws} tone="draws" active={false} />
      <Stat
        title="O wins"
        sub={getPlayerLabel('O', mode, humanMark)}
        value={scores.O}
        tone="O"
        active={!isOver && current === 'O'}
      />
    </section>
  );
}
