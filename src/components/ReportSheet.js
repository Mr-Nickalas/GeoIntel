import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.82;

const TOPIC_META = {
  weather: { icon: '🌤', label: 'Weather Report', urlPath: 'weather', color: colors.accent },
  airquality: { icon: '💨', label: 'Air Quality Analysis', urlPath: 'air-quality', color: colors.green },
  wildlife: { icon: '🦅', label: 'Wildlife & Biodiversity', urlPath: 'wildlife', color: colors.orange },
  resources: { icon: '⛰', label: 'Natural Resources', urlPath: 'terrain-resources', color: colors.purple },
  custom: { icon: '🔍', label: 'Intelligence Report', urlPath: 'custom-query', color: colors.accent },
};

function parseAndRenderText(text) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      elements.push(<View key={key++} style={{ height: spacing.sm }} />);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={key++} style={styles.heading2}>{line.slice(3)}</Text>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <Text key={key++} style={styles.heading1}>{line.slice(2)}</Text>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <Text key={key++} style={styles.heading3}>{line.slice(4)}</Text>
      );
    } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('· ')) {
      elements.push(
        <View key={key++} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>·</Text>
          <Text style={styles.bulletText}>{line.slice(2)}</Text>
        </View>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <Text key={key++} style={styles.bold}>{line.slice(2, -2)}</Text>
      );
    } else if (line.startsWith('──') || line.startsWith('---')) {
      elements.push(<View key={key++} style={styles.divider} />);
    } else {
      // Handle inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      if (parts.length > 1) {
        elements.push(
          <Text key={key++} style={styles.bodyText}>
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <Text key={idx} style={styles.inlineBold}>{part.slice(2, -2)}</Text>;
              }
              return part;
            })}
          </Text>
        );
      } else {
        elements.push(
          <Text key={key++} style={styles.bodyText}>{line}</Text>
        );
      }
    }
  }

  return elements;
}

export default function ReportSheet({
  visible,
  topic,
  locationName,
  content,
  isLoading,
  error,
  onClose,
}) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const meta = TOPIC_META[topic] || TOPIC_META.custom;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const reportUrl = `geointel://${locationName?.toLowerCase().replace(/,\s*/g, '/').replace(/\s+/g, '-') || 'location'}/report/${meta.urlPath}`;

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_HEIGHT, transform: [{ translateY: slideAnim }] },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        {/* Sheet handle */}
        <View style={styles.handle} />

        {/* Browser-style URL bar */}
        <View style={styles.urlBarContainer}>
          <View style={[styles.urlBarDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.urlBarText, { color: meta.color }]} numberOfLines={1}>
            {reportUrl}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Page title bar */}
        <View style={[styles.pageTitleBar, { borderLeftColor: meta.color }]}>
          <Text style={styles.pageTitleIcon}>{meta.icon}</Text>
          <View>
            <Text style={styles.pageTitleText}>{meta.label}</Text>
            <Text style={styles.pageLocationText}>{locationName}</Text>
          </View>
          <View style={[styles.pageTimestamp]}>
            <Text style={styles.timestampText}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.timestampLabel}>LIVE</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDots}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.loadingDot, { opacity: 0.3 + i * 0.3 }]} />
                ))}
              </View>
              <Text style={styles.loadingText}>Analyzing satellite data...</Text>
              <Text style={styles.loadingSubtext}>
                Aggregating weather · air quality · biodiversity · terrain
              </Text>
            </View>
          )}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorTitle}>Scan Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {content && !isLoading && !error && (
            <View style={styles.reportContent}>
              {parseAndRenderText(content)}
            </View>
          )}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GeoIntel · Data from Open-Meteo, GBIF, Open-Elevation · AI by Claude
          </Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.cardBorder,
    zIndex: 11,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  urlBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  urlBarDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  urlBarText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontFamily: typography.mono,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  pageTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 3,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  pageTitleIcon: {
    fontSize: 26,
  },
  pageTitleText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pageLocationText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 1,
  },
  pageTimestamp: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  timestampText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.mono,
  },
  timestampLabel: {
    color: colors.green,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    color: colors.red,
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  reportContent: {
    gap: 2,
  },
  heading1: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  heading2: {
    color: colors.accent,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heading3: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: 2,
  },
  bold: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  inlineBold: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
    paddingLeft: spacing.sm,
  },
  bulletDot: {
    color: colors.accent,
    fontSize: typography.sizes.lg,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
