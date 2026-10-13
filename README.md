# Tic Tac Toe — Premium Edition

A polished X-O game built with React, Vite, Tailwind CSS 4, Framer Motion and Lucide icons.
Two playable modes: **Player vs AI** (Easy / Medium / Hard minimax) and **Player vs Friend** on the same device.
No backend, no paid APIs. Scores, match history and settings persist in `localStorage`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build
npm test           # 75 tests: rules, AI, reducer, storage, full UI flows
```

Requires Node 20+ (Tailwind CSS v4).

## Project structure

```
src/
  App.jsx                    layout, result flow, confirmations, toasts
  hooks/
    useTicTacToe.js          state, AI turn loop, persistence, sound
    gameReducer.js           pure reducer (moves, undo, scores, history, config)
    useToasts.js
  utils/
    gameLogic.js             win/draw detection, derived game state
    minimax.js               minimax + alpha-beta
    ai.js                    easy / medium / hard move selection
    storage.js               localStorage load/save with validation
    matchHistory.js          history entries, sanitising, formatting
    sound.js                 Web Audio sound effects (no asset files)
    constants.js
  components/
    Header, GameModeSelector, GameBoard, GameCell, ScoreBoard, GameStatus,
    DifficultySelector, GameControls, MatchHistory, ResultModal, SettingsPanel,
    Segmented, Modal, ConfirmDialog, Toasts, Confetti
tests/                       vitest + Testing Library
```

## Design notes

- **Single source of truth.** A game is just `{ start, moves[] }`. Board, current turn, winner and draw are derived, so undo and turn restoration are correct by construction.
- **Scores are counted exactly once.** The reducer updates scores and history in the same transition that finishes a game, and rejects any move afterwards.
- **AI safety.** The AI move is scheduled by an effect tied to the exact board position and cancelled on undo, new game, settings change or unmount. Moves carry an `expect` move count and a `by` actor, so stale timers, double moves, moves after a win/draw, and human clicks during the AI turn are all rejected by the reducer.
- **AI levels.** Easy picks a random empty cell. Medium wins if it can, blocks your immediate win, then prefers centre, then corners. Hard uses minimax with alpha-beta pruning and depth-aware scores; it is unbeatable (verified exhaustively in `tests/logic.test.js`).
- **Undo.** Friend mode removes the last move. AI mode removes your last move together with the AI reply, and is disabled while the AI is thinking or after a game ends.
- **Stored data is validated** field by field before use; corrupted or tampered storage falls back to clean defaults.
- **Accessibility.** Cells are labelled buttons ("Row 1, column 2, empty") with arrow-key navigation, visible focus rings, dialogs trap focus and close with Escape, status updates use `aria-live`, and motion respects `prefers-reduced-motion`.

## Controls

| Control | Behaviour |
| --- | --- |
| Play with AI / Friend | Switches mode and starts a fresh board (scores are kept) |
| Difficulty, You play as, First move | Applies to the next board; changing starts a new game |
| Undo | Reverts the last turn with correct turn restoration |
| New Game | Fresh board, scores kept |
| Reset Scores / Clear History | Ask for confirmation first |
| Sound / Theme toggles | Persisted |
