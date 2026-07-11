import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Cell} from './Cell';
import {useBoardMetrics} from '../theme/metrics';
import {colors} from '../theme/colors';

const INDICES = Array.from({length: 81}, (_, i) => i);

export function Board() {
  const {boardSize, cellSize} = useBoardMetrics();
  return (
    <View style={[styles.board, {width: boardSize + 4, height: boardSize + 4}]}>
      {INDICES.map(idx => (
        <Cell key={idx} idx={idx} size={cellSize} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: colors.boardLineBold,
    alignSelf: 'center',
    backgroundColor: colors.cellBg,
  },
});
