import {useWindowDimensions} from 'react-native';

export interface BoardMetrics {
  boardSize: number;
  cellSize: number;
}

const BOARD_MARGIN = 16;
const MAX_BOARD = 420;

export function useBoardMetrics(): BoardMetrics {
  const {width, height} = useWindowDimensions();
  const raw = Math.min(width - BOARD_MARGIN, height * 0.55, MAX_BOARD);
  const cellSize = Math.floor(raw / 9);
  return {boardSize: cellSize * 9, cellSize};
}
