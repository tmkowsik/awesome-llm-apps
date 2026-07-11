import {countSolutions, hasUniqueSolution, solve} from '../solver';
import {emptyGrid} from '../grid';
import {KNOWN_PUZZLE, KNOWN_SOLUTION} from '../../testing/fixtures';

describe('solve', () => {
  it('solves a known puzzle to its known solution', () => {
    expect(solve(KNOWN_PUZZLE)).toEqual(KNOWN_SOLUTION);
  });

  it('does not mutate its input', () => {
    const copy = KNOWN_PUZZLE.slice();
    solve(KNOWN_PUZZLE);
    expect(KNOWN_PUZZLE).toEqual(copy);
  });

  it('returns null for a grid with conflicting givens', () => {
    const g = emptyGrid();
    g[0] = 5;
    g[8] = 5; // same row
    expect(solve(g)).toBeNull();
  });

  it('returns null for a conflict-free but unsolvable grid', () => {
    // Cell 0 sees digits 1-8 in its row and 9 in its column: no candidates.
    const g = emptyGrid();
    for (let c = 1; c <= 8; c++) {
      g[c] = c;
    }
    g[9] = 9;
    expect(solve(g)).toBeNull();
  });
});

describe('countSolutions', () => {
  it('returns 1 for a proper puzzle', () => {
    expect(countSolutions(KNOWN_PUZZLE, 2)).toBe(1);
    expect(hasUniqueSolution(KNOWN_PUZZLE)).toBe(true);
  });

  it('caps at 2 for a puzzle with a deadly rectangle removed', () => {
    // Cells (3,5),(3,8),(4,5),(4,8) of the known solution hold 1,3 / 3,1 —
    // blanking them allows the values to swap, giving a second solution.
    const g = KNOWN_SOLUTION.slice();
    for (const idx of [32, 35, 41, 44]) {
      g[idx] = 0;
    }
    expect(countSolutions(g, 2)).toBe(2);
    expect(hasUniqueSolution(g)).toBe(false);
  });

  it('returns 0 for an unsolvable grid', () => {
    const g = emptyGrid();
    g[0] = 5;
    g[8] = 5;
    expect(countSolutions(g, 2)).toBe(0);
  });
});
