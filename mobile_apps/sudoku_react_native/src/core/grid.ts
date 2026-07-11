import {CellIndex, Grid, GRID_SIZE} from './types';

export const rowOf = (idx: CellIndex): number => Math.floor(idx / 9);
export const colOf = (idx: CellIndex): number => idx % 9;
export const boxOf = (idx: CellIndex): number =>
  Math.floor(rowOf(idx) / 3) * 3 + Math.floor(colOf(idx) / 3);

export const cellAt = (row: number, col: number): CellIndex => row * 9 + col;

/** 27 units (9 rows, 9 cols, 9 boxes), each an array of 9 cell indices. */
export const UNITS: CellIndex[][] = (() => {
  const units: CellIndex[][] = [];
  for (let r = 0; r < 9; r++) {
    units.push(Array.from({length: 9}, (_, c) => cellAt(r, c)));
  }
  for (let c = 0; c < 9; c++) {
    units.push(Array.from({length: 9}, (_, r) => cellAt(r, c)));
  }
  for (let b = 0; b < 9; b++) {
    const r0 = Math.floor(b / 3) * 3;
    const c0 = (b % 3) * 3;
    const box: CellIndex[] = [];
    for (let r = r0; r < r0 + 3; r++) {
      for (let c = c0; c < c0 + 3; c++) {
        box.push(cellAt(r, c));
      }
    }
    units.push(box);
  }
  return units;
})();

/** The 3 units (row, col, box) containing each cell. */
export const UNITS_OF: CellIndex[][][] = (() => {
  const byCell: CellIndex[][][] = Array.from({length: GRID_SIZE}, () => []);
  for (const unit of UNITS) {
    for (const idx of unit) {
      byCell[idx].push(unit);
    }
  }
  return byCell;
})();

/** The 20 peer cells (same row, col, or box) of each cell. */
export const PEERS: CellIndex[][] = (() => {
  const peers: CellIndex[][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const set = new Set<CellIndex>();
    for (const unit of UNITS_OF[i]) {
      for (const idx of unit) {
        if (idx !== i) {
          set.add(idx);
        }
      }
    }
    peers.push([...set]);
  }
  return peers;
})();

export const emptyGrid = (): Grid => new Array(GRID_SIZE).fill(0);

export const cloneGrid = (grid: Grid): Grid => grid.slice();

export const isValidPlacement = (grid: Grid, idx: CellIndex, digit: number): boolean =>
  PEERS[idx].every(p => grid[p] !== digit);

export const isComplete = (grid: Grid): boolean => grid.every(v => v !== 0);

export const countClues = (grid: Grid): number => grid.reduce((n, v) => n + (v !== 0 ? 1 : 0), 0);

/** True if any filled cell duplicates a peer. */
export const hasConflicts = (grid: Grid): boolean =>
  grid.some((v, i) => v !== 0 && PEERS[i].some(p => grid[p] === v));

/** True if the grid is a fully valid solved Sudoku. */
export const isSolvedGrid = (grid: Grid): boolean =>
  isComplete(grid) &&
  UNITS.every(unit => new Set(unit.map(i => grid[i])).size === 9);

/** Bitmask of candidate digits for a cell: bit (d-1) set means digit d is allowed. */
export function candidatesMask(grid: Grid, idx: CellIndex): number {
  let mask = 0x1ff;
  for (const p of PEERS[idx]) {
    const v = grid[p];
    if (v !== 0) {
      mask &= ~(1 << (v - 1));
    }
  }
  return mask;
}

export function popcount(x: number): number {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}
