import {gameReducer} from '../engine/reducer';
import {GameState, HINTS_PER_GAME, createGameState, isCellLocked, isCellWrong} from '../engine/state';
import {GameAction} from '../engine/actions';
import {Digit} from '../types';
import {BASE_SCORE, winBonus} from '../scoring';
import {KNOWN_PUZZLE, KNOWN_SOLUTION} from '../../testing/fixtures';

// Cell 2 is empty in the known puzzle; its solution digit is 4. Cell 3 (same row) solves to 6.
const EMPTY_A = 2;
const EMPTY_B = 3;

function newGame(): GameState {
  return createGameState(KNOWN_PUZZLE, KNOWN_SOLUTION, 'medium');
}

function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, state);
}

const place = (idx: number, digit: number): GameAction[] => [
  {type: 'SELECT_CELL', idx},
  {type: 'INPUT_DIGIT', digit: digit as Digit},
];

const wrongDigitFor = (idx: number): Digit => {
  const solutionDigit = KNOWN_SOLUTION[idx];
  const candidate = (solutionDigit % 9) + 1;
  return candidate as Digit;
};

/** A second wrong digit, distinct from both the solution and wrongDigitFor. */
const otherWrongDigitFor = (idx: number): Digit => {
  const solutionDigit = KNOWN_SOLUTION[idx];
  const candidate = ((solutionDigit + 1) % 9) + 1;
  return candidate as Digit;
};

describe('START_GAME / SELECT_CELL', () => {
  it('initializes from the puzzle', () => {
    const s = newGame();
    expect(s.status).toBe('playing');
    expect(s.values).toEqual(KNOWN_PUZZLE);
    expect(s.mistakes).toBe(0);
    expect(s.hintsRemaining).toBe(HINTS_PER_GAME);
    expect(s.given[0]).toBe(true);
    expect(s.given[EMPTY_A]).toBe(false);
  });

  it('selects cells only while playing', () => {
    let s = run(newGame(), {type: 'SELECT_CELL', idx: 5});
    expect(s.selected).toBe(5);
    s = run(s, {type: 'PAUSE'}, {type: 'SELECT_CELL', idx: 7});
    expect(s.selected).toBe(5);
  });
});

describe('INPUT_DIGIT — correct placements', () => {
  it('places, locks, and scores a correct digit', () => {
    const s = run(newGame(), ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]));
    expect(s.values[EMPTY_A]).toBe(KNOWN_SOLUTION[EMPTY_A]);
    expect(isCellLocked(s, EMPTY_A)).toBe(true);
    expect(s.mistakes).toBe(0);
    expect(s.score).toBe(BASE_SCORE.medium); // no speed chain yet, no completed unit
    expect(s.lastCorrectAt).toBe(0);
  });

  it('adds the full speed bonus for a second correct placement in the same tick', () => {
    const s = run(
      newGame(),
      ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]),
      ...place(EMPTY_B, KNOWN_SOLUTION[EMPTY_B]),
    );
    expect(s.score).toBe(BASE_SCORE.medium + BASE_SCORE.medium * 2);
  });

  it('ignores input on given and locked cells', () => {
    let s = run(newGame(), ...place(0, 9));
    expect(s.values[0]).toBe(KNOWN_PUZZLE[0]);
    s = run(s, ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]));
    const locked = run(s, {type: 'INPUT_DIGIT', digit: 9});
    expect(locked.values[EMPTY_A]).toBe(KNOWN_SOLUTION[EMPTY_A]);
  });
});

