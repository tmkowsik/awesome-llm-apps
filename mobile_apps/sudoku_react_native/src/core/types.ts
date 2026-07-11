export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 0 means empty. */
export type CellValue = 0 | Digit;

/** Board index 0..80, row-major. */
export type CellIndex = number;

/** Flat 81-cell board, 0 = empty. */
export type Grid = number[];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export const GRID_SIZE = 81;

export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
