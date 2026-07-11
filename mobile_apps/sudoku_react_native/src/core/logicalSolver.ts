import {Grid, GRID_SIZE} from './types';
import {UNITS, candidatesMask, isComplete, popcount} from './grid';

/**
 * Attempts to solve using only naked singles (and optionally hidden singles).
 * Used to grade difficulty, not to solve for gameplay.
 * Returns the solved grid, or null if these techniques get stuck.
 */
export function solveWithSingles(grid: Grid, opts: {hiddenSingles: boolean}): Grid | null {
  const work = grid.slice();
  let progress = true;
  while (progress) {
    progress = false;

    for (let i = 0; i < GRID_SIZE; i++) {
      if (work[i] !== 0) {
        continue;
      }
      const mask = candidatesMask(work, i);
      if (mask === 0) {
        return null;
      }
      if (popcount(mask) === 1) {
        work[i] = Math.log2(mask) + 1;
        progress = true;
      }
    }

    if (!progress && opts.hiddenSingles) {
      for (const unit of UNITS) {
        for (let d = 1; d <= 9; d++) {
          const bit = 1 << (d - 1);
          if (unit.some(i => work[i] === d)) {
            continue;
          }
          const spots = unit.filter(i => work[i] === 0 && (candidatesMask(work, i) & bit) !== 0);
          if (spots.length === 1) {
            work[spots[0]] = d;
            progress = true;
          }
        }
      }
    }
  }
  return isComplete(work) ? work : null;
}

export const solvableWithNakedSingles = (grid: Grid): boolean =>
  solveWithSingles(grid, {hiddenSingles: false}) !== null;

export const solvableWithSingles = (grid: Grid): boolean =>
  solveWithSingles(grid, {hiddenSingles: true}) !== null;
