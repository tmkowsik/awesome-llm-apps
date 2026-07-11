import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {formatElapsed} from '../store/useGameClock';
import {DIFFICULTY_LABELS} from '../core/difficulty';
import {DifficultySheet} from '../components/DifficultySheet';
import {colors} from '../theme/colors';

export function HomeScreen() {
  const savedGame = useGameStore(s => s.savedGame);
  const continueGame = useGameStore(s => s.continueGame);
  const hydrate = useGameStore(s => s.hydrate);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    hydrate().catch(() => {});
  }, [hydrate]);

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🔢</Text>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.subtitle}>Classic 9×9 number puzzles</Text>
      </View>
      <View style={styles.actions}>
        {savedGame && (
          <Pressable style={styles.continueButton} onPress={continueGame}>
            <Text style={styles.continueTitle}>Continue</Text>
            <Text style={styles.continueMeta}>
              {DIFFICULTY_LABELS[savedGame.difficulty]} · {formatElapsed(savedGame.elapsedMs)} ·{' '}
              {savedGame.mistakes} mistake{savedGame.mistakes === 1 ? '' : 's'}
            </Text>
          </Pressable>
        )}
        <Pressable
          style={savedGame ? styles.newGameOutline : styles.newGameButton}
          onPress={() => setPickerVisible(true)}>
          <Text style={savedGame ? styles.newGameOutlineText : styles.newGameText}>New Game</Text>
        </Pressable>
      </View>
      <DifficultySheet visible={pickerVisible} onClose={() => setPickerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: '30%',
  },
  logo: {
    fontSize: 56,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textGiven,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueTitle: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },
  continueMeta: {
    color: colors.primaryText,
    fontSize: 12,
    opacity: 0.85,
    marginTop: 2,
  },
  newGameButton: {
    backgroundColor: colors.primary,
    borderRadius: 26,
    paddingVertical: 15,
    alignItems: 'center',
  },
  newGameText: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '700',
  },
  newGameOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newGameOutlineText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
});
