import { Eraser, Plus, Undo2 } from 'lucide-react';

export default function GameControls({ canUndo, hasScores, onUndo, onNewGame, onResetScores }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
        <Undo2 size={17} aria-hidden="true" />
        Undo
      </button>
      <button type="button" className="btn-primary" onClick={onNewGame}>
        <Plus size={17} aria-hidden="true" />
        New Game
      </button>
      <button type="button" className="btn" onClick={onResetScores} disabled={!hasScores}>
        <Eraser size={17} aria-hidden="true" />
        <span className="sm:hidden">Reset</span>
        <span className="hidden sm:inline">Reset Scores</span>
        <span className="sr-only sm:hidden"> Scores</span>
      </button>
    </div>
  );
}
