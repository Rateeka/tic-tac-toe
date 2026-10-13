import { AnimatePresence, motion } from 'framer-motion';
import { getPlayerLabel } from '../utils/gameLogic.js';

const GLOW = {
  X: ['0 0 0 0 rgba(34,211,238,0.45)', '0 0 0 9px rgba(34,211,238,0)'],
  O: ['0 0 0 0 rgba(139,92,246,0.5)', '0 0 0 9px rgba(139,92,246,0)'],
};

function MarkChip({ mark, pulse }) {
  const color = mark === 'X' ? 'text-accent border-accent/60 bg-accent/10' : 'text-violet border-violet/60 bg-violet/10';
  return (
    <motion.span
      aria-hidden="true"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-black ${color}`}
      animate={pulse ? { boxShadow: GLOW[mark] } : { boxShadow: '0 0 0 0 rgba(0,0,0,0)' }}
      transition={pulse ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' } : { duration: 0.2 }}
    >
      {mark}
    </motion.span>
  );
}

function ThinkingDots() {
  return (
    <span aria-hidden="true" className="ml-1 inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-dot rounded-full bg-violet"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function GameStatus({ mode, humanMark, current, isOver, isDraw, winner, aiThinking }) {
  let key;
  let mark = current;
  let pulse = false;
  let content;

  if (isOver && isDraw) {
    key = 'draw';
    mark = null;
    content = <span className="font-semibold text-ink">It&apos;s a draw</span>;
  } else if (isOver) {
    key = `win-${winner}`;
    mark = winner;
    content = (
      <span className="font-semibold text-success">
        {mode === 'ai' && winner === humanMark ? 'You win!' : `${getPlayerLabel(winner, mode, humanMark)} wins!`}
      </span>
    );
    if (mode === 'ai' && winner !== humanMark) {
      content = <span className="font-semibold text-violet">AI wins</span>;
    }
  } else if (aiThinking) {
    key = `ai-${current}`;
    pulse = true;
    content = (
      <span className="flex items-center font-semibold text-ink">
        AI is thinking...
        <ThinkingDots />
      </span>
    );
  } else {
    key = `turn-${current}`;
    pulse = true;
    content = (
      <span className="font-semibold text-ink">
        {mode === 'ai' ? 'Your turn' : `Player ${current}'s turn`}
      </span>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="surface flex min-h-[56px] w-full max-w-[26rem] items-center justify-center px-4 py-2"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-3 text-sm sm:text-base"
        >
          {mark && <MarkChip mark={mark} pulse={pulse} />}
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
