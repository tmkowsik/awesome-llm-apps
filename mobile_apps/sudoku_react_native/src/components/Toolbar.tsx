import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useGameStore} from '../store/gameStore';
import {selectCanUndo} from '../core/engine/selectors';
import {colors} from '../theme/colors';

interface ToolButtonProps {
  label: string;
  glyph: string;
  disabled?: boolean;
  badge?: string;
  active?: boolean;
  onPress: () => void;
}

function ToolButton({label, glyph, disabled, badge, active, onPress}: ToolButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.tool, disabled && styles.toolDisabled]}>
      <View>
        <Text style={styles.toolGlyph}>{glyph}</Text>
        {badge !== undefined && (
          <View style={[styles.badge, active && styles.badgeActive]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}

export function Toolbar() {
  const dispatch = useGameStore(s => s.dispatch);
  const canUndo = useGameStore(s => (s.game ? selectCanUndo(s.game) : false));
  const notesMode = useGameStore(s => s.game?.notesMode ?? false);
  const hints = useGameStore(s => s.game?.hintsRemaining ?? 0);

  return (
    <View style={styles.bar}>
      <ToolButton label="Undo" glyph="↺" disabled={!canUndo} onPress={() => dispatch({type: 'UNDO'})} />
      <ToolButton label="Erase" glyph="⌫" onPress={() => dispatch({type: 'ERASE'})} />
      <ToolButton
        label="Notes"
        glyph="✎"
        badge={notesMode ? 'ON' : 'OFF'}
        active={notesMode}
        onPress={() => dispatch({type: 'TOGGLE_NOTES_MODE'})}
      />
      <ToolButton
        label="Hint"
        glyph="💡"
        badge={String(hints)}
        disabled={hints <= 0}
        onPress={() => dispatch({type: 'HINT'})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  tool: {
    alignItems: 'center',
    minWidth: 64,
  },
  toolDisabled: {
    opacity: 0.35,
  },
  toolGlyph: {
    fontSize: 26,
    color: colors.textGiven,
  },
  toolLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -18,
    backgroundColor: colors.textMuted,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeActive: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.primaryText,
    fontSize: 9,
    fontWeight: '700',
  },
});
