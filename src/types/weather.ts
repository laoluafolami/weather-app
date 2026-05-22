export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  uvi: number;
  clouds: number;
  dew_point: number;
  sunrise: number;
  sunset: number;
  description: string;
  icon: string;
  main: string;
  dt: number;
}

export interface HourlyWeather {
  dt: number;
  temp: number;
  icon: string;
  description: string;
  pop: number;
}

export interface DailyWeather {
  dt: number;
  temp_min: number;
  temp_max: number;
  icon: string;
  description: string;
  pop: number;
  humidity: number;
  wind_speed: number;
  main: string;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  alerts?: WeatherAlert[];
  timezone: string;
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
}

export interface GeocodingResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}
