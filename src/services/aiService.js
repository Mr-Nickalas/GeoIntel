import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../config';

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

function buildContext(location, locationName, data) {
  const { weather, airQuality, wildlife, terrain } = data;
  const lines = [];

  lines.push(`SCAN LOCATION: ${locationName}`);
  lines.push(`COORDINATES: ${location.lat.toFixed(6)}°, ${location.lon.toFixed(6)}°`);
  lines.push(`SCAN TIME: ${new Date().toUTCString()}`);
  lines.push('');

  if (weather) {
    lines.push('── METEOROLOGICAL DATA ──');
    lines.push(`Conditions: ${weather.condition}`);
    lines.push(`Temperature: ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`);
    lines.push(`High/Low: ${weather.tempMax}°C / ${weather.tempMin}°C`);
    lines.push(`Humidity: ${weather.humidity}%`);
    lines.push(`Wind: ${weather.windSpeed} km/h ${weather.windDirection}`);
    lines.push(`UV Index: ${weather.uvIndex} (daily max: ${weather.uvMax})`);
    lines.push(`Atmospheric Pressure: ${weather.pressure} hPa`);
    if (weather.visibility) lines.push(`Visibility: ${(weather.visibility / 1000).toFixed(1)} km`);
    lines.push(`Precipitation (24h): ${weather.precipSum} mm`);
    lines.push(`Sunrise: ${weather.sunrise?.split('T')[1] || 'N/A'} | Sunset: ${weather.sunset?.split('T')[1] || 'N/A'}`);
  } else {
    lines.push('── METEOROLOGICAL DATA ──');
    lines.push('Data currently unavailable.');
  }
  lines.push('');

  if (airQuality) {
    lines.push('── AIR QUALITY ANALYSIS ──');
    lines.push(`US AQI: ${airQuality.usAqi ?? 'N/A'} — ${airQuality.aqiCategory}`);
    lines.push(`EU AQI: ${airQuality.euAqi ?? 'N/A'}`);
    lines.push(`PM2.5: ${airQuality.pm25 ?? 'N/A'} μg/m³`);
    lines.push(`PM10: ${airQuality.pm10 ?? 'N/A'} μg/m³`);
    lines.push(`Ozone: ${airQuality.ozone ?? 'N/A'} μg/m³`);
    lines.push(`Nitrogen Dioxide: ${airQuality.no2 ?? 'N/A'} μg/m³`);
    lines.push(`Carbon Monoxide: ${airQuality.co ?? 'N/A'} μg/m³`);
    if (airQuality.dust != null) lines.push(`Dust: ${airQuality.dust} μg/m³`);
  } else {
    lines.push('── AIR QUALITY ANALYSIS ──');
    lines.push('Data currently unavailable.');
  }
  lines.push('');

  if (wildlife) {
    lines.push('── BIODIVERSITY SCAN ──');
    lines.push(`Scan radius: ~${wildlife.radiusKm}km`);
    lines.push(`Total occurrence records: ${wildlife.totalRecords}`);
    lines.push(`Unique species identified: ${wildlife.uniqueSpecies}`);
    if (Object.keys(wildlife.kingdoms || {}).length > 0) {
      lines.push(`Kingdoms: ${Object.entries(wildlife.kingdoms).map(([k, v]) => `${k} (${v})`).join(', ')}`);
    }
    if (wildlife.speciesList?.length > 0) {
      lines.push('Notable species:');
      wildlife.speciesList.slice(0, 12).forEach((s) => {
        const name = s.vernacularName ? `${s.name} (${s.vernacularName})` : s.name;
        lines.push(`  · ${name} — ${s.class || s.kingdom}`);
      });
    }
  } else {
    lines.push('── BIODIVERSITY SCAN ──');
    lines.push('Data currently unavailable.');
  }
  lines.push('');

  if (terrain) {
    lines.push('── TERRAIN DATA ──');
    if (terrain.elevation !== null) {
      lines.push(`Elevation: ${terrain.elevation}m (${terrain.elevationFt} ft)`);
    } else {
      lines.push('Elevation: Unavailable');
    }
  }

  return lines.join('\n');
}

export async function analyzeArea({ location, locationName, data, query }) {
  const context = buildContext(location, locationName, data);

  const systemPrompt = `You are GeoIntel, an advanced satellite-based environmental intelligence platform. You synthesize multi-source sensor data — meteorological, atmospheric, ecological, and terrain — into precise, actionable intelligence reports.

Your responses are:
- Data-driven and specific (cite actual values from the data)
- Structured with clear sections using "##" markdown headers
- Concise yet comprehensive
- Written with a technical yet accessible tone
- Focused on what matters most for the user's query

Do not make up data not provided. If data is missing, say so briefly and focus on what IS available.`;

  const userMessage = `${context}

USER QUERY: ${query}

Generate a GeoIntel satellite intelligence report for this location. Address the query directly, reference the actual sensor data, identify any notable patterns or risks, and provide practical insights.`;

  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return message.content[0].text;
}

export async function quickScan({ location, locationName, data, topic }) {
  const queries = {
    weather: 'Provide a detailed weather analysis and forecast insights based on current conditions. Include comfort levels, safety considerations, and what the data suggests about coming conditions.',
    airquality: 'Analyze the air quality data thoroughly. Assess health implications, identify the primary pollutants of concern, explain what may be causing the readings, and provide recommendations.',
    wildlife: 'Analyze the biodiversity data for this area. Identify the most ecologically significant species, describe the habitat type this data suggests, note any interesting or rare species, and describe the overall ecosystem health.',
    resources: 'Based on all available data (terrain, weather patterns, air quality, biodiversity), analyze the natural resources and environmental characteristics of this area. Discuss geology implications from elevation, vegetation patterns from biodiversity, water resources, and overall land character.',
  };
  return analyzeArea({
    location,
    locationName,
    data,
    query: queries[topic] || queries.weather,
  });
}
