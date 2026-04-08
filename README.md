# GeoIntel

A mobile satellite intelligence browser. Uses your GPS location to display a live satellite map and lets you query an AI for real-time reports on weather, air quality, wildlife, and natural resources — all styled like a web browser.

## Features

- **Browser-like UI** — address bar showing `geointel://location-name`, back/refresh navigation, page-style reports
- **Live satellite map** — Google Maps satellite tiles with scan-radius overlay, pulsing location marker, and map/standard toggle
- **4 quick scan topics** — Weather, Air Quality, Wildlife & Biodiversity, Natural Resources
- **Free-text AI queries** — ask anything about your location
- **Multi-source data** — pulls from Open-Meteo (weather + air quality), GBIF (biodiversity), Open-Elevation (terrain)
- **AI analysis** — Claude synthesizes all sensor data into structured intelligence reports

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo 52 |
| Map | react-native-maps (Google Maps satellite) |
| Location | expo-location |
| Weather & Air | Open-Meteo API (free, no key) |
| Biodiversity | GBIF Occurrence API (free, no key) |
| Terrain | Open-Elevation API (free, no key) |
| Geocoding | Nominatim / OpenStreetMap (free) |
| AI | Anthropic Claude (claude-opus-4-6) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your API keys

Edit `src/config.js`:

```js
export const ANTHROPIC_API_KEY = 'sk-ant-...';     // required for AI reports
export const GOOGLE_MAPS_API_KEY = 'AIza...';       // required for Android satellite map
```

Get keys:
- **Anthropic API key**: https://console.anthropic.com
- **Google Maps API key**: https://console.cloud.google.com (enable Maps SDK for Android)

Also add your Google Maps key to `app.json` under `android.config.googleMaps.apiKey`.

### 3. Run the app

```bash
# Start Expo dev server
npx expo start

# iOS simulator
npx expo run:ios

# Android device/emulator
npx expo run:android
```

> **Note:** `react-native-maps` requires a native build. It will not work with Expo Go on Android without the Google Maps API key configured. Use `expo run:android` / `expo run:ios` or EAS Build.

### 4. EAS Build (recommended for device testing)

```bash
npm install -g eas-cli
eas build --profile development --platform android
```

## Project Structure

```
GeoIntel/
├── App.js                        # Entry point
├── app.json                      # Expo config + permissions
├── package.json
├── src/
│   ├── config.js                 # API keys
│   ├── constants/
│   │   └── theme.js              # Colors, spacing, typography
│   ├── services/
│   │   ├── locationService.js    # GPS + Nominatim geocoding
│   │   ├── dataService.js        # Open-Meteo, GBIF, Open-Elevation
│   │   └── aiService.js          # Claude API integration
│   ├── components/
│   │   ├── BrowserBar.js         # Top address/nav bar
│   │   ├── SatelliteMap.js       # Map with overlays + animations
│   │   ├── QuickActionGrid.js    # 4 topic shortcut buttons
│   │   ├── QueryBar.js           # Free-text query input
│   │   └── ReportSheet.js        # Animated report bottom sheet
│   └── screens/
│       └── MainScreen.js         # Main screen + state orchestration
```

## How It Works

1. App requests GPS permission and acquires your location
2. Reverse geocoding identifies your city/region (Nominatim/OpenStreetMap)
3. Tapping a quick-action button or submitting a query triggers:
   - Parallel fetches from Open-Meteo, GBIF, and Open-Elevation
   - All data is assembled into a structured satellite-scan context block
   - Claude analyzes the data and generates a formatted intelligence report
4. Report slides up as a bottom sheet with a browser-page aesthetic

## Data Sources

| Source | Data | API |
|---|---|---|
| Open-Meteo | Temperature, humidity, wind, UV, precipitation, sunrise/sunset | `api.open-meteo.com` |
| Open-Meteo AQ | PM2.5, PM10, ozone, NO2, CO, US AQI | `air-quality-api.open-meteo.com` |
| GBIF | Species occurrences, biodiversity records (15km radius) | `api.gbif.org` |
| Open-Elevation | Terrain elevation | `api.open-elevation.com` |
| Nominatim | Reverse geocoding (lat/lon to place name) | `nominatim.openstreetmap.org` |
