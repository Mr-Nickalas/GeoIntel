import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, radius, typography } from '../constants/theme';

export default function SatelliteMap({
  location,
  isScanning,
  mapType,
  onToggleMapType,
  onMapPress,
}) {
  const mapRef = useRef(null);
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const scanRotate = useRef(new Animated.Value(0)).current;
  const scanScale = useRef(new Animated.Value(0.3)).current;
  const scanOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 2.2, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.timing(scanRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      Animated.timing(scanScale, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.timing(scanOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      scanRotate.stopAnimation();
      Animated.timing(scanOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        scanScale.setValue(0.3);
        scanRotate.setValue(0);
      });
    }
  }, [isScanning]);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.lat,
          longitude: location.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        800
      );
    }
  }, [location]);

  const spin = scanRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const region = location
    ? {
        latitude: location.lat,
        longitude: location.lon,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType || 'satellite'}
        initialRegion={region}
        onPress={onMapPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
      >
        {location && (
          <>
            <Circle
              center={{ latitude: location.lat, longitude: location.lon }}
              radius={800}
              strokeColor={colors.accentGlow}
              fillColor="rgba(0, 200, 255, 0.04)"
              strokeWidth={1}
            />
            <Marker
              coordinate={{ latitude: location.lat, longitude: location.lon }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerOuter}>
                  <View style={styles.markerInner} />
                </View>
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Pulse ring overlay */}
      {location && (
        <View style={styles.pulseContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.pulseRing,
              { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
            ]}
          />
        </View>
      )}

      {/* Scan overlay */}
      <Animated.View
        style={[styles.scanOverlay, { opacity: scanOpacity }]}
        pointerEvents="none"
      >
        <Animated.View style={[styles.scanLine, { transform: [{ rotate: spin }] }]} />
        <View style={styles.scanGrid} />
        <View style={styles.scanCorner} />
        <Text style={styles.scanText}>SCANNING AREA...</Text>
      </Animated.View>

      {/* Crosshair corners */}
      <View style={styles.crosshairTL} pointerEvents="none" />
      <View style={styles.crosshairTR} pointerEvents="none" />
      <View style={styles.crosshairBL} pointerEvents="none" />
      <View style={styles.crosshairBR} pointerEvents="none" />

      {/* Map type toggle */}
      <TouchableOpacity style={styles.layerToggle} onPress={onToggleMapType}>
        <Text style={styles.layerToggleText}>
          {mapType === 'satellite' ? '🗺' : '🛰'}
        </Text>
      </TouchableOpacity>

      {/* Coordinates HUD */}
      {location && (
        <View style={styles.coordsHud} pointerEvents="none">
          <Text style={styles.coordsHudText}>
            {location.lat.toFixed(5)}° {location.lat >= 0 ? 'N' : 'S'}{'  '}
            {Math.abs(location.lon).toFixed(5)}° {location.lon >= 0 ? 'E' : 'W'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 200, 255, 0.15)',
  },
  markerInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent,
  },
  pulseContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 200, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: 200,
    height: 1,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  scanGrid: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 255, 0.25)',
  },
  scanCorner: {},
  scanText: {
    position: 'absolute',
    bottom: 80,
    color: colors.accent,
    fontSize: typography.sizes.xs,
    fontFamily: typography.mono,
    letterSpacing: 3,
    opacity: 0.8,
  },
  crosshairTL: {
    position: 'absolute',
    top: 16, left: 16,
    width: 20, height: 20,
    borderTopWidth: 1.5, borderLeftWidth: 1.5,
    borderColor: 'rgba(0, 200, 255, 0.5)',
  },
  crosshairTR: {
    position: 'absolute',
    top: 16, right: 16,
    width: 20, height: 20,
    borderTopWidth: 1.5, borderRightWidth: 1.5,
    borderColor: 'rgba(0, 200, 255, 0.5)',
  },
  crosshairBL: {
    position: 'absolute',
    bottom: 16, left: 16,
    width: 20, height: 20,
    borderBottomWidth: 1.5, borderLeftWidth: 1.5,
    borderColor: 'rgba(0, 200, 255, 0.5)',
  },
  crosshairBR: {
    position: 'absolute',
    bottom: 16, right: 16,
    width: 20, height: 20,
    borderBottomWidth: 1.5, borderRightWidth: 1.5,
    borderColor: 'rgba(0, 200, 255, 0.5)',
  },
  layerToggle: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.xl + spacing.xs,
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(10, 13, 20, 0.85)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerToggleText: {
    fontSize: 18,
  },
  coordsHud: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 13, 20, 0.75)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  coordsHudText: {
    color: colors.accent,
    fontSize: typography.sizes.xs,
    fontFamily: typography.mono,
    letterSpacing: 0.5,
  },
});
