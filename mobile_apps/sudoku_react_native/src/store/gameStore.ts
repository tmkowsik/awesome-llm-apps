import {create} from 'zustand';
import {Difficulty} from '../core/types';
import {GameState, createGameState} from '../core/engine/state';
import {GameAction} from '../core/engine/actions';
import {gameReducer} from '../core/engine/reducer';
import {generatePuzzle} from '../core/generator';
import {mulberry32, randomSeed} from '../core/random';
import {clearSavedGame, loadSavedGame, saveGame} from './persistence';

export type Route = 'home' | 'game';

const SAVE_DEBOUNCE_MS = 500;

interface GameStore {
  route: Route;
  game: GameState | null;
  /** Most recent resumable game found in storage (drives Home's Continue button). */
  savedGame: GameState | null;
  /** Wall-clock anchor for the running timer; null unless status is 'playing'. */
  clockAnchor: number | null;

  dispatch: (action: GameAction) => void;
  /** Folds wall-clock time into elapsedMs (drives the visible timer). */
  tick: () => void;
  newGame: (difficulty: Difficulty) => void;
  continueGame: () => void;
  goHome: () => void;
  /** Loads any saved game from storage into `savedGame`. */
  hydrate: () => Promise<void>;
  /** Persists the current game immediately (used when the app backgrounds). */
  persistNow: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function persist(game: GameState, immediate: boolean) {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (game.status === 'won' || game.status === 'lost') {
    clearSavedGame().catch(() => {});
    return;
  }
  if (immediate) {
    saveGame(game).catch(() => {});
  } else {
    saveTimer = setTimeout(() => saveGame(game).catch(() => {}), SAVE_DEBOUNCE_MS);
  }
}

export const useGameStore = create<GameStore>((set, get) => {
  const applyAction = (action: GameAction) => {
    const {game, clockAnchor} = get();
    if (!game) {
      return;
    }
    const now = Date.now();
    // Fold real elapsed time in first, so scoring and pausing see accurate time.
    let current = game;
    let anchor = clockAnchor;
    if (current.status === 'playing' && anchor !== null) {
      current = {...current, elapsedMs: current.elapsedMs + (now - anchor)};
      anchor = now;
    }
    const next = gameReducer(current, action);
    if (next === game) {
      return;
    }
    if (game.status !== 'playing' && next.status === 'playing') {
      anchor = now;
    } else if (next.status !== 'playing') {
      anchor = null;
    }
    set({game: next, clockAnchor: anchor});
    persist(next, action.type === 'PAUSE');
  };

  return {
    route: 'home',
    game: null,
    savedGame: null,
    clockAnchor: null,

    dispatch: applyAction,

    tick: () => {
      const {game, clockAnchor} = get();
      if (game?.status === 'playing' && clockAnchor !== null) {
        applyAction({type: 'TICK', elapsedMs: game.elapsedMs + (Date.now() - clockAnchor)});
      }
    },

    newGame: difficulty => {
      const {puzzle, solution} = generatePuzzle(difficulty, mulberry32(randomSeed()));
      const game = createGameState(puzzle, solution, difficulty);
      set({game, savedGame: null, route: 'game', clockAnchor: Date.now()});
      persist(game, true);
    },

    continueGame: () => {
      const {savedGame} = get();
      if (!savedGame) {
        return;
      }
      set({
        game: {...savedGame, status: 'playing'},
        savedGame: null,
        route: 'game',
        clockAnchor: Date.now(),
      });
    },

    goHome: () => {
      const {game, dispatch} = get();
      if (game && game.status === 'playing') {
        dispatch({type: 'PAUSE'});
      }
      const paused = get().game;
      set({route: 'home', savedGame: paused && paused.status === 'paused' ? paused : null});
    },

    hydrate: async () => {
      const saved = await loadSavedGame();
      if (saved && !get().game) {
        set({savedGame: saved});
      }
    },

    persistNow: () => {
      const {game, dispatch} = get();
      if (!game) {
        return;
      }
      if (game.status === 'playing') {
        dispatch({type: 'PAUSE'}); // persists immediately via applyAction
      } else if (game.status === 'paused') {
        persist(game, true);
      }
    },
  };
});
