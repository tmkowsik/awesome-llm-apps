import React, {useEffect} from 'react';
import {BackHandler, StyleSheet, Vibration, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {useGameClock} from '../store/useGameClock';
import {GameHeader} from '../components/GameHeader';
import {Board} from '../components/Board';
import {Toolbar} from '../components/Toolbar';
import {NumberPad} from '../components/NumberPad';
import {PauseOverlay} from '../components/PauseOverlay';
import {WinModal} from '../components/WinModal';
import {GameOverModal} from '../components/GameOverModal';
import {colors} from '../theme/colors';

export function GameScreen() {
  useGameClock();
  const status = useGameStore(s => s.game?.status);
  const mistakes = useGameStore(s => s.game?.mistakes ?? 0);
  const goHome = useGameStore(s => s.goHome);

  // Android hardware back returns to Home (saving the game) instead of exiting.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [goHome]);

  // Brief buzz on each mistake, like sudoku.com.
  useEffect(() => {
    if (mistakes > 0) {
      Vibration.vibrate(120);
    }
  }, [mistakes]);

  return (
    <View style={styles.screen}>
      <GameHeader />
      <View style={styles.boardArea}>
        <Board />
        {status === 'paused' && <PauseOverlay />}
      </View>
      <Toolbar />
      <NumberPad />
      <WinModal />
      <GameOverModal />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  boardArea: {
    marginTop: 8,
  },
});
