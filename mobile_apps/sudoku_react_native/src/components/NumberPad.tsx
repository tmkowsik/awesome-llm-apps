import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useShallow} from 'zustand/react/shallow';
import {useGameStore} from '../store/gameStore';
import {selectRemainingCounts} from '../core/engine/selectors';
import {Digit} from '../core/types';
import {colors} from '../theme/colors';

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function NumberPad() {
  const remaining = useGameStore(
    useShallow(s => (s.game ? selectRemainingCounts(s.game) : new Array(10).fill(0))),
  );
  const notesMode = useGameStore(s => s.game?.notesMode ?? false);
  const dispatch = useGameStore(s => s.dispatch);

  return (
    <View style={styles.pad}>
      {DIGITS.map(d => {
        const exhausted = remaining[d] <= 0;
        return (
          <Pressable
            key={d}
            disabled={exhausted}
            onPress={() => dispatch({type: 'INPUT_DIGIT', digit: d})}
            style={({pressed}) => [styles.key, pressed && styles.keyPressed, exhausted && styles.keyExhausted]}>
            <Text style={[styles.keyDigit, notesMode && styles.keyDigitNotes]}>{d}</Text>
            <Text style={styles.keyCount}>{exhausted ? '' : remaining[d]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 12,
  },
  key: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: colors.keyBg,
    alignItems: 'center',
    paddingVertical: 8,
  },
  keyPressed: {
    backgroundColor: colors.cellSameValue,
  },
  keyExhausted: {
    opacity: 0.25,
  },
  keyDigit: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.primary,
  },
  keyDigitNotes: {
    color: colors.textNotes,
  },
  keyCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
