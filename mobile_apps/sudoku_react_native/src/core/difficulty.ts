import {Difficulty, Grid} from './types';
import {solvableWithNakedSingles, solvableWithSingles} from './logicalSolver';

export interface DifficultySpec {
  /** Inclusive clue-count band the generator aims for. */
  minClues: number;
  maxClues: number;
  /** Logical-technique gate a candidate puzzle must pass (null = no gate). */
  gate: ((puzzle: Grid) => boolean) | null;
}

export const DIFFICULTY_SPECS: Record<Difficulty, DifficultySpec> = {
  easy: {minClues: 38, maxClues: 41, gate: solvableWithNakedSingles},
  medium: {minClues: 32, maxClues: 35, gate: solvableWithSingles},
  hard: {minClues: 27, maxClues: 30, gate: null},
  expert: {minClues: 23, maxClues: 26, gate: puzzle => !solvableWithSingles(puzzle)},
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};
