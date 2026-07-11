# 🔢 Sudoku — React Native

A classic 9×9 Sudoku game for iOS (and Android), built with bare React Native + TypeScript. The in-game experience mimics **Sudoku.com – Number Games**.

## Features

- **4 difficulties** — Easy / Medium / Hard / Expert, generated on-device with a guaranteed unique solution. Difficulty is calibrated by clue count (38–41 down to 23–26) plus a logical-technique gate: Easy puzzles solve with naked singles alone, Expert puzzles resist singles entirely.
- **3-mistake limit** — a wrong entry (checked against the solution, like sudoku.com) turns red, buzzes, and counts a mistake; the third ends the game, with a one-shot **Second Chance** revive.
- **Correct entries lock** — they turn blue and can't be erased or overwritten; every correct placement auto-erases that digit from peers' pencil notes.
- **Pencil notes** — toggle Notes mode and tap digits to mark candidates in a 3×3 micro-grid.
- **Smart highlighting** — selected cell, its row/column/box, every cell holding the same digit, and red tints for conflicting duplicates.
- **Hints** — 3 per game; fills the selected (or first empty) cell for zero score.
- **Undo** — snapshot-based, restores auto-erased peer notes too, but never refunds a mistake.
- **Scoring** — per-difficulty base + a 10-second speed-bonus chain + bonuses for completing a row/column/box, and a win bonus (bigger under 10 minutes).
- **Timer with pause** — pausing hides the board; backgrounding the app auto-pauses and saves.
- **Resume** — the game is persisted continuously; the Home screen offers "Continue" with difficulty, time, and mistakes.
- **Number pad exhaustion** — each key shows how many of that digit remain and dims at zero.

## Architecture

```
src/
├── core/            # Pure TypeScript, zero React/RN imports — fully unit-tested
│   ├── grid.ts          # units/peers lookup tables, candidate bitmasks
│   ├── solver.ts        # MRV backtracking solve() + capped countSolutions()
│   ├── logicalSolver.ts # naked/hidden singles (difficulty grading)
│   ├── generator.ts     # seeded solved-grid fill + symmetric clue carving
│   ├── difficulty.ts    # clue bands + technique gates
│   ├── scoring.ts       # score formulas
│   └── engine/          # GameState, actions, gameReducer (all rules), selectors
├── store/           # zustand store (single dispatch through the reducer),
│                    # AsyncStorage persistence (versioned), game clock hook
├── screens/         # Home, Game
├── components/      # Board, Cell, NumberPad, Toolbar, GameHeader, overlays
├── navigation/      # two-route conditional render
└── theme/           # sudoku.com-like palette, board sizing
```

Design decisions:

- **All gameplay rules live in a pure reducer** (`src/core/engine/reducer.ts`); the zustand store's only mutator is `dispatch(action)`, which also folds wall-clock time into the state so scoring and pauses are accurate.
- **Pencil notes are 9-bit bitmasks** (`notes: number[81]`) — cheap equality for memoized cells, trivial serialization, peer auto-erase is one `&= ~bit`.
- **Each of the 81 cells subscribes with its own selector** (`useShallow` + `React.memo`), so a keypress re-renders only the ~21 affected cells.
- **Minimal native surface** — just `react-native-safe-area-context` and `@react-native-async-storage/async-storage`; no navigation library, no reanimated.

## Development (any OS — no device needed)

```sh
npm install
npm test           # 122 Jest tests: solver, generator, every game rule, persistence
npx tsc --noEmit   # typecheck
npm run lint
```

## Run on your iPhone (macOS + Xcode)

1. Clone the repo, `cd mobile_apps/sudoku_react_native`, `npm install`.
2. `cd ios && bundle install && bundle exec pod install`
3. Open `ios/Sudoku.xcworkspace` in Xcode (never the `.xcodeproj`).
4. Select the **Sudoku** target → Signing & Capabilities → check "Automatically manage signing", pick your Personal Team (a free Apple ID works), and set a unique bundle identifier (e.g. `com.yourname.sudoku`).
5. **Simulator:** pick any iPhone simulator and Run.
   **Device:** plug in your iPhone, enable Developer Mode (Settings → Privacy & Security), Run, then trust the developer cert on the phone (Settings → General → VPN & Device Management). Free-account builds expire after 7 days — just Run again.
6. Metro starts automatically; if not, run `npm start` in the app folder first.

### Android

`npx react-native run-android` with an emulator or connected device.

## Deferred (architecture allows)

Daily challenges (the engine's `START_GAME` accepts any puzzle/solution pair), statistics, dark theme, achievements.
