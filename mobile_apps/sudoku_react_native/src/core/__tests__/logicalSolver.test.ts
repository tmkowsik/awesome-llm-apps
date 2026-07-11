import {solvableWithNakedSingles, solvableWithSingles, solveWithSingles} from '../logicalSolver';
import {KNOWN_PUZZLE, KNOWN_SOLUTION} from '../../testing/fixtures';

describe('solveWithSingles', () => {
  it('solves an almost-complete grid with naked singles', () => {
    const g = KNOWN_SOLUTION.slice();
    g[0] = 0;
    g[40] = 0;
    g[80] = 0;
    expect(solveWithSingles(g, {hiddenSingles: false})).toEqual(KNOWN_SOLUTION);
    expect(solvableWithNakedSingles(g)).toBe(true);
  });

  it('reproduces the full solution when it succeeds with hidden singles', () => {
    const solved = solveWithSingles(KNOWN_PUZZLE, {hiddenSingles: true});
    if (solved !== null) {
      expect(solved).toEqual(KNOWN_SOLUTION);
    }
    // Either way the predicate agrees with the attempt.
    expect(solvableWithSingles(KNOWN_PUZZLE)).toBe(solved !== null);
  });

  it('naked-only never succeeds where naked+hidden fails', () => {
    if (!solvableWithSingles(KNOWN_PUZZLE)) {
      expect(solvableWithNakedSingles(KNOWN_PUZZLE)).toBe(false);
    }
  });
});
