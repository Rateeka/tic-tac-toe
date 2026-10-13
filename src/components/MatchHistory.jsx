import { AnimatePresence, motion } from 'framer-motion';
import { Handshake, History, Trash2 } from 'lucide-react';
import { describeEntry, formatTimestamp } from '../utils/matchHistory.js';

function Badge({ winner }) {
  if (winner === null) {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-line/15 text-muted">
        <Handshake size={16} aria-hidden="true" />
      </span>
    );
  }
  const tone = winner === 'X' ? 'bg-accent/15 text-accent' : 'bg-violet/15 text-violet';
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${tone}`}>
      {winner}
    </span>
  );
}

export default function MatchHistory({ history, onClear }) {
  return (
    <section aria-labelledby="history-title" className="glass p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="history-title" className="flex items-center gap-2 text-base font-bold">
          <History size={17} className="text-accent" aria-hidden="true" />
          Match history
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={history.length === 0}
          className="btn min-h-[40px] px-3 text-xs"
        >
          <Trash2 size={14} aria-hidden="true" />
          Clear History
        </button>
      </div>

      {history.length === 0 ? (
        <p className="surface mt-4 px-4 py-8 text-center text-sm text-muted">
          No matches yet. Finished games will show up here.
        </p>
      ) : (
        <ul className="thin-scroll mt-4 max-h-80 space-y-2 overflow-y-auto pr-1" data-testid="history-list">
          <AnimatePresence initial={false}>
            {history.map((entry) => {
              const { title, detail } = describeEntry(entry);
              return (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="surface flex items-center gap-3 p-2.5"
                >
                  <Badge winner={entry.winner} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="truncate text-xs text-muted">{detail}</p>
                  </div>
                  <time className="shrink-0 text-[11px] text-muted" dateTime={new Date(entry.ts).toISOString()}>
                    {formatTimestamp(entry.ts)}
                  </time>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
