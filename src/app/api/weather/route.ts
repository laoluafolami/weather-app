import { NextRequest, NextResponse } from "next/server";
import {
  WeatherData,
  GeocodingResult,
  CurrentWeather,
  HourlyWeather,
  DailyWeather,
} from "@/types/weather";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY || "demo";
const BASE_URL = "https://api.openweathermap.org";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch reverse geocoding, current weather, and 5-day forecast in parallel
    const [geoRes, currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`),
      fetch(`${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
      fetch(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      // Return mock data if API key is not yet activated
      return NextResponse.json(getMockData(parseFloat(lat), parseFloat(lon)));
    }

    const geoData: GeocodingResult[] = await geoRes.json();
    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    const locationName = geoData[0]?.name || currentData.name || "Unknown";
    const country = geoData[0]?.country || "";

    // Build current weather
    const current: CurrentWeather = {
      temp: Math.round(currentData.main.temp),
      feels_like: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      pressure: currentData.main.pressure,
      wind_speed: Math.round(currentData.wind.speed * 3.6),
      wind_deg: currentData.wind.deg,
      visibility: Math.round((currentData.visibility || 10000) / 1000),
      uvi: 0, // not available in free tier, set to 0
      clouds: currentData.clouds.all,
      dew_point: Math.round(currentData.main.temp - ((100 - currentData.main.humidity) / 5)),
      sunrise: currentData.sys.sunrise,
      sunset: currentData.sys.sunset,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      main: currentData.weather[0].main,
      dt: currentData.dt,
    };

    // Build hourly forecast from 3-hour intervals (next 24h = 8 entries)
    const hourly: HourlyWeather[] = forecastData.list.slice(0, 8).map((h: {
      dt: number;
      main: { temp: number };
      weather: { icon: string; description: string }[];
      pop: number;
    }) => ({
      dt: h.dt,
      temp: Math.round(h.main.temp),
      icon: h.weather[0].icon,
      description: h.weather[0].description,
      pop: Math.round((h.pop || 0) * 100),
    }));

    // Build daily forecast by grouping 3-hour intervals by day
    const dailyMap = new Map<string, {
      dt: number;
      temps: number[];
      icons: string[];
      descriptions: string[];
      mains: string[];
      pops: number[];
      humidities: number[];
      wind_speeds: number[];
    }>();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: item.dt,
          temps: [],
          icons: [],
          descriptions: [],
          mains: [],
          pops: [],
          humidities: [],
          wind_speeds: [],
        });
      }
      const entry = dailyMap.get(date)!;
      entry.temps.push(item.main.temp);
      entry.icons.push(item.weather[0].icon);
      entry.descriptions.push(item.weather[0].description);
      entry.mains.push(item.weather[0].main);
      entry.pops.push((item.pop || 0) * 100);
      entry.humidities.push(item.main.humidity);
      entry.wind_speeds.push(item.wind.speed * 3.6);
    }

    const daily: DailyWeather[] = Array.from(dailyMap.values()).map((d) => {
      // Pick the most common icon for midday, or first occurrence
      const iconCounts = new Map<string, number>();
      d.icons.forEach((icon) => iconCounts.set(icon, (iconCounts.get(icon) || 0) + 1));
      const bestIcon = Array.from(iconCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

      const mainCounts = new Map<string, number>();
      d.mains.forEach((m) => mainCounts.set(m, (mainCounts.get(m) || 0) + 1));
      const bestMain = Array.from(mainCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

      return {
        dt: d.dt,
        temp_min: Math.round(Math.min(...d.temps)),
        temp_max: Math.round(Math.max(...d.temps)),
        icon: bestIcon,
        description: d.descriptions[Math.floor(d.descriptions.length / 2)],
        pop: Math.round(Math.max(...d.pops)),
        humidity: Math.round(d.humidities.reduce((a, b) => a + b, 0) / d.humidities.length),
        wind_speed: Math.round(d.wind_speeds.reduce((a, b) => a + b, 0) / d.wind_speeds.length),
        main: bestMain,
      };
    });

    const weatherData: WeatherData = {
      current,
      hourly,
      daily,
      alerts: undefined,
      timezone: currentData.timezone?.toString() || Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: {
        name: locationName,
        country,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      },
    };

    return NextResponse.json(weatherData);
  } catch {
    return NextResponse.json(getMockData(parseFloat(lat || "6.5244"), parseFloat(lon || "3.3792")));
  }
}

function getMockData(lat: number, lon: number): WeatherData {
  const now = Math.floor(Date.now() / 1000);
  const hourlyTemps = [28, 27, 26, 25, 24, 24, 25, 27, 29, 30, 31, 32, 32, 31, 30, 29, 28, 27, 26, 25, 25, 24, 24, 25];
  const icons = ["01d", "02d", "03d", "02d", "01d", "01n", "02n", "03n", "01d", "01d", "02d", "02d", "01d", "02d", "03d", "02d", "01d", "01d", "01n", "02n", "01n", "01n", "02n", "01n"];

  return {
    current: {
      temp: 29,
      feels_like: 33,
      humidity: 78,
      pressure: 1012,
      wind_speed: 14,
      wind_deg: 210,
      visibility: 10,
      uvi: 7,
      clouds: 40,
      dew_point: 24,
      sunrise: now - 21600,
      sunset: now + 21600,
      description: "partly cloudy",
      icon: "02d",
      main: "Clouds",
      dt: now,
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      dt: now + i * 3600,
      temp: hourlyTemps[i],
      icon: icons[i],
      description: i < 6 ? "clear sky" : i < 12 ? "few clouds" : i < 18 ? "scattered clouds" : "clear sky",
      pop: i >= 10 && i <= 14 ? Math.round(Math.random() * 40) : 0,
    })),
    daily: [
      { dt: now, temp_min: 24, temp_max: 32, icon: "02d", description: "partly cloudy", pop: 20, humidity: 78, wind_speed: 14, main: "Clouds" },
      { dt: now + 86400, temp_min: 23, temp_max: 31, icon: "10d", description: "light rain", pop: 60, humidity: 82, wind_speed: 18, main: "Rain" },
      { dt: now + 172800, temp_min: 22, temp_max: 28, icon: "09d", description: "moderate rain", pop: 80, humidity: 88, wind_speed: 22, main: "Rain" },
      { dt: now + 259200, temp_min: 23, temp_max: 30, icon: "04d", description: "overcast clouds", pop: 30, humidity: 75, wind_speed: 12, main: "Clouds" },
      { dt: now + 345600, temp_min: 25, temp_max: 33, icon: "01d", description: "clear sky", pop: 5, humidity: 65, wind_speed: 10, main: "Clear" },
      { dt: now + 432000, temp_min: 26, temp_max: 34, icon: "01d", description: "clear sky", pop: 0, humidity: 60, wind_speed: 8, main: "Clear" },
      { dt: now + 518400, temp_min: 25, temp_max: 33, icon: "02d", description: "few clouds", pop: 10, humidity: 68, wind_speed: 11, main: "Clouds" },
    ],
    alerts: undefined,
    timezone: "Africa/Lagos",
    location: { name: "Lagos", country: "NG", lat, lon },
  };
}
