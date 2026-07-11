import {Difficulty, DIGITS, Grid, GRID_SIZE} from './types';
import {Rng, randomInt, shuffled} from './random';
import {countClues, emptyGrid, isValidPlacement} from './grid';
import {hasUniqueSolution} from './solver';
import {DIFFICULTY_SPECS} from './difficulty';

export interface GeneratedPuzzle {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  clues: number;
}

/** Backtracking fill with per-cell shuffled candidates. Always succeeds. */
export function generateSolvedGrid(rng: Rng): Grid {
  const grid = emptyGrid();
  const fill = (idx: number): boolean => {
    if (idx === GRID_SIZE) {
      return true;
    }
    for (const d of shuffled(DIGITS, rng)) {
      if (isValidPlacement(grid, idx, d)) {
        grid[idx] = d;
        if (fill(idx + 1)) {
          return true;
        }
      }
    }
    grid[idx] = 0;
    return false;
  };
  fill(0);
  return grid;
}

/**
 * Removes 180°-rotationally-symmetric clue pairs while the puzzle stays unique,
 * stopping once the clue count drops to targetClues (never below minClues).
 */
function carvePuzzle(solution: Grid, targetClues: number, minClues: number, rng: Rng): Grid {
  const puzzle = solution.slice();
  const half = Math.floor(GRID_SIZE / 2); // pair cell i with 80 - i; 40 is self-paired
  const positions = shuffled(
    Array.from({length: half + 1}, (_, i) => i),
    rng,
  );
  let clues = GRID_SIZE;
  for (const i of positions) {
    if (clues <= targetClues) {
      break;
    }
    const mirror = GRID_SIZE - 1 - i;
    const removed = [i, ...(mirror !== i ? [mirror] : [])].filter(idx => puzzle[idx] !== 0);
    if (removed.length === 0 || clues - removed.length < minClues) {
      continue;
    }
    const saved = removed.map(idx => puzzle[idx]);
    removed.forEach(idx => {
      puzzle[idx] = 0;
    });
    if (hasUniqueSolution(puzzle)) {
      clues -= removed.length;
    } else {
      removed.forEach((idx, k) => {
        puzzle[idx] = saved[k];
      });
    }
  }
  return puzzle;
}

/**
 * Generates a puzzle for the difficulty: carve to the clue band, then check the
 * logical-technique gate. Retries with fresh solution grids up to `maxAttempts`;
 * if nothing passes, returns the closest candidate so New Game never fails.
 */
export function generatePuzzle(difficulty: Difficulty, rng: Rng, maxAttempts = 20): GeneratedPuzzle {
  const spec = DIFFICULTY_SPECS[difficulty];
  let best: GeneratedPuzzle | null = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solution = generateSolvedGrid(rng);
    const targetClues = randomInt(rng, spec.minClues, spec.maxClues);
    const puzzle = carvePuzzle(solution, targetClues, spec.minClues, rng);
    const clues = countClues(puzzle);
    const candidate: GeneratedPuzzle = {puzzle, solution, difficulty, clues};

    const inBand = clues >= spec.minClues && clues <= spec.maxClues;
    const passesGate = spec.gate === null || spec.gate(puzzle);
    if (inBand && passesGate) {
      return candidate;
    }

    // Distance from the band, with a penalty for failing the gate.
    const bandMiss = clues > spec.maxClues ? clues - spec.maxClues : Math.max(0, spec.minClues - clues);
    const score = bandMiss + (passesGate ? 0 : 100);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best!;
}
