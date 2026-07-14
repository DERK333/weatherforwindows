/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Represents a geocoded city/location returned by the Open-Meteo Geocoding API. */
export interface GeocodedLocation {
  /** Unique numeric identifier for the location. */
  id: number;
  /** Display name of the city or locality. */
  name: string;
  latitude: number;
  longitude: number;
  /** Elevation above sea level in metres (optional). */
  elevation?: number;
  /** ISO 3166-1 alpha-2 country code (e.g. "US"). */
  country_code?: string;
  /** IANA timezone string (e.g. "America/Los_Angeles"). */
  timezone: string;
  /** Full country name. */
  country?: string;
  /** State or province name. */
  admin1?: string;
}

/** Current weather snapshot from Open-Meteo (`current` block). */
export interface CurrentWeather {
  /** ISO 8601 timestamp of the observation. */
  time: string;
  /** Air temperature at 2 m above ground in °C. */
  temperature_2m: number;
  /** Relative humidity at 2 m (%). */
  relative_humidity_2m: number;
  /** Feels-like temperature accounting for wind chill / heat index (°C). */
  apparent_temperature: number;
  /** 1 = daytime, 0 = nighttime. */
  is_day: number;
  /** Total precipitation in mm. */
  precipitation: number;
  /** Rain component of precipitation in mm. */
  rain: number;
  /** Showers component of precipitation in mm. */
  showers: number;
  /** Snowfall in cm. */
  snowfall: number;
  /** WMO weather interpretation code (0–99). */
  weather_code: number;
  /** Cloud cover percentage (0–100). */
  cloud_cover: number;
  /** Mean sea level pressure in hPa. */
  pressure_msl: number;
  /** Wind speed at 10 m above ground in km/h. */
  wind_speed_10m: number;
  /** Wind direction at 10 m in degrees (0–360). */
  wind_direction_10m: number;
  /** UV index (0+). */
  uv_index: number;
}

/** Hourly forecast arrays from Open-Meteo (`hourly` block). All arrays share the same index. */
export interface HourlyForecast {
  /** ISO 8601 timestamps, one per hour. */
  time: string[];
  temperature_2m: number[];
  /** Probability of precipitation per hour (0–100 %). */
  precipitation_probability: number[];
  weather_code: number[];
  relative_humidity_2m: number[];
  uv_index: number[];
}

/** 7-day daily forecast summary from Open-Meteo (`daily` block). All arrays share the same index. */
export interface DailyForecast {
  /** ISO 8601 date strings (YYYY-MM-DD), one per day. */
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  /** ISO 8601 sunrise timestamps. */
  sunrise: string[];
  /** ISO 8601 sunset timestamps. */
  sunset: string[];
  uv_index_max: number[];
  /** Maximum daily precipitation probability (0–100 %). */
  precipitation_probability_max: number[];
}

/** Full Open-Meteo forecast response envelope. */
export interface WeatherData {
  latitude: number;
  longitude: number;
  /** Time taken to generate the response (ms). */
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  /** Station elevation in metres. */
  elevation: number;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
}

/** Combined response returned by `GET /api/weather`. */
export interface WeatherResponse {
  weather: WeatherData;
  /**
   * AI-generated meteorological briefing from Gemini, or a static fallback string
   * when `GEMINI_API_KEY` is not configured.
   */
  briefing: string | null;
  /** Attribution string for the data source. */
  provider: string;
}

/** Payload for a Windows-style Action Center toast notification. */
export interface AppToast {
  /** Unique toast identifier (random alphanumeric). */
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  /** Human-readable time string (HH:MM). */
  timestamp: string;
}

/** Configuration state for the Live Tile simulation preview. */
export interface LiveTileState {
  size: "small" | "medium" | "wide" | "large";
  theme: "blue" | "dark" | "teal" | "purple" | "crimson";
  showTemp: boolean;
  showIcon: boolean;
  pulseAnimation: boolean;
}

/** Form values used by the StorePackager component to generate Package.appxmanifest XML. */
export interface StorePackageManifest {
  /** Package identity name from Microsoft Partner Center (e.g. "12345Dev.AppName"). */
  packageIdentityName: string;
  /** Publisher display name shown in the Store listing. */
  publisherDisplayName: string;
  /** Publisher CN subject string from Partner Center (e.g. "CN=XXXX-…"). */
  publisherId: string;
  /** Four-part version string (e.g. "1.0.0.0"). */
  packageVersion: string;
  /** App display name shown on the tile and in the Store. */
  displayName: string;
  /** Short description for the Store catalog. */
  description: string;
  capabilities: {
    /** Required for fetching weather/AI data over the internet. */
    internetClient: boolean;
    /** Optional — enables GPS-based city auto-detection. */
    location: boolean;
  };
}
