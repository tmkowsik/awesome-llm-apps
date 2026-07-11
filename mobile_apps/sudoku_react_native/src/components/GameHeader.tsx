import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {formatElapsed} from '../store/useGameClock';
import {DIFFICULTY_LABELS} from '../core/difficulty';
import {MAX_MISTAKES} from '../core/engine/state';
import {colors} from '../theme/colors';

export function GameHeader() {
  const goHome = useGameStore(s => s.goHome);
  const dispatch = useGameStore(s => s.dispatch);
  const difficulty = useGameStore(s => s.game?.difficulty ?? 'easy');
  const score = useGameStore(s => s.game?.score ?? 0);
  const mistakes = useGameStore(s => s.game?.mistakes ?? 0);
  const elapsedMs = useGameStore(s => s.game?.elapsedMs ?? 0);
  const status = useGameStore(s => s.game?.status);

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <Pressable onPress={goHome} hitSlop={12}>
          <Text style={styles.back}>‹ Home</Text>
        </Pressable>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Difficulty</Text>
          <Text style={styles.statValue}>{DIFFICULTY_LABELS[difficulty]}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Mistakes</Text>
          <Text style={styles.statValue}>
            {mistakes}/{MAX_MISTAKES}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatElapsed(elapsedMs)}</Text>
        </View>
      </View>
      <View style={styles.side}>
        <Pressable
          hitSlop={12}
          onPress={() => dispatch({type: status === 'paused' ? 'RESUME' : 'PAUSE'})}>
          <Text style={styles.pause}>{status === 'paused' ? '▶' : '⏸'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  side: {
    width: 56,
    alignItems: 'center',
  },
  back: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  pause: {
    fontSize: 22,
    color: colors.textGiven,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textGiven,
  },
});
