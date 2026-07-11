import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGameStore} from '../gameStore';
import {loadSavedGame} from '../persistence';
import {countClues} from '../../core/grid';

function resetStore() {
  useGameStore.setState({
    route: 'home',
    game: null,
    savedGame: null,
    clockAnchor: null,
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  (AsyncStorage as any).clear();
  resetStore();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('newGame', () => {
  it('generates an in-band puzzle and enters the game route', () => {
    useGameStore.getState().newGame('easy');
    const {game, route, clockAnchor} = useGameStore.getState();
    expect(route).toBe('game');
    expect(game).not.toBeNull();
    expect(game!.difficulty).toBe('easy');
    expect(countClues(game!.puzzle)).toBeGreaterThanOrEqual(38);
    expect(countClues(game!.puzzle)).toBeLessThanOrEqual(41);
    expect(clockAnchor).not.toBeNull();
  });
});

describe('dispatch + clock fold', () => {
  it('folds wall-clock time into actions and stops the anchor on pause', () => {
    useGameStore.getState().newGame('easy');
    jest.advanceTimersByTime(7000); // fake timers also advance Date.now()
    useGameStore.getState().dispatch({type: 'PAUSE'});
    const {game, clockAnchor} = useGameStore.getState();
    expect(game!.status).toBe('paused');
    expect(game!.elapsedMs).toBeGreaterThanOrEqual(7000);
    expect(clockAnchor).toBeNull();

    // Paused time does not accumulate.
    jest.advanceTimersByTime(60000);
    useGameStore.getState().dispatch({type: 'RESUME'});
    expect(useGameStore.getState().game!.elapsedMs).toBeLessThan(10000);
    expect(useGameStore.getState().clockAnchor).not.toBeNull();
  });

  it('tick advances elapsed time while playing', () => {
    useGameStore.getState().newGame('easy');
    jest.advanceTimersByTime(3000);
    useGameStore.getState().tick();
    expect(useGameStore.getState().game!.elapsedMs).toBeGreaterThanOrEqual(3000);
  });
});

describe('persistence wiring', () => {
  it('debounces saves after actions and saves immediately on pause', async () => {
    useGameStore.getState().newGame('easy');
    useGameStore.getState().dispatch({type: 'SELECT_CELL', idx: 0});
    useGameStore.getState().dispatch({type: 'PAUSE'});
    jest.runOnlyPendingTimers();
    const saved = await loadSavedGame();
    expect(saved).not.toBeNull();
    expect(saved!.difficulty).toBe('easy');
  });

  it('goHome pauses the game and offers it as savedGame', () => {
    useGameStore.getState().newGame('medium');
    useGameStore.getState().goHome();
    const {route, savedGame} = useGameStore.getState();
    expect(route).toBe('home');
    expect(savedGame).not.toBeNull();
    expect(savedGame!.status).toBe('paused');
  });

  it('continueGame resumes the saved game', () => {
    useGameStore.getState().newGame('medium');
    useGameStore.getState().goHome();
    useGameStore.getState().continueGame();
    const {route, game, savedGame} = useGameStore.getState();
    expect(route).toBe('game');
    expect(game!.status).toBe('playing');
    expect(savedGame).toBeNull();
  });

  it('hydrate exposes a stored game for Continue', async () => {
    useGameStore.getState().newGame('hard');
    useGameStore.getState().dispatch({type: 'PAUSE'});
    jest.runOnlyPendingTimers();
    resetStore();
    await useGameStore.getState().hydrate();
    const {savedGame} = useGameStore.getState();
    expect(savedGame).not.toBeNull();
    expect(savedGame!.difficulty).toBe('hard');
  });
});
