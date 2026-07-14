/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  HelpCircle,
} from "lucide-react";

/** Visual theme data for a specific weather condition. */
export interface WeatherCondition {
  /** Human-readable label (e.g. "Clear Sky", "Heavy Rain"). */
  label: string;
  /** Lucide icon key used for dynamic icon lookup. */
  icon: string;
  /** Tailwind text colour class for the icon. */
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
  /** Tailwind background class for the Live Tile. */
  tileBg: string;
}

/**
 * Maps a WMO weather interpretation code (0–99) to a `WeatherCondition` descriptor.
 *
 * @param code - WMO code from Open-Meteo (`current.weather_code`, etc.)
 * @returns Visual theme data including label, icon key, and Tailwind colour classes.
 *
 * @see https://open-meteo.com/en/docs — "WMO Weather interpretation codes" section
 */
export function getWeatherCondition(code: number): WeatherCondition {
  // WMO Weather interpretation codes
  switch (code) {
    case 0:
      return {
        label: "Clear Sky",
        icon: "sun",
        colorClass: "text-amber-500",
        gradientFrom: "from-amber-400",
        gradientTo: "to-orange-500",
        tileBg: "bg-amber-600",
      };
    case 1:
    case 2:
    case 3:
      return {
        label: "Partly Cloudy",
        icon: "cloud-sun",
        colorClass: "text-sky-400",
        gradientFrom: "from-sky-450",
        gradientTo: "to-gray-400",
        tileBg: "bg-slate-600",
      };
    case 45:
    case 48:
      return {
        label: "Foggy Conditions",
        icon: "cloud-fog",
        colorClass: "text-teal-400",
        gradientFrom: "from-slate-400",
        gradientTo: "to-teal-600",
        tileBg: "bg-teal-700",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Light Drizzle",
        icon: "cloud-drizzle",
        colorClass: "text-sky-300",
        gradientFrom: "from-blue-400",
        gradientTo: "to-slate-500",
        tileBg: "bg-blue-700",
      };
    case 61:
    case 63:
    case 65:
      return {
        label: "Heavy Rain",
        icon: "cloud-rain",
        colorClass: "text-blue-500",
        gradientFrom: "from-blue-650",
        gradientTo: "to-slate-750",
        tileBg: "bg-blue-900",
      };
    case 71:
    case 73:
    case 75:
      return {
        label: "Snowfall",
        icon: "snowflake",
        colorClass: "text-indigo-200",
        gradientFrom: "from-[#e3f2fd]",
        gradientTo: "to-indigo-300",
        tileBg: "bg-indigo-600",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Passing Showers",
        icon: "cloud-drizzle",
        colorClass: "text-cyan-400",
        gradientFrom: "from-cyan-400",
        gradientTo: "to-blue-600",
        tileBg: "bg-cyan-850",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm warning",
        icon: "cloud-lightning",
        colorClass: "text-purple-500",
        gradientFrom: "from-purple-800",
        gradientTo: "to-[#ef5350]",
        tileBg: "bg-purple-900",
      };
    default:
      return {
        label: "Atmospheric Variance",
        icon: "help-circle",
        colorClass: "text-gray-400",
        gradientFrom: "from-slate-400",
        gradientTo: "to-gray-600",
        tileBg: "bg-slate-700",
      };
  }
}

/**
 * Formats an ISO 8601 datetime string to a localised HH:MM time string.
 *
 * @param isoStr - ISO 8601 string (e.g. "2024-06-15T14:30:00")
 * @returns Localised time string (e.g. "2:30 PM") or "--:--" on failure.
 */
export function formatLocalTime(isoStr: string | undefined): string {
  if (!isoStr) return "--:--";
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoStr;
  }
}

/**
 * Formats an ISO 8601 date string to a short localised date (e.g. "Mon, Jun 15").
 *
 * @param isoStr - ISO 8601 date string (e.g. "2024-06-15")
 * @returns Short date string or "Tomorrow" / "Forecast" on failure.
 */
export function formatLocalDateShort(isoStr: string | undefined): string {
  if (!isoStr) return "Tomorrow";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "Forecast";
  }
}
