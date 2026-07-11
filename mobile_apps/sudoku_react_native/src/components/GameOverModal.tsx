import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {MAX_MISTAKES} from '../core/engine/state';
import {DifficultySheet} from './DifficultySheet';
import {colors} from '../theme/colors';

export function GameOverModal() {
  const dispatch = useGameStore(s => s.dispatch);
  const goHome = useGameStore(s => s.goHome);
  const game = useGameStore(s => s.game);
  const [pickerVisible, setPickerVisible] = useState(false);

  if (!game || game.status !== 'lost') {
    return null;
  }

  return (
    <Modal transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.subtitle}>You made {MAX_MISTAKES} mistakes and lost this game.</Text>
          {!game.secondChanceUsed && (
            <Pressable style={styles.primaryButton} onPress={() => dispatch({type: 'SECOND_CHANCE'})}>
              <Text style={styles.primaryButtonText}>❤️ Second Chance</Text>
            </Pressable>
          )}
          <Pressable
            style={game.secondChanceUsed ? styles.primaryButton : styles.outlineButton}
            onPress={() => setPickerVisible(true)}>
            <Text style={game.secondChanceUsed ? styles.primaryButtonText : styles.outlineButtonText}>
              New Game
            </Text>
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
    color: colors.danger,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
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
  outlineButton: {
    alignSelf: 'stretch',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  outlineButtonText: {
    color: colors.primary,
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
