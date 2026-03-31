import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BrowserBar from '../components/BrowserBar';
import SatelliteMap from '../components/SatelliteMap';
import QuickActionGrid from '../components/QuickActionGrid';
import QueryBar from '../components/QueryBar';
import ReportSheet from '../components/ReportSheet';
import { requestLocationPermission, getCurrentLocation, reverseGeocode } from '../services/locationService';
import { fetchAllData } from '../services/dataService';
import { analyzeArea, quickScan } from '../services/aiService';
import { colors } from '../constants/theme';

export default function MainScreen() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Acquiring Signal...');
  const [mapType, setMapType] = useState('satellite');
  const [sensorData, setSensorData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [reportTopic, setReportTopic] = useState('weather');
  const [reportContent, setReportContent] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const locationWatcher = useRef(null);

  // Init: get location
  useEffect(() => {
    initLocation();
    return () => {
      locationWatcher.current?.remove?.();
    };
  }, []);

  async function initLocation() {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert(
        'Location Required',
        'GeoIntel needs location access to scan your surroundings. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      const geoName = await reverseGeocode(loc.lat, loc.lon);
      setLocationName(geoName.displayName);
    } catch (e) {
      Alert.alert('Location Error', 'Failed to get your location. Please try refreshing.');
    }
  }

  async function refreshLocation() {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      const geoName = await reverseGeocode(loc.lat, loc.lon);
      setLocationName(geoName.displayName);
      const data = await fetchAllData(loc.lat, loc.lon);
      setSensorData(data);
    } catch (e) {
      // Silent fail for refresh
    } finally {
      setIsScanning(false);
    }
  }

  async function handleQuickAction(topic) {
    if (!location) {
      Alert.alert('No Location', 'Waiting for GPS signal...');
      return;
    }
    setReportTopic(topic);
    setReportContent(null);
    setReportError(null);
    setReportLoading(true);
    setSheetVisible(true);
    setCanGoBack(true);

    try {
      setIsScanning(true);
      let data = sensorData;
      if (!data) {
        data = await fetchAllData(location.lat, location.lon);
        setSensorData(data);
      }
      const result = await quickScan({
        location,
        locationName,
        data,
        topic,
      });
      setReportContent(result);
    } catch (e) {
      setReportError(
        e?.message?.includes('API')
          ? 'AI service unavailable. Check your API key in src/config.js.'
          : `Analysis failed: ${e.message || 'Unknown error'}`
      );
    } finally {
      setReportLoading(false);
      setIsScanning(false);
    }
  }

  async function handleQuery(queryText) {
    if (!location) {
      Alert.alert('No Location', 'Waiting for GPS signal...');
      return;
    }
    setReportTopic('custom');
    setReportContent(null);
    setReportError(null);
    setReportLoading(true);
    setSheetVisible(true);
    setCanGoBack(true);

    try {
      setIsScanning(true);
      let data = sensorData;
      if (!data) {
        data = await fetchAllData(location.lat, location.lon);
        setSensorData(data);
      }
      const result = await analyzeArea({
        location,
        locationName,
        data,
        query: queryText,
      });
      setReportContent(result);
    } catch (e) {
      setReportError(
        e?.message?.includes('API') || e?.message?.includes('401')
          ? 'AI service error. Please check your Anthropic API key in src/config.js.'
          : `Analysis failed: ${e.message || 'Unknown error'}`
      );
    } finally {
      setReportLoading(false);
      setIsScanning(false);
    }
  }

  function handleBack() {
    if (sheetVisible) {
      setSheetVisible(false);
      setCanGoBack(false);
    }
  }

  function handleCloseSheet() {
    setSheetVisible(false);
    setCanGoBack(false);
  }

  function handleToggleMapType() {
    setMapType((prev) => (prev === 'satellite' ? 'standard' : 'satellite'));
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" backgroundColor={colors.browserBar} />

      <BrowserBar
        locationName={locationName}
        coordinates={location}
        canGoBack={canGoBack}
        onBack={handleBack}
        onRefresh={refreshLocation}
        isScanning={isScanning}
      />

      <View style={styles.mapContainer}>
        <SatelliteMap
          location={location}
          isScanning={isScanning}
          mapType={mapType}
          onToggleMapType={handleToggleMapType}
        />
      </View>

      <View style={styles.bottomPanel}>
        <QuickActionGrid
          onAction={handleQuickAction}
          disabled={isScanning || !location}
        />
        <QueryBar
          onSubmit={handleQuery}
          disabled={isScanning || !location}
          isScanning={isScanning}
        />
      </View>

      <ReportSheet
        visible={sheetVisible}
        topic={reportTopic}
        locationName={locationName}
        content={reportContent}
        isLoading={reportLoading}
        error={reportError}
        onClose={handleCloseSheet}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: colors.background,
    paddingBottom: Platform.OS === 'ios' ? 0 : 0,
  },
});
