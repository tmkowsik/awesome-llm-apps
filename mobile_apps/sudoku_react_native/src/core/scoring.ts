import {Difficulty} from './types';

export const BASE_SCORE: Record<Difficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 180,
  expert: 280,
};

export const SPEED_BONUS_WINDOW_S = 10;
export const FAST_WIN_MS = 10 * 60 * 1000;

/**
 * Score for one correct placement (approximation of sudoku.com):
 * base + speed bonus (linear decay over 10 s since the last correct placement)
 * + half base per row/col/box the placement completes.
 */
export function placementScore(
  difficulty: Difficulty,
  secondsSinceLastCorrect: number | null,
  unitsCompleted: number,
): number {
  const base = BASE_SCORE[difficulty];
  const speed =
    secondsSinceLastCorrect === null
      ? 0
      : Math.round((base * Math.max(0, SPEED_BONUS_WINDOW_S - secondsSinceLastCorrect)) / SPEED_BONUS_WINDOW_S);
  return base + speed + Math.round(base / 2) * unitsCompleted;
}

export function winBonus(difficulty: Difficulty, elapsedMs: number): number {
  const base = BASE_SCORE[difficulty];
  return elapsedMs < FAST_WIN_MS ? base * 10 : base * 5;
}
