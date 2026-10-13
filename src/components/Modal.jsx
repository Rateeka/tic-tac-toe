import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function ModalFrame({ onClose, role, labelledBy, describedBy, children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus management: focus inside on open, trap Tab, close on Escape, restore focus.
  useEffect(() => {
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel.querySelectorAll(FOCUSABLE));

    (panel.querySelector('[data-autofocus]') ?? focusables()[0])?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => closeRef.current()} aria-hidden="true" />
      <motion.div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="glass relative w-full max-w-sm bg-panel/95 p-6 text-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Modal({ open, ...props }) {
  return <AnimatePresence>{open && <ModalFrame {...props} />}</AnimatePresence>;
}
