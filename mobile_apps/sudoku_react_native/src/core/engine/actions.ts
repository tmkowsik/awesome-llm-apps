import {Difficulty, Digit, Grid} from '../types';

export type GameAction =
  | {type: 'START_GAME'; puzzle: Grid; solution: Grid; difficulty: Difficulty}
  | {type: 'SELECT_CELL'; idx: number}
  | {type: 'INPUT_DIGIT'; digit: Digit}
  | {type: 'TOGGLE_NOTES_MODE'}
  | {type: 'ERASE'}
  | {type: 'UNDO'}
  | {type: 'HINT'}
  | {type: 'PAUSE'}
  | {type: 'RESUME'}
  | {type: 'TICK'; elapsedMs: number}
  | {type: 'SECOND_CHANCE'};
