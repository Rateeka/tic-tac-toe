import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTicTacToe } from './hooks/useTicTacToe.js';
import { useToasts } from './hooks/useToasts.js';
import { MODE_LABELS } from './utils/constants.js';
import Confetti from './components/Confetti.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import GameBoard from './components/GameBoard.jsx';
import GameControls from './components/GameControls.jsx';
import GameModeSelector from './components/GameModeSelector.jsx';
import GameStatus from './components/GameStatus.jsx';
import Header from './components/Header.jsx';
import MatchHistory from './components/MatchHistory.jsx';
import ResultModal from './components/ResultModal.jsx';
import ScoreBoard from './components/ScoreBoard.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Toasts from './components/Toasts.jsx';

const CONFIRMS = {
  scores: {
    title: 'Reset all scores?',
    message: 'X wins, O wins and draws will go back to zero. Match history is kept.',
    confirmLabel: 'Reset scores',
  },
  history: {
    title: 'Clear match history?',
    message: 'Every recorded match will be removed. Scores are kept.',
    confirmLabel: 'Clear history',
  },
};

export default function App() {
  const ttt = useTicTacToe();
  const { settings, scores, history, game } = ttt;
  const { toasts, push, dismiss } = useToasts();

  const [resultOpen, setResultOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  // Reveal the result a beat after the winning line lights up.
  const celebrate = Boolean(game.winner) && (settings.mode === 'friend' || game.winner === settings.humanMark);
  useEffect(() => {
    if (!game.isOver) {
      setResultOpen(false);
      setConfetti(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setResultOpen(true);
      setConfetti(celebrate);
    }, 650);
    return () => clearTimeout(timer);
  }, [game.isOver, celebrate]);

  useEffect(() => {
    if (!confetti) return undefined;
    const timer = setTimeout(() => setConfetti(false), 3800);
    return () => clearTimeout(timer);
  }, [confetti]);

  const changeConfig = (patch) => {
    const changed = Object.keys(patch).some((key) => settings[key] !== patch[key]);
    if (!changed) return;
    ttt.setConfig(patch);
    push(patch.mode ? `Switched to ${MODE_LABELS[patch.mode]}` : 'Settings updated. New game started.');
  };

  const handleNewGame = () => {
    ttt.newGame();
    push('New game started', 'success');
  };

  const handleUndo = () => {
    ttt.undo();
    push('Move undone');
  };

  const handleConfirm = () => {
    if (confirm === 'scores') {
      ttt.resetScores();
      push('Scores reset', 'warn');
    } else if (confirm === 'history') {
      ttt.clearHistory();
      push('Match history cleared', 'warn');
    }
    setConfirm(null);
  };

  const toggleSound = () => {
    ttt.setPref({ sound: !settings.sound });
    push(settings.sound ? 'Sound off' : 'Sound on');
  };

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    ttt.setPref({ theme: next });
    push(`${next === 'dark' ? 'Dark' : 'Light'} theme`);
  };

  const hasScores = scores.X + scores.O + scores.draws > 0;
  const dialog = CONFIRMS[confirm] ?? CONFIRMS.scores;

  return (
    <div className="min-h-screen px-3 pb-10 pt-4 sm:px-6 sm:pt-6 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <Header
          sound={settings.sound}
          theme={settings.theme}
          onToggleSound={toggleSound}
          onToggleTheme={toggleTheme}
        />

        <main className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,320px)] xl:gap-5">
          <section
            aria-label="Game"
            className="glass order-1 mx-auto w-full max-w-2xl p-3.5 sm:p-6 lg:col-span-2 xl:order-2 xl:col-span-1"
          >
            <GameModeSelector mode={settings.mode} onChange={(mode) => changeConfig({ mode })} />

            <div className="mt-4">
              <ScoreBoard
                scores={scores}
                mode={settings.mode}
                humanMark={settings.humanMark}
                current={game.current}
                isOver={game.isOver}
              />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={settings.mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="mt-4 flex flex-col items-center gap-4"
              >
                <GameStatus
                  mode={settings.mode}
                  humanMark={settings.humanMark}
                  current={game.current}
                  isOver={game.isOver}
                  isDraw={game.isDraw}
                  winner={game.winner}
                  aiThinking={ttt.aiThinking}
                />
                <GameBoard
                  board={game.board}
                  winLine={game.line}
                  canPlay={ttt.canPlay}
                  current={game.current}
                  onSelect={ttt.play}
                />
              </motion.div>
            </AnimatePresence>

            <div className="mt-5">
              <GameControls
                canUndo={ttt.canUndo}
                hasScores={hasScores}
                onUndo={handleUndo}
                onNewGame={handleNewGame}
                onResetScores={() => setConfirm('scores')}
              />
            </div>
          </section>

          <aside className="order-2 min-w-0 xl:order-1">
            <SettingsPanel settings={settings} onChange={changeConfig} />
          </aside>

          <aside className="order-3 min-w-0">
            <MatchHistory history={history} onClear={() => setConfirm('history')} />
          </aside>
        </main>
      </div>

      <ResultModal
        open={resultOpen}
        game={game}
        settings={settings}
        onPlayAgain={handleNewGame}
        onClose={() => setResultOpen(false)}
      />
      <ConfirmDialog
        open={confirm !== null}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
      <Confetti active={confetti} />
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
