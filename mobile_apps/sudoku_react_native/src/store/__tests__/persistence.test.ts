import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SAVED_UNDO_CAP,
  clearSavedGame,
  deserializeGame,
  loadSavedGame,
  saveGame,
  serializeGame,
} from '../persistence';
import {createGameState} from '../../core/engine/state';
import {gameReducer} from '../../core/engine/reducer';
import {GameState} from '../../core/engine/state';
import {KNOWN_PUZZLE, KNOWN_SOLUTION} from '../../testing/fixtures';

function newGame(): GameState {
  return createGameState(KNOWN_PUZZLE, KNOWN_SOLUTION, 'hard');
}

beforeEach(() => {
  (AsyncStorage as any).clear();
});

describe('serialize/deserialize', () => {
  it('round-trips a game (paused, deselected)', () => {
    let s = gameReducer(newGame(), {type: 'SELECT_CELL', idx: 2});
    s = gameReducer(s, {type: 'INPUT_DIGIT', digit: 4});
    s = gameReducer(s, {type: 'TICK', elapsedMs: 32000});

    const restored = deserializeGame(serializeGame(s));
    expect(restored).not.toBeNull();
    expect(restored!.status).toBe('paused');
    expect(restored!.selected).toBeNull();
    expect({...restored!, status: s.status, selected: s.selected}).toEqual(s);
  });

  it('caps the stored undo stack', () => {
    let s = newGame();
    // Generate lots of undoable note toggles on cell 2.
    s = gameReducer(s, {type: 'TOGGLE_NOTES_MODE'});
    s = gameReducer(s, {type: 'SELECT_CELL', idx: 2});
    for (let i = 0; i < SAVED_UNDO_CAP + 25; i++) {
      s = gameReducer(s, {type: 'INPUT_DIGIT', digit: ((i % 9) + 1) as any});
    }
    expect(s.undoStack.length).toBeGreaterThan(SAVED_UNDO_CAP);
    const restored = deserializeGame(serializeGame(s));
    expect(restored!.undoStack).toHaveLength(SAVED_UNDO_CAP);
    expect(restored!.undoStack).toEqual(s.undoStack.slice(-SAVED_UNDO_CAP));
  });

  it('stamps a version and rejects unknown payloads', () => {
    const json = serializeGame(newGame());
    expect(JSON.parse(json).version).toBe(1);
    expect(deserializeGame('not json')).toBeNull();
    expect(deserializeGame('{}')).toBeNull();
    expect(deserializeGame(JSON.stringify({version: 99, state: {}}))).toBeNull();
  });

  it('rejects finished games', () => {
    const won = {...newGame(), status: 'won' as const};
    expect(deserializeGame(serializeGame(won))).toBeNull();
  });
});

describe('AsyncStorage IO', () => {
  it('saves, loads, and clears', async () => {
    expect(await loadSavedGame()).toBeNull();
    const s = gameReducer(newGame(), {type: 'TICK', elapsedMs: 5000});
    await saveGame(s);
    const loaded = await loadSavedGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.elapsedMs).toBe(5000);
    expect(loaded!.difficulty).toBe('hard');
    await clearSavedGame();
    expect(await loadSavedGame()).toBeNull();
  });
});
