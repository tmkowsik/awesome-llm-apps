import AsyncStorage from '@react-native-async-storage/async-storage';
import {GameState} from '../core/engine/state';

const KEY = '@sudoku/currentGame';

/** Undo history kept in storage; in-memory play keeps more. */
export const SAVED_UNDO_CAP = 50;

export interface SavedGameV1 {
  version: 1;
  savedAt: number;
  state: GameState;
}

export function serializeGame(state: GameState): string {
  const saved: SavedGameV1 = {
    version: 1,
    savedAt: Date.now(),
    state: {
      ...state,
      selected: null,
      undoStack: state.undoStack.slice(-SAVED_UNDO_CAP),
    },
  };
  return JSON.stringify(saved);
}

/** Returns a resumable state (always paused), or null if unusable. */
export function deserializeGame(json: string): GameState | null {
  try {
    const saved = JSON.parse(json) as SavedGameV1;
    if (
      saved?.version !== 1 ||
      !saved.state ||
      !Array.isArray(saved.state.values) ||
      saved.state.values.length !== 81
    ) {
      return null;
    }
    if (saved.state.status === 'won' || saved.state.status === 'lost') {
      return null;
    }
    return {...saved.state, status: 'paused', selected: null};
  } catch {
    return null;
  }
}

export async function saveGame(state: GameState): Promise<void> {
  await AsyncStorage.setItem(KEY, serializeGame(state));
}

export async function loadSavedGame(): Promise<GameState | null> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? deserializeGame(json) : null;
}

export async function clearSavedGame(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
