import * as Location from 'expo-location';

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    lat: location.coords.latitude,
    lon: location.coords.longitude,
    accuracy: location.coords.accuracy,
    timestamp: location.timestamp,
  };
}

export async function watchLocation(callback) {
  return await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 10 },
    (loc) => callback({
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
    })
  );
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'GeoIntel/1.0 (satellite-intelligence-browser)' } }
    );
    const data = await res.json();
    const a = data.address || {};
    const city = a.city || a.town || a.village || a.hamlet || a.county || '';
    const region = a.state || a.region || '';
    const country = a.country_code ? a.country_code.toUpperCase() : '';
    const parts = [city, region, country].filter(Boolean);
    return {
      displayName: parts.join(', ') || 'Unknown Location',
      city: city || 'Unknown',
      region,
      country,
      fullName: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    };
  } catch {
    return {
      displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city: 'Unknown',
      region: '',
      country: '',
      fullName: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
    };
  }
}
