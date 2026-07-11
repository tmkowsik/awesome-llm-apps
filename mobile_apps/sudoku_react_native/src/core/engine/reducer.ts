import {GameAction} from './actions';
import {
  CellSnapshot,
  GameState,
  MAX_MISTAKES,
  MAX_UNDO,
  UndoEntry,
  createGameState,
  isCellLocked,
  isCellWrong,
} from './state';
import {PEERS, UNITS_OF} from '../grid';
import {placementScore, winBonus} from '../scoring';

const snapshotCell = (state: GameState, idx: number): CellSnapshot => ({
  idx,
  value: state.values[idx],
  notes: state.notes[idx],
});

function pushUndo(stack: UndoEntry[], entry: UndoEntry): UndoEntry[] {
  const next = [...stack, entry];
  return next.length > MAX_UNDO ? next.slice(next.length - MAX_UNDO) : next;
}

function placeDigit(state: GameState, idx: number, digit: number): GameState {
  const bit = 1 << (digit - 1);
  const touched = [snapshotCell(state, idx)];
  const values = state.values.slice();
  const notes = state.notes.slice();
  values[idx] = digit;
  notes[idx] = 0;

  const correct = digit === state.solution[idx];
  if (!correct) {
    const mistakes = state.mistakes + 1;
    return {
      ...state,
      values,
      notes,
      undoStack: pushUndo(state.undoStack, {cells: touched, selected: idx}),
      mistakes,
      status: mistakes >= MAX_MISTAKES ? 'lost' : state.status,
    };
  }

  // Correct placements erase this digit from all peers' pencil marks.
  for (const p of PEERS[idx]) {
    if (notes[p] & bit) {
      touched.push(snapshotCell(state, p));
      notes[p] &= ~bit;
    }
  }

  const unitsCompleted = UNITS_OF[idx].filter(unit =>
    unit.every(i => values[i] === state.solution[i]),
  ).length;
  const secondsSinceLastCorrect =
    state.lastCorrectAt === null ? null : (state.elapsedMs - state.lastCorrectAt) / 1000;
  let score = state.score + placementScore(state.difficulty, secondsSinceLastCorrect, unitsCompleted);

  const won = values.every((v, i) => v === state.solution[i]);
  if (won) {
    score += winBonus(state.difficulty, state.elapsedMs);
  }
  return {
    ...state,
    values,
    notes,
    undoStack: pushUndo(state.undoStack, {cells: touched, selected: idx}),
    score,
    lastCorrectAt: state.elapsedMs,
    status: won ? 'won' : state.status,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return createGameState(action.puzzle, action.solution, action.difficulty);

    case 'SELECT_CELL':
      if (state.status !== 'playing' || action.idx < 0 || action.idx > 80) {
        return state;
      }
      return {...state, selected: action.idx};

    case 'TOGGLE_NOTES_MODE':
      if (state.status !== 'playing') {
        return state;
      }
      return {...state, notesMode: !state.notesMode};

    case 'INPUT_DIGIT': {
      if (state.status !== 'playing' || state.selected === null) {
        return state;
      }
      const idx = state.selected;
      if (isCellLocked(state, idx)) {
        return state;
      }
      if (state.notesMode) {
        if (state.values[idx] !== 0) {
          return state;
        }
        const notes = state.notes.slice();
        notes[idx] ^= 1 << (action.digit - 1);
        return {
          ...state,
          notes,
          undoStack: pushUndo(state.undoStack, {cells: [snapshotCell(state, idx)], selected: idx}),
        };
      }
      if (state.values[idx] === action.digit) {
        return state;
      }
      return placeDigit(state, idx, action.digit);
    }

    case 'ERASE': {
      if (state.status !== 'playing' || state.selected === null) {
        return state;
      }
      const idx = state.selected;
      if (isCellLocked(state, idx) || (state.values[idx] === 0 && state.notes[idx] === 0)) {
        return state;
      }
      const values = state.values.slice();
      const notes = state.notes.slice();
      const entry: UndoEntry = {cells: [snapshotCell(state, idx)], selected: idx};
      values[idx] = 0;
      notes[idx] = 0;
      return {...state, values, notes, undoStack: pushUndo(state.undoStack, entry)};
    }

    case 'UNDO': {
      if (state.status !== 'playing' || state.undoStack.length === 0) {
        return state;
      }
      const entry = state.undoStack[state.undoStack.length - 1];
      const values = state.values.slice();
      const notes = state.notes.slice();
      for (const cell of entry.cells) {
        values[cell.idx] = cell.value;
        notes[cell.idx] = cell.notes;
      }
      return {
        ...state,
        values,
        notes,
        selected: entry.selected,
        undoStack: state.undoStack.slice(0, -1),
      };
    }

    case 'HINT': {
      if (state.status !== 'playing' || state.hintsRemaining <= 0) {
        return state;
      }
      let target = state.selected;
      if (target === null || isCellLocked(state, target)) {
        const firstEmpty = state.values.findIndex(v => v === 0);
        target = firstEmpty !== -1 ? firstEmpty : state.values.findIndex((_, i) => isCellWrong(state, i));
      }
      if (target === null || target === -1) {
        return state;
      }
      const afterHintBase: GameState = {
        ...state,
        selected: target,
        hintsRemaining: state.hintsRemaining - 1,
        // A hint scores nothing and breaks the speed-bonus chain.
        lastCorrectAt: null,
      };
      const scoreBefore = afterHintBase.score;
      const placed = placeDigit(afterHintBase, target, state.solution[target]);
      // The hinted placement itself scores 0, but a hint that finishes the board still wins the bonus.
      const score = placed.status === 'won' ? scoreBefore + winBonus(state.difficulty, state.elapsedMs) : scoreBefore;
      return {...placed, score, lastCorrectAt: null};
    }

    case 'PAUSE':
      return state.status === 'playing' ? {...state, status: 'paused'} : state;

    case 'RESUME':
      return state.status === 'paused' ? {...state, status: 'playing'} : state;

    case 'TICK':
      if (state.status !== 'playing') {
        return state;
      }
      return {...state, elapsedMs: action.elapsedMs};

    case 'SECOND_CHANCE':
      if (state.status !== 'lost' || state.secondChanceUsed) {
        return state;
      }
      return {...state, status: 'playing', mistakes: MAX_MISTAKES - 1, secondChanceUsed: true};

    default:
      return state;
  }
}
