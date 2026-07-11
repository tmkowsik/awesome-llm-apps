import {PEERS, UNITS, boxOf, candidatesMask, colOf, hasConflicts, isSolvedGrid, rowOf} from '../grid';
import {emptyGrid} from '../grid';
import {KNOWN_PUZZLE, KNOWN_SOLUTION} from '../../testing/fixtures';

describe('grid topology', () => {
  it('has 27 units of 9 cells covering the board', () => {
    expect(UNITS).toHaveLength(27);
    for (const unit of UNITS) {
      expect(unit).toHaveLength(9);
    }
  });

  it('gives every cell exactly 20 peers, none itself', () => {
    for (let i = 0; i < 81; i++) {
      expect(PEERS[i]).toHaveLength(20);
      expect(PEERS[i]).not.toContain(i);
    }
  });

  it('computes row/col/box', () => {
    expect(rowOf(0)).toBe(0);
    expect(colOf(0)).toBe(0);
    expect(boxOf(0)).toBe(0);
    expect(rowOf(80)).toBe(8);
    expect(colOf(80)).toBe(8);
    expect(boxOf(80)).toBe(8);
    expect(boxOf(4 * 9 + 4)).toBe(4); // center cell
  });

  it('peers are symmetric', () => {
    for (let i = 0; i < 81; i++) {
      for (const p of PEERS[i]) {
        expect(PEERS[p]).toContain(i);
      }
    }
  });
});

describe('grid predicates', () => {
  it('detects conflicts', () => {
    const g = emptyGrid();
    g[0] = 5;
    g[1] = 5; // same row
    expect(hasConflicts(g)).toBe(true);
    g[1] = 0;
    expect(hasConflicts(g)).toBe(false);
  });

  it('validates a solved grid', () => {
    expect(isSolvedGrid(KNOWN_SOLUTION)).toBe(true);
    expect(isSolvedGrid(KNOWN_PUZZLE)).toBe(false);
    const broken = KNOWN_SOLUTION.slice();
    [broken[0], broken[1]] = [broken[1], broken[0]];
    expect(isSolvedGrid(broken)).toBe(false);
  });

  it('computes candidate masks', () => {
    const g = emptyGrid();
    expect(candidatesMask(g, 0)).toBe(0x1ff);
    g[1] = 1; // row peer
    g[9] = 2; // col peer
    g[10] = 3; // box peer
    expect(candidatesMask(g, 0)).toBe(0x1ff & ~0b111);
  });
});
