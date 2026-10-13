import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const TONES = {
  success: { Icon: CheckCircle2, color: 'text-success' },
  warn: { Icon: AlertTriangle, color: 'text-amber-400' },
  info: { Icon: Info, color: 'text-accent' },
};

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { Icon, color } = TONES[toast.tone] ?? TONES.info;
          return (
            <motion.div
              key={toast.id}
              layout
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={() => onDismiss(toast.id)}
              className="glass pointer-events-auto flex max-w-sm rounded-2xl cursor-pointer items-center gap-2.5 bg-panel/95 px-4 py-3 text-sm font-medium"
            >
              <Icon size={17} className={color} aria-hidden="true" />
              {toast.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
