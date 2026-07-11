import {Grid} from '../core/types';

/** Parses an 81-char string ('0' or '.' = empty) into a Grid. */
export function parseGrid(s: string): Grid {
  const chars = s.replace(/\s/g, '');
  if (chars.length !== 81) {
    throw new Error(`expected 81 cells, got ${chars.length}`);
  }
  return [...chars].map(ch => (ch === '.' || ch === '0' ? 0 : Number(ch)));
}

/** The classic Wikipedia Sudoku example. */
export const KNOWN_PUZZLE = parseGrid(
  '530070000' +
    '600195000' +
    '098000060' +
    '800060003' +
    '400803001' +
    '700020006' +
    '060000280' +
    '000419005' +
    '000080079',
);

export const KNOWN_SOLUTION = parseGrid(
  '534678912' +
    '672195348' +
    '198342567' +
    '859761423' +
    '426853791' +
    '713924856' +
    '961537284' +
    '287419635' +
    '345286179',
);
