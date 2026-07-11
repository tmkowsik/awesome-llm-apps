import React from 'react';
import {useGameStore} from '../store/gameStore';
import {HomeScreen} from '../screens/HomeScreen';
import {GameScreen} from '../screens/GameScreen';

/**
 * v1 has exactly two screens, so navigation is a conditional render.
 * Swap for a real stack if meta screens (stats, daily challenges) arrive.
 */
export function RootNavigator() {
  const route = useGameStore(s => s.route);
  return route === 'game' ? <GameScreen /> : <HomeScreen />;
}
