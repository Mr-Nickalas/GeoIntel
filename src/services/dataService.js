const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Heavy drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

export async function fetchWeather(lat, lon) {
  try {
    const url = [
      'https://api.open-meteo.com/v1/forecast',
      `?latitude=${lat}&longitude=${lon}`,
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code',
      ',wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index,precipitation',
      '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max',
      '&timezone=auto&forecast_days=1',
    ].join('');
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current || {};
    const d = data.daily || {};
    const windDirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const windDir = windDirs[Math.round((c.wind_direction_10m || 0) / 22.5) % 16];
    return {
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      weatherCode: c.weather_code,
      condition: WMO_CODES[c.weather_code] || 'Unknown',
      windSpeed: c.wind_speed_10m,
      windDirection: windDir,
      windDeg: c.wind_direction_10m,
      pressure: c.surface_pressure,
      visibility: c.visibility,
      uvIndex: c.uv_index,
      precipitation: c.precipitation,
      tempMax: d.temperature_2m_max?.[0],
      tempMin: d.temperature_2m_min?.[0],
      sunrise: d.sunrise?.[0],
      sunset: d.sunset?.[0],
      precipSum: d.precipitation_sum?.[0],
      uvMax: d.uv_index_max?.[0],
      units: data.current_units || {},
    };
  } catch (e) {
    return null;
  }
}

export async function fetchAirQuality(lat, lon) {
  try {
    const url = [
      'https://air-quality-api.open-meteo.com/v1/air-quality',
      `?latitude=${lat}&longitude=${lon}`,
      '&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi,european_aqi,dust,ammonia',
    ].join('');
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current || {};
    const aqi = c.us_aqi;
    let aqiCategory = 'Unknown';
    let aqiColor = '#94a3b8';
    if (aqi <= 50) { aqiCategory = 'Good'; aqiColor = '#00e676'; }
    else if (aqi <= 100) { aqiCategory = 'Moderate'; aqiColor = '#ff9800'; }
    else if (aqi <= 150) { aqiCategory = 'Unhealthy for Sensitive Groups'; aqiColor = '#ff5722'; }
    else if (aqi <= 200) { aqiCategory = 'Unhealthy'; aqiColor = '#ef5350'; }
    else if (aqi <= 300) { aqiCategory = 'Very Unhealthy'; aqiColor = '#ab47bc'; }
    else if (aqi != null) { aqiCategory = 'Hazardous'; aqiColor = '#7b1fa2'; }
    return {
      usAqi: aqi,
      euAqi: c.european_aqi,
      aqiCategory,
      aqiColor,
      pm25: c.pm2_5,
      pm10: c.pm10,
      co: c.carbon_monoxide,
      no2: c.nitrogen_dioxide,
      ozone: c.ozone,
      dust: c.dust,
      ammonia: c.ammonia,
    };
  } catch (e) {
    return null;
  }
}

export async function fetchWildlife(lat, lon) {
  try {
    const delta = 0.15;
    const url = [
      'https://api.gbif.org/v1/occurrence/search',
      `?decimalLatitude=${(lat - delta).toFixed(4)},${(lat + delta).toFixed(4)}`,
      `&decimalLongitude=${(lon - delta).toFixed(4)},${(lon + delta).toFixed(4)}`,
      '&hasCoordinate=true&limit=50&occurrenceStatus=PRESENT',
    ].join('');
    const res = await fetch(url);
    const data = await res.json();
    const speciesMap = {};
    const kingdoms = {};
    (data.results || []).forEach((r) => {
      if (r.species) {
        if (!speciesMap[r.species]) {
          speciesMap[r.species] = {
            name: r.species,
            vernacularName: r.vernacularName || null,
            kingdom: r.kingdom || 'Unknown',
            class: r.class || '',
            order: r.order || '',
            family: r.family || '',
            count: 0,
          };
        }
        speciesMap[r.species].count++;
      }
      if (r.kingdom) kingdoms[r.kingdom] = (kingdoms[r.kingdom] || 0) + 1;
    });
    const speciesList = Object.values(speciesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    return {
      totalRecords: data.count || 0,
      uniqueSpecies: Object.keys(speciesMap).length,
      speciesList,
      kingdoms,
      radiusKm: Math.round(delta * 111),
    };
  } catch (e) {
    return null;
  }
}

export async function fetchTerrain(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
    );
    const data = await res.json();
    const elevation = data.results?.[0]?.elevation ?? null;
    return {
      elevation,
      elevationFt: elevation !== null ? Math.round(elevation * 3.28084) : null,
      lat,
      lon,
    };
  } catch {
    return { elevation: null, elevationFt: null, lat, lon };
  }
}

export async function fetchAllData(lat, lon) {
  const [weather, airQuality, wildlife, terrain] = await Promise.allSettled([
    fetchWeather(lat, lon),
    fetchAirQuality(lat, lon),
    fetchWildlife(lat, lon),
    fetchTerrain(lat, lon),
  ]);
  return {
    weather: weather.status === 'fulfilled' ? weather.value : null,
    airQuality: airQuality.status === 'fulfilled' ? airQuality.value : null,
    wildlife: wildlife.status === 'fulfilled' ? wildlife.value : null,
    terrain: terrain.status === 'fulfilled' ? terrain.value : null,
    fetchedAt: new Date().toISOString(),
  };
}