describe('INPUT_DIGIT — mistakes', () => {
  it('flags a wrong digit and counts a mistake', () => {
    const s = run(newGame(), ...place(EMPTY_A, wrongDigitFor(EMPTY_A)));
    expect(isCellWrong(s, EMPTY_A)).toBe(true);
    expect(s.mistakes).toBe(1);
    expect(s.score).toBe(0);
  });

  it('allows overwriting a wrong entry with the correct digit', () => {
    const s = run(
      newGame(),
      ...place(EMPTY_A, wrongDigitFor(EMPTY_A)),
      {type: 'INPUT_DIGIT', digit: KNOWN_SOLUTION[EMPTY_A] as Digit},
    );
    expect(isCellWrong(s, EMPTY_A)).toBe(false);
    expect(isCellLocked(s, EMPTY_A)).toBe(true);
    expect(s.mistakes).toBe(1); // mistakes are never refunded
  });

  it('ends the game on the third mistake', () => {
    const s = run(
      newGame(),
      ...place(EMPTY_A, wrongDigitFor(EMPTY_A)),
      {type: 'INPUT_DIGIT', digit: otherWrongDigitFor(EMPTY_A)},
      ...place(EMPTY_B, wrongDigitFor(EMPTY_B)),
    );
    expect(s.mistakes).toBe(3);
    expect(s.status).toBe('lost');
    // No further input once lost.
    const after = run(s, ...place(EMPTY_B, KNOWN_SOLUTION[EMPTY_B]));
    expect(after).toEqual(s);
  });

  it('re-entering the digit already in the cell is a no-op', () => {
    const once = run(newGame(), ...place(EMPTY_A, wrongDigitFor(EMPTY_A)));
    const twice = run(once, {type: 'INPUT_DIGIT', digit: wrongDigitFor(EMPTY_A)});
    expect(twice.mistakes).toBe(1);
    expect(twice.undoStack).toHaveLength(1);
  });
});

describe('SECOND_CHANCE', () => {
  function lostGame(): GameState {
    return run(
      newGame(),
      ...place(EMPTY_A, wrongDigitFor(EMPTY_A)),
      {type: 'INPUT_DIGIT', digit: otherWrongDigitFor(EMPTY_A)},
      ...place(EMPTY_B, wrongDigitFor(EMPTY_B)),
    );
  }

  it('revives the game once with mistakes back at 2/3', () => {
    const s = run(lostGame(), {type: 'SECOND_CHANCE'});
    expect(s.status).toBe('playing');
    expect(s.mistakes).toBe(2);
    expect(s.secondChanceUsed).toBe(true);
  });

  it('cannot be used twice', () => {
    let s = run(lostGame(), {type: 'SECOND_CHANCE'});
    s = run(s, {type: 'SELECT_CELL', idx: EMPTY_B}, {type: 'INPUT_DIGIT', digit: otherWrongDigitFor(EMPTY_B)});
    expect(s.status).toBe('lost');
    expect(run(s, {type: 'SECOND_CHANCE'}).status).toBe('lost');
  });
});

describe('notes', () => {
  it('toggles pencil marks in notes mode', () => {
    let s = run(newGame(), {type: 'TOGGLE_NOTES_MODE'}, ...place(EMPTY_A, 4));
    expect(s.notes[EMPTY_A]).toBe(1 << 3);
    s = run(s, {type: 'INPUT_DIGIT', digit: 7});
    expect(s.notes[EMPTY_A]).toBe((1 << 3) | (1 << 6));
    s = run(s, {type: 'INPUT_DIGIT', digit: 4});
    expect(s.notes[EMPTY_A]).toBe(1 << 6);
    expect(s.values[EMPTY_A]).toBe(0);
    expect(s.mistakes).toBe(0);
  });

  it('a correct placement erases that digit from peer notes (and undo restores them)', () => {
    // EMPTY_B is a row peer of EMPTY_A; note digit 4 there, then place 4 at EMPTY_A.
    let s = run(
      newGame(),
      {type: 'TOGGLE_NOTES_MODE'},
      ...place(EMPTY_B, 4),
      {type: 'TOGGLE_NOTES_MODE'},
      ...place(EMPTY_A, 4),
    );
    expect(s.values[EMPTY_A]).toBe(4);
    expect(s.notes[EMPTY_B]).toBe(0);

    s = run(s, {type: 'UNDO'});
    expect(s.values[EMPTY_A]).toBe(0);
    expect(s.notes[EMPTY_B]).toBe(1 << 3);
    expect(s.selected).toBe(EMPTY_A);
  });
});

describe('ERASE', () => {
  it('erases wrong values and notes but not givens or locked cells', () => {
    let s = run(newGame(), ...place(EMPTY_A, wrongDigitFor(EMPTY_A)), {type: 'ERASE'});
    expect(s.values[EMPTY_A]).toBe(0);

    s = run(s, {type: 'TOGGLE_NOTES_MODE'}, {type: 'INPUT_DIGIT', digit: 5}, {type: 'TOGGLE_NOTES_MODE'}, {type: 'ERASE'});
    expect(s.notes[EMPTY_A]).toBe(0);

    const givenErase = run(s, {type: 'SELECT_CELL', idx: 0}, {type: 'ERASE'});
    expect(givenErase.values[0]).toBe(KNOWN_PUZZLE[0]);

    const lockedState = run(s, ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]));
    const lockedErase = run(lockedState, {type: 'ERASE'});
    expect(lockedErase.values[EMPTY_A]).toBe(KNOWN_SOLUTION[EMPTY_A]);
  });
});

