import React, {useState} from 'react';
import {ActivityIndicator, InteractionManager, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {DIFFICULTY_LABELS} from '../core/difficulty';
import {DIFFICULTIES, Difficulty} from '../core/types';
import {colors} from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function DifficultySheet({visible, onClose}: Props) {
  const newGame = useGameStore(s => s.newGame);
  const [generating, setGenerating] = useState<Difficulty | null>(null);

  const start = (difficulty: Difficulty) => {
    setGenerating(difficulty);
    // Let the press feedback render before the (synchronous) generation runs.
    InteractionManager.runAfterInteractions(() => {
      newGame(difficulty);
      setGenerating(null);
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={generating ? undefined : onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>New Game</Text>
          {DIFFICULTIES.map(d => (
            <Pressable
              key={d}
              style={({pressed}) => [styles.option, pressed && styles.optionPressed]}
              disabled={generating !== null}
              onPress={() => start(d)}>
              <Text style={styles.optionText}>{DIFFICULTY_LABELS[d]}</Text>
              {generating === d && <ActivityIndicator color={colors.primary} />}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textGiven,
    textAlign: 'center',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  optionPressed: {
    backgroundColor: colors.cellPeer,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
