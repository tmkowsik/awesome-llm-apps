/**
 * @format
 */

import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {useGameStore} from '../src/store/gameStore';

beforeEach(() => {
  jest.useFakeTimers();
  useGameStore.setState({route: 'home', game: null, savedGame: null, clockAnchor: null});
});

afterEach(() => {
  jest.useRealTimers();
});

function textsIn(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map(node => React.Children.toArray(node.props.children).join(''));
}

test('renders the home screen', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  expect(textsIn(tree)).toContain('New Game');
  await ReactTestRenderer.act(() => tree.unmount());
});

test('renders the full game surface after starting a new game', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    useGameStore.getState().newGame('easy');
    tree = ReactTestRenderer.create(<App />);
  });

  const texts = textsIn(tree);
  for (const label of ['Undo', 'Erase', 'Notes', 'Hint', 'Mistakes', 'Score', 'Time', 'Easy']) {
    expect(texts).toContain(label);
  }
  // The board shows the puzzle's given digits.
  const game = useGameStore.getState().game!;
  const givens = game.puzzle.filter(v => v !== 0).length;
  expect(givens).toBeGreaterThanOrEqual(38);

  // Tapping pause shows the pause overlay.
  await ReactTestRenderer.act(() => {
    useGameStore.getState().dispatch({type: 'PAUSE'});
  });
  expect(textsIn(tree)).toContain('Paused');

  await ReactTestRenderer.act(() => tree.unmount());
});
