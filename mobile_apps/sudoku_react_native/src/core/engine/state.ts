import {Difficulty, Grid} from '../types';

export type GameStatus = 'playing' | 'paused' | 'won' | 'lost';

export interface CellSnapshot {
  idx: number;
  value: number;
  notes: number;
}

/** Snapshot of every cell an action touched, so UNDO can restore them. */
export interface UndoEntry {
  cells: CellSnapshot[];
  selected: number | null;
}

export const MAX_UNDO = 200;
export const MAX_MISTAKES = 3;
export const HINTS_PER_GAME = 3;

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  puzzle: Grid;
  solution: Grid;
  /** Current board contents including givens; 0 = empty. */
  values: Grid;
  /** Pencil marks: 9-bit mask per cell, bit (d-1) = digit d noted. */
  notes: number[];
  given: boolean[];
  selected: number | null;
  notesMode: boolean;
  mistakes: number;
  hintsRemaining: number;
  secondChanceUsed: boolean;
  score: number;
  /** Accumulated play time, flushed in by the game clock. */
  elapsedMs: number;
  /** elapsedMs of the last correct placement; null resets the speed-bonus chain. */
  lastCorrectAt: number | null;
  undoStack: UndoEntry[];
}

export function createGameState(puzzle: Grid, solution: Grid, difficulty: Difficulty): GameState {
  return {
    status: 'playing',
    difficulty,
    puzzle: puzzle.slice(),
    solution: solution.slice(),
    values: puzzle.slice(),
    notes: new Array(81).fill(0),
    given: puzzle.map(v => v !== 0),
    selected: null,
    notesMode: false,
    mistakes: 0,
    hintsRemaining: HINTS_PER_GAME,
    secondChanceUsed: false,
    score: 0,
    elapsedMs: 0,
    lastCorrectAt: null,
    undoStack: [],
  };
}

/** Given, or a non-given cell whose value is correct (sudoku.com locks those). */
export function isCellLocked(state: GameState, idx: number): boolean {
  return state.given[idx] || (state.values[idx] !== 0 && state.values[idx] === state.solution[idx]);
}

export function isCellWrong(state: GameState, idx: number): boolean {
  return !state.given[idx] && state.values[idx] !== 0 && state.values[idx] !== state.solution[idx];
}
