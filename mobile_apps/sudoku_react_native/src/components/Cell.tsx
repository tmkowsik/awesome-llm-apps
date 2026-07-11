import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useShallow} from 'zustand/react/shallow';
import {useGameStore} from '../store/gameStore';
import {CellView, selectCellView} from '../core/engine/selectors';
import {colors} from '../theme/colors';

interface Props {
  idx: number;
  size: number;
}

const EMPTY_VIEW: CellView = {
  value: 0,
  notes: 0,
  given: false,
  locked: false,
  wrong: false,
  selected: false,
  peer: false,
  sameValue: false,
  conflict: false,
};

function backgroundFor(view: CellView): string {
  if (view.selected) {
    return colors.cellSelected;
  }
  if (view.conflict) {
    return colors.cellConflict;
  }
  if (view.sameValue) {
    return colors.cellSameValue;
  }
  if (view.peer) {
    return colors.cellPeer;
  }
  return colors.cellBg;
}

function digitColorFor(view: CellView): string {
  if (view.wrong) {
    return colors.textWrong;
  }
  if (view.given) {
    return colors.textGiven;
  }
  return colors.textUser;
}

function Notes({mask, size}: {mask: number; size: number}) {
  const noteSize = size / 3;
  return (
    <View style={styles.notesGrid}>
      {Array.from({length: 9}, (_, i) => (
        <Text
          key={i}
          style={[
            styles.noteText,
            {width: noteSize, height: noteSize, fontSize: Math.max(8, noteSize * 0.72), lineHeight: noteSize},
          ]}>
          {mask & (1 << i) ? i + 1 : ''}
        </Text>
      ))}
    </View>
  );
}

export const Cell = React.memo(function CellInner({idx, size}: Props) {
  const view = useGameStore(
    useShallow(s => (s.game ? selectCellView(s.game, idx) : EMPTY_VIEW)),
  );
  const dispatch = useGameStore(s => s.dispatch);

  const row = Math.floor(idx / 9);
  const col = idx % 9;

  return (
    <Pressable
      onPress={() => dispatch({type: 'SELECT_CELL', idx})}
      style={[
        styles.cell,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          width: size,
          height: size,
          backgroundColor: backgroundFor(view),
          borderRightWidth: col === 8 ? 0 : col % 3 === 2 ? 2 : StyleSheet.hairlineWidth,
          borderBottomWidth: row === 8 ? 0 : row % 3 === 2 ? 2 : StyleSheet.hairlineWidth,
          borderRightColor: col % 3 === 2 ? colors.boardLineBold : colors.boardLine,
          borderBottomColor: row % 3 === 2 ? colors.boardLineBold : colors.boardLine,
        },
      ]}>
      {view.value !== 0 ? (
        <Text style={[styles.digit, {fontSize: size * 0.62, color: digitColorFor(view)}]}>
          {view.value}
        </Text>
      ) : view.notes !== 0 ? (
        <Notes mask={view.notes} size={size} />
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontWeight: '500',
  },
  notesGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
  },
  noteText: {
    textAlign: 'center',
    color: colors.textNotes,
  },
});
