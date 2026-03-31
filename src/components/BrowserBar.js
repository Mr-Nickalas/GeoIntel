import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';

export default function BrowserBar({
  locationName,
  coordinates,
  canGoBack,
  onBack,
  onRefresh,
  isScanning,
  signalStrength = 4,
}) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
      pulseAnim.stopAnimation();
      scanAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  const scanOpacity = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  const urlText = coordinates
    ? `geointel://${locationName?.toLowerCase().replace(/,\s*/g, '/').replace(/\s+/g, '-') || 'scanning'}`
    : 'geointel://acquiring-signal...';

  const coordsText = coordinates
    ? `${coordinates.lat.toFixed(4)}°, ${coordinates.lon.toFixed(4)}°`
    : 'Locating...';

  return (
    <View style={styles.container}>
      {/* Nav buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]}
          onPress={onBack}
          disabled={!canGoBack}
        >
          <Text style={[styles.navBtnText, !canGoBack && styles.navBtnTextDisabled]}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={onRefresh}
        >
          <Animated.Text style={[styles.navBtnText, isScanning && { opacity: scanOpacity }]}>
            {isScanning ? '⟳' : '↻'}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* URL Bar */}
      <View style={styles.urlBar}>
        <Animated.View
          style={[
            styles.statusDot,
            {
              backgroundColor: isScanning ? colors.orange : colors.green,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View style={styles.urlContent}>
          <Text style={styles.urlText} numberOfLines={1}>
            {urlText}
          </Text>
          <Text style={styles.coordsText} numberOfLines={1}>
            {coordsText}
          </Text>
        </View>
      </View>

      {/* Signal indicators */}
      <View style={styles.signalContainer}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.signalBar,
              { height: bar * 4 + 4 },
              bar <= signalStrength
                ? { backgroundColor: colors.accent }
                : { backgroundColor: colors.textMuted },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.browserBar,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.sm,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 2,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  navBtnTextDisabled: {
    color: colors.textMuted,
  },
  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  urlContent: {
    flex: 1,
  },
  urlText: {
    color: colors.accent,
    fontSize: typography.sizes.xs,
    fontFamily: typography.mono,
    letterSpacing: 0.3,
  },
  coordsText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.mono,
    marginTop: 1,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    paddingRight: spacing.xs,
  },
  signalBar: {
    width: 3,
    borderRadius: 2,
  },
});
