import {gameReducer} from '../engine/reducer';
import {GameState, createGameState} from '../engine/state';
import {GameAction} from '../engine/actions';
import {selectCanUndo, selectCellView, selectIsWon, selectRemainingCounts} from '../engine/selectors';
import {Digit} from '../types';
import {cellAt} from '../grid';
import {KNOWN_PUZZLE, KNOWN_SOLUTION} from '../../testing/fixtures';

function newGame(): GameState {
  return createGameState(KNOWN_PUZZLE, KNOWN_SOLUTION, 'medium');
}

function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, state);
}

describe('selectCellView', () => {
  it('flags selection, peers, and same-value cells', () => {
    // Cell (0,0) holds the given 5; cell (8,4) holds a given 8.
    const s = run(newGame(), {type: 'SELECT_CELL', idx: 0});
    const selectedView = selectCellView(s, 0);
    expect(selectedView.selected).toBe(true);
    expect(selectedView.given).toBe(true);
    expect(selectedView.locked).toBe(true);

    const rowPeer = selectCellView(s, 8);
    expect(rowPeer.peer).toBe(true);
    const colPeer = selectCellView(s, 72);
    expect(colPeer.peer).toBe(true);
    const boxPeer = selectCellView(s, cellAt(2, 2));
    expect(boxPeer.peer).toBe(true);
    const distant = selectCellView(s, cellAt(4, 4));
    expect(distant.peer).toBe(false);

    // Another 5 elsewhere on the board highlights as same-value.
    const other5 = KNOWN_PUZZLE.findIndex((v, i) => v === 5 && i !== 0);
    expect(selectCellView(s, other5).sameValue).toBe(true);
  });

  it('flags wrong entries and their duplicated peers as conflicts', () => {
    // Cell 2 solves to 4; entering 9 duplicates the given 9 at (2,1)? Use a row duplicate:
    // row 0 already contains the given 7 at (0,4), so entering 7 at cell 2 conflicts with it.
    const s = run(newGame(), {type: 'SELECT_CELL', idx: 2}, {type: 'INPUT_DIGIT', digit: 7 as Digit});
    const wrongView = selectCellView(s, 2);
    expect(wrongView.wrong).toBe(true);
    expect(wrongView.conflict).toBe(true);
    const dupPeer = selectCellView(s, cellAt(0, 4));
    expect(dupPeer.conflict).toBe(true);
    expect(dupPeer.wrong).toBe(false); // the given itself is not wrong
  });

  it('exposes pencil marks', () => {
    const s = run(
      newGame(),
      {type: 'TOGGLE_NOTES_MODE'},
      {type: 'SELECT_CELL', idx: 2},
      {type: 'INPUT_DIGIT', digit: 4 as Digit},
    );
    expect(selectCellView(s, 2).notes).toBe(1 << 3);
  });
});

describe('selectRemainingCounts', () => {
  it('counts down from the givens and correct placements', () => {
    const s = newGame();
    const counts = selectRemainingCounts(s);
    const fives = KNOWN_PUZZLE.filter(v => v === 5).length;
    expect(counts[5]).toBe(9 - fives);

    const placed = run(s, {type: 'SELECT_CELL', idx: 2}, {type: 'INPUT_DIGIT', digit: 4 as Digit});
    expect(selectRemainingCounts(placed)[4]).toBe(counts[4] - 1);

    // Wrong entries do not count toward exhaustion.
    const wrong = run(s, {type: 'SELECT_CELL', idx: 2}, {type: 'INPUT_DIGIT', digit: 1 as Digit});
    expect(selectRemainingCounts(wrong)[1]).toBe(counts[1]);
  });
});

describe('selectCanUndo / selectIsWon', () => {
  it('reflects undo stack and win state', () => {
    const s = newGame();
    expect(selectCanUndo(s)).toBe(false);
    expect(selectIsWon(s)).toBe(false);

    const moved = run(s, {type: 'SELECT_CELL', idx: 2}, {type: 'INPUT_DIGIT', digit: 4 as Digit});
    expect(selectCanUndo(moved)).toBe(true);

    const solvedState = {...s, values: KNOWN_SOLUTION.slice()};
    expect(selectIsWon(solvedState)).toBe(true);
  });
});
