import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const COLORS = ['#22D3EE', '#8B5CF6', '#34D399', '#F8FAFC', '#F472B6', '#FBBF24'];

export default function Confetti({ active, count = 44 }) {
  const reduceMotion = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const round = i % 3 === 0;
        const size = 6 + Math.random() * 6;
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2.2 + Math.random() * 1.4,
          drift: (Math.random() - 0.5) * 180,
          spin: 360 + Math.random() * 540,
          width: size,
          height: round ? size : size * 1.6,
          color: COLORS[i % COLORS.length],
          round,
        };
      }),
    // A fresh burst each time confetti is switched on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, active],
  );

  if (!active || reduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-0 block"
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            background: piece.color,
            borderRadius: piece.round ? 9999 : 2,
          }}
          initial={{ y: '-6vh', x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '106vh', x: piece.drift, rotate: piece.spin, opacity: [1, 1, 0] }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
