import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {formatElapsed} from '../store/useGameClock';
import {DIFFICULTY_LABELS} from '../core/difficulty';
import {DifficultySheet} from './DifficultySheet';
import {colors} from '../theme/colors';

export function WinModal() {
  const goHome = useGameStore(s => s.goHome);
  const game = useGameStore(s => s.game);
  const [pickerVisible, setPickerVisible] = useState(false);

  if (!game || game.status !== 'won') {
    return null;
  }

  return (
    <Modal transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🎉 Excellent!</Text>
          <View style={styles.stats}>
            <Stat label="Difficulty" value={DIFFICULTY_LABELS[game.difficulty]} />
            <Stat label="Time" value={formatElapsed(game.elapsedMs)} />
            <Stat label="Score" value={String(game.score)} />
          </View>
          <Pressable style={styles.primaryButton} onPress={() => setPickerVisible(true)}>
            <Text style={styles.primaryButtonText}>New Game</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={goHome}>
            <Text style={styles.secondaryButtonText}>Home</Text>
          </Pressable>
        </View>
      </View>
      <DifficultySheet visible={pickerVisible} onClose={() => setPickerVisible(false)} />
    </Modal>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '82%',
    maxWidth: 360,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textGiven,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  primaryButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'stretch',
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
