import { memo } from 'react';
import { motion } from 'framer-motion';

const markStyle = (mark) => ({
  stroke: mark === 'X' ? 'rgb(var(--c-accent))' : 'rgb(var(--c-accent2))',
  filter: `drop-shadow(0 0 6px rgb(var(--c-${mark === 'X' ? 'accent' : 'accent2'}) / 0.55))`,
});

function Mark({ mark, animated }) {
  const draw = animated
    ? {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
      }
    : { initial: false, animate: { pathLength: 1, opacity: 1 } };

  return (
    <svg viewBox="0 0 100 100" className="h-3/5 w-3/5" fill="none" aria-hidden="true">
      {mark === 'X' ? (
        <>
          <motion.path
            d="M24 24 L76 76"
            strokeWidth="11"
            strokeLinecap="round"
            style={markStyle('X')}
            {...draw}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
          <motion.path
            d="M76 24 L24 76"
            strokeWidth="11"
            strokeLinecap="round"
            style={markStyle('X')}
            {...draw}
            transition={{ duration: 0.22, delay: animated ? 0.12 : 0, ease: 'easeOut' }}
          />
        </>
      ) : (
        <motion.circle
          cx="50"
          cy="50"
          r="27"
          strokeWidth="11"
          strokeLinecap="round"
          style={markStyle('O')}
          {...draw}
          transition={{ duration: 0.38, ease: 'easeOut' }}
        />
      )}
    </svg>
  );
}

function GameCell({ index, value, interactive, isWinning, previewMark, onSelect }) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const label = `Row ${row}, column ${col}, ${value ?? 'empty'}`;

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-disabled={!interactive}
      data-testid={`cell-${index}`}
      onClick={() => interactive && onSelect(index)}
      whileHover={interactive ? { scale: 1.04 } : undefined}
      whileTap={interactive ? { scale: 0.94 } : undefined}
      animate={
        isWinning
          ? {
              scale: [1, 1.06, 1],
              boxShadow: [
                '0 0 0 0 rgba(52,211,153,0.55)',
                '0 0 22px 4px rgba(52,211,153,0.45)',
                '0 0 0 0 rgba(52,211,153,0.55)',
              ],
            }
          : { scale: 1, boxShadow: '0 0 0 0 rgba(52,211,153,0)' }
      }
      transition={
        isWinning
          ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 28 }
      }
      className={`group relative grid aspect-square w-full place-items-center rounded-2xl border transition-colors duration-200 ${
        isWinning
          ? 'border-success/80 bg-success/15'
          : 'border-line/15 bg-card/80 hover:border-accent/40'
      } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {value ? (
        <Mark mark={value} animated />
      ) : (
        interactive &&
        previewMark && (
          <span className="grid h-full w-full place-items-center opacity-0 transition-opacity duration-150 group-hover:opacity-25 group-focus-visible:opacity-25">
            <Mark mark={previewMark} animated={false} />
          </span>
        )
      )}
    </motion.button>
  );
}

export default memo(GameCell);
