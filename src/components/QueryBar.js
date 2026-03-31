import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';

export default function QueryBar({ onSubmit, disabled, isScanning }) {
  const [query, setQuery] = useState('');
  const sendScale = useRef(new Animated.Value(1)).current;

  const handleSubmit = () => {
    if (!query.trim() || disabled) return;
    Keyboard.dismiss();
    onSubmit(query.trim());
    setQuery('');
  };

  const handlePressIn = () => {
    Animated.spring(sendScale, { toValue: 0.9, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(sendScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const canSubmit = query.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          placeholder={
            isScanning
              ? 'Scanning area...'
              : 'Ask anything about this location...'
          }
          placeholderTextColor={colors.textMuted}
          returnKeyType="send"
          editable={!disabled}
          multiline={false}
          autoCorrect={false}
          blurOnSubmit
        />
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <TouchableOpacity
            style={[styles.sendBtn, canSubmit && styles.sendBtnActive]}
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!canSubmit}
          >
            <Text style={[styles.sendBtnText, canSubmit && styles.sendBtnTextActive]}>
              {isScanning ? '⟳' : '▶'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Text style={styles.hint}>
        Powered by satellite sensors · AI analysis · Real-time data
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.browserBar,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    paddingVertical: spacing.xs,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sendBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sendBtnTextActive: {
    color: colors.background,
  },
  hint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
});
