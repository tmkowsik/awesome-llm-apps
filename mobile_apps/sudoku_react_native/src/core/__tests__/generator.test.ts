import {generatePuzzle, generateSolvedGrid} from '../generator';
import {mulberry32} from '../random';
import {countClues, isSolvedGrid} from '../grid';
import {countSolutions, solve} from '../solver';
import {solvableWithNakedSingles, solvableWithSingles} from '../logicalSolver';
import {DIFFICULTY_SPECS} from '../difficulty';
import {DIFFICULTIES} from '../types';

const SEEDS = Array.from({length: 25}, (_, i) => 1000 + i * 37);

describe('generateSolvedGrid', () => {
  it.each(SEEDS.slice(0, 10))('produces a valid solved grid (seed %d)', seed => {
    expect(isSolvedGrid(generateSolvedGrid(mulberry32(seed)))).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    expect(generateSolvedGrid(mulberry32(42))).toEqual(generateSolvedGrid(mulberry32(42)));
  });

  it('differs across seeds', () => {
    expect(generateSolvedGrid(mulberry32(1))).not.toEqual(generateSolvedGrid(mulberry32(2)));
  });
});

describe('generatePuzzle', () => {
  describe.each(DIFFICULTIES)('%s', difficulty => {
    const spec = DIFFICULTY_SPECS[difficulty];

    it.each(SEEDS.slice(0, 8))('generates a unique, in-band puzzle (seed %d)', seed => {
      const {puzzle, solution, clues} = generatePuzzle(difficulty, mulberry32(seed));
      expect(isSolvedGrid(solution)).toBe(true);
      expect(clues).toBe(countClues(puzzle));
      expect(clues).toBeGreaterThanOrEqual(spec.minClues);
      expect(clues).toBeLessThanOrEqual(spec.maxClues);
      expect(countSolutions(puzzle, 2)).toBe(1);
      expect(solve(puzzle)).toEqual(solution);
      // Every given matches the solution.
      puzzle.forEach((v, i) => {
        if (v !== 0) {
          expect(v).toBe(solution[i]);
        }
      });
    });
  });

  it('is deterministic for a given seed', () => {
    expect(generatePuzzle('medium', mulberry32(7))).toEqual(generatePuzzle('medium', mulberry32(7)));
  });

  it.each(SEEDS.slice(0, 5))('easy puzzles pass the naked-singles gate (seed %d)', seed => {
    const {puzzle} = generatePuzzle('easy', mulberry32(seed));
    expect(solvableWithNakedSingles(puzzle)).toBe(true);
  });

  it.each(SEEDS.slice(0, 5))('expert puzzles resist singles-only solving (seed %d)', seed => {
    const {puzzle} = generatePuzzle('expert', mulberry32(seed));
    expect(solvableWithSingles(puzzle)).toBe(false);
  });

  it('generates 10 expert puzzles within a generous time budget', () => {
    const start = Date.now();
    for (let i = 0; i < 10; i++) {
      generatePuzzle('expert', mulberry32(5000 + i));
    }
    expect(Date.now() - start).toBeLessThan(15000);
  });
});
