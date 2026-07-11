import {useEffect} from 'react';
import {AppState} from 'react-native';
import {useGameStore} from './gameStore';

/**
 * Drives the visible timer (1s ticks while playing) and auto-pauses +
 * persists when the app goes to the background, like sudoku.com.
 */
export function useGameClock(): void {
  const status = useGameStore(s => s.game?.status);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }
    const id = setInterval(() => useGameStore.getState().tick(), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'background' || next === 'inactive') {
        useGameStore.getState().persistNow();
      }
    });
    return () => sub.remove();
  }, []);
}

export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
