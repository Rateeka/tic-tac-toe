import { Bot, Handshake, Trophy } from 'lucide-react';
import { getPlayerLabel } from '../utils/gameLogic.js';
import Modal from './Modal.jsx';

function describeResult(game, settings) {
  if (!game.isOver) return null;
  const { mode, humanMark, difficulty } = settings;

  if (game.isDraw) {
    return {
      Icon: Handshake,
      tone: 'text-accent bg-accent/15',
      title: "It's a draw",
      text: 'Evenly matched. Nobody found a winning line.',
    };
  }
  if (mode === 'ai') {
    return game.winner === humanMark
      ? {
          Icon: Trophy,
          tone: 'text-success bg-success/15',
          title: 'You win!',
          text: `Nicely played against the ${difficulty} AI in ${game.moveCount} moves.`,
        }
      : {
          Icon: Bot,
          tone: 'text-violet bg-violet/15',
          title: 'AI wins',
          text: 'The computer took this round. Ready for a rematch?',
        };
  }
  return {
    Icon: Trophy,
    tone: 'text-success bg-success/15',
    title: `${getPlayerLabel(game.winner, mode, humanMark)} wins!`,
    text: `Three in a row after ${game.moveCount} moves.`,
  };
}

export default function ResultModal({ open, game, settings, onPlayAgain, onClose }) {
  const info = describeResult(game, settings);

  return (
    <Modal open={open && Boolean(info)} role="dialog" labelledBy="result-title" describedBy="result-text" onClose={onClose}>
      {info && (
        <>
          <span className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${info.tone}`}>
            <info.Icon size={30} aria-hidden="true" />
          </span>
          <h2 id="result-title" className="mt-4 text-2xl font-extrabold">
            {info.title}
          </h2>
          <p id="result-text" className="mt-1.5 text-sm text-muted">
            {info.text}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" className="btn" onClick={onClose}>
              Review board
            </button>
            <button type="button" className="btn-primary" onClick={onPlayAgain} data-autofocus>
              Play again
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
