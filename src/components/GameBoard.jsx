import GameCell from './GameCell.jsx';

const ARROWS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };

export default function GameBoard({ board, winLine, canPlay, current, onSelect }) {
  const handleKeyDown = (event) => {
    const step = ARROWS[event.key];
    if (step === undefined) return;

    const cells = Array.from(event.currentTarget.querySelectorAll('button'));
    const from = cells.indexOf(event.target.closest('button'));
    if (from === -1) return;

    const col = from % 3;
    if ((event.key === 'ArrowLeft' && col === 0) || (event.key === 'ArrowRight' && col === 2)) return;
    const to = from + step;
    if (to < 0 || to > 8) return;

    event.preventDefault();
    cells[to].focus();
  };

  return (
    <div
      role="group"
      aria-label="Game board"
      onKeyDown={handleKeyDown}
      className="w-full max-w-[26rem] rounded-[28px] border border-line/20 bg-linear-to-br from-card/90 to-panel/90 p-2.5 shadow-glass sm:p-3.5"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {board.map((value, index) => (
          <GameCell
            key={index}
            index={index}
            value={value}
            interactive={canPlay && !value}
            isWinning={winLine.includes(index)}
            previewMark={current}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
