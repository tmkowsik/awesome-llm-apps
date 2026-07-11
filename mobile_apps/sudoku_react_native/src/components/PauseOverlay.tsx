import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {colors} from '../theme/colors';

/** Covers the board while paused so the puzzle is hidden, like sudoku.com. */
export function PauseOverlay() {
  const dispatch = useGameStore(s => s.dispatch);
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Paused</Text>
      <Pressable style={styles.button} onPress={() => dispatch({type: 'RESUME'})}>
        <Text style={styles.buttonText}>▶ Resume</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textGiven,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '600',
  },
});
