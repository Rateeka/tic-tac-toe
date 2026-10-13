import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 2400;
const MAX_TOASTS = 3;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'info') => {
      counter.current += 1;
      const id = counter.current;
      setToasts((list) => [...list.slice(-(MAX_TOASTS - 1)), { id, message, tone }]);
      timers.current.set(id, setTimeout(() => dismiss(id), TOAST_MS));
    },
    [dismiss],
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  return { toasts, push, dismiss };
}
