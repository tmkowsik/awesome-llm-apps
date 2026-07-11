# 🔢 Sudoku — React Native

A classic 9×9 Sudoku game for iOS (and Android), built with bare React Native + TypeScript. The in-game experience mimics **Sudoku.com – Number Games**: difficulty levels, timer with pause, 3-mistake limit with a Second Chance, pencil notes, hints, undo/erase, smart highlighting, scoring, and resumable saved games.

> Full documentation (architecture, features, and the Mac/Xcode run checklist) is filled in as the app is built. See the bottom of this file for how to run it on your iPhone.

## Stack

- React Native 0.86 (bare, New Architecture) + TypeScript
- `zustand` for state, wrapping a pure game reducer
- `@react-native-async-storage/async-storage` for saved games
- `react-native-safe-area-context` for notch/home-indicator insets

## Development (any OS)

```sh
npm install
npm test           # Jest — full game engine unit tests
npx tsc --noEmit   # typecheck
npm run lint
```

All game logic (puzzle generator, solver, rules engine, scoring, persistence) is pure TypeScript under `src/core/` and `src/store/`, fully unit-tested without a device.

## Run on your iPhone (macOS + Xcode)

1. Clone the repo, `cd mobile_apps/sudoku_react_native`, `npm install`.
2. `cd ios && bundle install && bundle exec pod install`
3. Open `ios/Sudoku.xcworkspace` in Xcode (never the `.xcodeproj`).
4. Select the **Sudoku** target → Signing & Capabilities → check "Automatically manage signing", pick your Personal Team (free Apple ID works), and set a unique bundle identifier (e.g. `com.yourname.sudoku`).
5. **Simulator:** pick any iPhone simulator and Run.
   **Device:** plug in your iPhone, enable Developer Mode (Settings → Privacy & Security), Run, then trust the developer cert on the phone (Settings → General → VPN & Device Management). Free-account builds expire after 7 days — just Run again.
6. Metro starts automatically; if not, run `npm start` in the app folder first.
