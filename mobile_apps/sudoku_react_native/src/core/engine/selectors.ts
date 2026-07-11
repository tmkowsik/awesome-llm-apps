import {GameState, isCellLocked, isCellWrong} from './state';
import {PEERS} from '../grid';

export interface CellView {
  value: number;
  notes: number;
  given: boolean;
  locked: boolean;
  wrong: boolean;
  selected: boolean;
  /** Same row/col/box as the selected cell. */
  peer: boolean;
  /** Holds the same digit as the selected cell. */
  sameValue: boolean;
  /** Duplicates a wrong entry in its row/col/box (red tint). */
  conflict: boolean;
}

export function selectCellView(state: GameState, idx: number): CellView {
  const value = state.values[idx];
  const sel = state.selected;
  const selValue = sel === null ? 0 : state.values[sel];
  const wrong = isCellWrong(state, idx);
  let conflict = wrong;
  if (!conflict && value !== 0) {
    conflict = PEERS[idx].some(p => state.values[p] === value && isCellWrong(state, p));
  }
  return {
    value,
    notes: state.notes[idx],
    given: state.given[idx],
    locked: isCellLocked(state, idx),
    wrong,
    selected: sel === idx,
    peer: sel !== null && sel !== idx && PEERS[idx].includes(sel),
    sameValue: sel !== null && sel !== idx && value !== 0 && value === selValue,
    conflict,
  };
}

/** How many of each digit are still missing from the board (correct placements + givens). */
export function selectRemainingCounts(state: GameState): number[] {
  const remaining = new Array(10).fill(9);
  remaining[0] = 0;
  for (let i = 0; i < 81; i++) {
    const v = state.values[i];
    if (v !== 0 && v === state.solution[i]) {
      remaining[v]--;
    }
  }
  return remaining;
}

export const selectCanUndo = (state: GameState): boolean =>
  state.status === 'playing' && state.undoStack.length > 0;

export const selectIsWon = (state: GameState): boolean =>
  state.values.every((v, i) => v === state.solution[i]);
