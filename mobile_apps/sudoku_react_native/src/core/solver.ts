import {Grid, GRID_SIZE} from './types';
import {candidatesMask, hasConflicts, popcount} from './grid';

interface MrvCell {
  idx: number;
  mask: number;
}

/** Most-constrained empty cell, or null when the grid is full. Mask 0 means dead end. */
function findMrvCell(grid: Grid): MrvCell | null {
  let best: MrvCell | null = null;
  let bestCount = 10;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (grid[i] !== 0) {
      continue;
    }
    const mask = candidatesMask(grid, i);
    const count = popcount(mask);
    if (count < bestCount) {
      best = {idx: i, mask};
      bestCount = count;
      if (count <= 1) {
        break;
      }
    }
  }
  return best;
}

function solveInPlace(grid: Grid): boolean {
  const cell = findMrvCell(grid);
  if (cell === null) {
    return true;
  }
  for (let d = 1; d <= 9; d++) {
    if (cell.mask & (1 << (d - 1))) {
      grid[cell.idx] = d;
      if (solveInPlace(grid)) {
        return true;
      }
    }
  }
  grid[cell.idx] = 0;
  return false;
}

/** Returns a solved copy of the grid, or null if unsolvable/invalid. */
export function solve(grid: Grid): Grid | null {
  if (hasConflicts(grid)) {
    return null;
  }
  const work = grid.slice();
  return solveInPlace(work) ? work : null;
}

/** Counts solutions, aborting once `cap` is reached (default 2, for uniqueness checks). */
export function countSolutions(grid: Grid, cap = 2): number {
  if (hasConflicts(grid)) {
    return 0;
  }
  const work = grid.slice();
  let count = 0;
  const search = (): boolean => {
    const cell = findMrvCell(work);
    if (cell === null) {
      count++;
      return count >= cap;
    }
    for (let d = 1; d <= 9; d++) {
      if (cell.mask & (1 << (d - 1))) {
        work[cell.idx] = d;
        if (search()) {
          work[cell.idx] = 0;
          return true;
        }
      }
    }
    work[cell.idx] = 0;
    return false;
  };
  search();
  return count;
}

/** True when the puzzle has exactly one solution. */
export const hasUniqueSolution = (grid: Grid): boolean => countSolutions(grid, 2) === 1;
