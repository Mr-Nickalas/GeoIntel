import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';

const ACTIONS = [
  {
    id: 'weather',
    icon: '🌤',
    label: 'Weather',
    sublabel: 'Atmosphere',
    accentColor: colors.accent,
    dimColor: colors.accentDim,
  },
  {
    id: 'airquality',
    icon: '💨',
    label: 'Air Quality',
    sublabel: 'Atmosphere',
    accentColor: colors.green,
    dimColor: colors.greenDim,
  },
  {
    id: 'wildlife',
    icon: '🦅',
    label: 'Wildlife',
    sublabel: 'Biodiversity',
    accentColor: colors.orange,
    dimColor: colors.orangeDim,
  },
  {
    id: 'resources',
    icon: '⛰',
    label: 'Resources',
    sublabel: 'Terrain & Land',
    accentColor: colors.purple,
    dimColor: colors.purpleDim,
  },
];

function ActionButton({ action, onPress, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.buttonWrapper]}>
      <TouchableOpacity
        style={[
          styles.button,
          { borderColor: action.accentColor + '33', backgroundColor: action.dimColor },
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => onPress(action.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{action.icon}</Text>
        <Text style={[styles.label, { color: action.accentColor }]}>{action.label}</Text>
        <Text style={styles.sublabel}>{action.sublabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function QuickActionGrid({ onAction, disabled }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {ACTIONS.slice(0, 2).map((a) => (
          <ActionButton key={a.id} action={a} onPress={onAction} disabled={disabled} />
        ))}
      </View>
      <View style={styles.row}>
        {ACTIONS.slice(2).map((a) => (
          <ActionButton key={a.id} action={a} onPress={onAction} disabled={disabled} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sublabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