describe('UNDO', () => {
  it('is a no-op with an empty stack', () => {
    const s = newGame();
    expect(run(s, {type: 'UNDO'})).toEqual(s);
  });

  it('reverts a wrong placement without refunding the mistake', () => {
    const s = run(newGame(), ...place(EMPTY_A, wrongDigitFor(EMPTY_A)), {type: 'UNDO'});
    expect(s.values[EMPTY_A]).toBe(0);
    expect(s.mistakes).toBe(1);
    expect(s.undoStack).toHaveLength(0);
  });

  it('reverts a correct placement, unlocking the cell', () => {
    const s = run(newGame(), ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]), {type: 'UNDO'});
    expect(s.values[EMPTY_A]).toBe(0);
    expect(isCellLocked(s, EMPTY_A)).toBe(false);
  });
});

describe('HINT', () => {
  it('fills the selected cell with the solution digit for no score', () => {
    const s = run(newGame(), {type: 'SELECT_CELL', idx: EMPTY_A}, {type: 'HINT'});
    expect(s.values[EMPTY_A]).toBe(KNOWN_SOLUTION[EMPTY_A]);
    expect(s.hintsRemaining).toBe(HINTS_PER_GAME - 1);
    expect(s.score).toBe(0);
    expect(s.lastCorrectAt).toBeNull();
  });

  it('targets the first empty cell when the selection is unusable', () => {
    const s = run(newGame(), {type: 'SELECT_CELL', idx: 0}, {type: 'HINT'});
    expect(s.values[EMPTY_A]).toBe(KNOWN_SOLUTION[EMPTY_A]); // cell 2 is the first empty
    expect(s.selected).toBe(EMPTY_A);
  });

  it('corrects a selected wrong cell', () => {
    const s = run(newGame(), ...place(EMPTY_A, wrongDigitFor(EMPTY_A)), {type: 'HINT'});
    expect(s.values[EMPTY_A]).toBe(KNOWN_SOLUTION[EMPTY_A]);
    expect(s.mistakes).toBe(1);
  });

  it('is exhausted after the per-game allowance', () => {
    let s = newGame();
    for (let i = 0; i < HINTS_PER_GAME; i++) {
      s = run(s, {type: 'HINT'});
    }
    const spent = run(s, {type: 'HINT'});
    expect(spent).toEqual(s);
    expect(s.hintsRemaining).toBe(0);
  });
});

describe('clock and pause', () => {
  it('TICK updates elapsed time only while playing', () => {
    let s = run(newGame(), {type: 'TICK', elapsedMs: 5000});
    expect(s.elapsedMs).toBe(5000);
    s = run(s, {type: 'PAUSE'}, {type: 'TICK', elapsedMs: 9000});
    expect(s.elapsedMs).toBe(5000);
    s = run(s, {type: 'RESUME'});
    expect(s.status).toBe('playing');
  });

  it('blocks input while paused', () => {
    const s = run(newGame(), {type: 'PAUSE'}, ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]));
    expect(s.values[EMPTY_A]).toBe(0);
  });

  it('uses elapsed time for the speed bonus decay', () => {
    const s = run(
      newGame(),
      ...place(EMPTY_A, KNOWN_SOLUTION[EMPTY_A]),
      {type: 'TICK', elapsedMs: 5000},
      ...place(EMPTY_B, KNOWN_SOLUTION[EMPTY_B]),
    );
    // Second placement: base 100 + speed bonus 50 (5s into the 10s window).
    expect(s.score).toBe(100 + 150);
  });
});

describe('winning', () => {
  it('completes the board, awards the win bonus, and blocks further play', () => {
    let s = newGame();
    for (let i = 0; i < 81; i++) {
      if (KNOWN_PUZZLE[i] === 0) {
        s = run(s, ...place(i, KNOWN_SOLUTION[i]));
      }
    }
    expect(s.status).toBe('won');
    expect(s.values).toEqual(KNOWN_SOLUTION);
    expect(s.score).toBeGreaterThanOrEqual(winBonus('medium', 0));
    const frozen = run(s, ...place(0, 1), {type: 'HINT'}, {type: 'PAUSE'});
    expect(frozen).toEqual(s);
  });
});
