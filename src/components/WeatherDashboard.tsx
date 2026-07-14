/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
  Compass,
  Gauge,
  HelpCircle,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  Sliders,
  AppWindow,
  Download,
  Terminal,
} from "lucide-react";
import { WeatherResponse, GeocodedLocation, LiveTileState } from "../types";
import { getWeatherCondition, formatLocalTime, formatLocalDateShort } from "../utils/weatherUtils";
import WeatherMap from "./WeatherMap";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeatherDashboardProps {
  darkMode: boolean;
  activeLocation: GeocodedLocation | null;
  weatherData: WeatherResponse | null;
  onTriggerToast: (title: string, message: string, type: "info" | "warning" | "success") => void;
}

export default function WeatherDashboard({
  darkMode,
  activeLocation,
  weatherData,
  onTriggerToast,
}: WeatherDashboardProps) {
  const [activePivot, setActivePivot] = useState<"summary" | "details" | "tile">("summary");
  
  // Simulated Tile State
  const [tileState, setTileState] = useState<LiveTileState>({
    size: "wide",
    theme: "blue",
    showTemp: true,
    showIcon: true,
    pulseAnimation: true,
  });

  if (!weatherData || !activeLocation) {
    return (
      <div className={`p-8 text-center flex-1 flex flex-col items-center justify-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        <div className="w-16 h-16 rounded-full bg-[#0078d4]/10 text-[#0078d4] flex items-center justify-center animate-bounce mb-4">
          <Sliders size={32} />
        </div>
        <h2 className="text-lg font-semibold mb-2">No Active Location</h2>
        <p className="max-w-md text-xs opacity-75 mb-4">
          Search for your city above (e.g. Seattle, Zurich, Sydney) or click on Settings below to start tracking live weather packages.
        </p>
      </div>
    );
  }

  const { weather, briefing } = weatherData;
  const current = weather.current;
  const daily = weather.daily;
  const hourly = weather.hourly;

  const currentCondition = getWeatherCondition(current.weather_code);

  const hourlyChartData = hourly.time.slice(0, 24).map((timeStr, idx) => ({
    time: formatLocalTime(timeStr),
    temp: Math.round(hourly.temperature_2m[idx]),
    precip: hourly.precipitation_probability[idx],
  }));

  // Dynamic icon helper to return the matching React component safely
  const renderConditionIcon = (iconName: string, size: number = 24) => {
    switch (iconName) {
      case "sun":
        return <Sun size={size} className="text-amber-500 animate-spin-lazy" />;
      case "cloud-sun":
        return <CloudSun size={size} className="text-sky-400" />;
      case "cloud":
        return <Cloud size={size} className="text-gray-400" />;
      case "cloud-fog":
        return <CloudFog size={size} className="text-teal-400" />;
      case "cloud-drizzle":
        return <CloudDrizzle size={size} className="text-sky-300" />;
      case "cloud-rain":
        return <CloudRain size={size} className="text-blue-500" />;
      case "snowflake":
        return <Snowflake size={size} className="text-indigo-200 animate-pulse" />;
      case "cloud-lightning":
        return <CloudLightning size={size} className="text-purple-500 animate-bounce" />;
      default:
        return <HelpCircle size={size} className="text-gray-400" />;
    }
  };

  // Live Tile Action trigger
  const handlePinTile = () => {
    onTriggerToast(
      "Live Tile Pinned",
      `Dynamic weather updates for ${activeLocation.name} added to your mock Windows Start Menu!`,
      "success"
    );
  };

  return (
    <div className="p-5 flex-1 overflow-y-auto space-y-6">
      
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
            Current Station Outlook
          </span>
          <h1 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2">
            <span>{activeLocation.name}</span>
            <span className="text-sm font-normal text-gray-400">
              {activeLocation.admin1 ? `${activeLocation.admin1}, ` : ""}{activeLocation.country}
            </span>
          </h1>
        </div>

        {/* Pivot Tabs styled like Windows 11 Fluent tabs */}
        <div className={`p-0.5 rounded-sm flex gap-1 ${darkMode ? "bg-[#333333]" : "bg-[#ebebeb]"}`}>
          <button
            onClick={() => setActivePivot("summary")}
            className={`px-3 py-1 text-xs rounded-sm transition-all focus:outline-none ${
              activePivot === "summary"
                ? darkMode
                  ? "bg-[#202020] text-[#60cdff] font-medium shadow-sm"
                  : "bg-white text-[#0060b0] font-semibold shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePivot("details")}
            className={`px-3 py-1 text-xs rounded-sm transition-all focus:outline-none ${
              activePivot === "details"
                ? darkMode
                  ? "bg-[#202020] text-[#60cdff] font-medium shadow-sm"
                  : "bg-white text-[#0060b0] font-semibold shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Analytical Specs
          </button>
          <button
            onClick={() => setActivePivot("tile")}
            className={`px-3 py-1 text-xs rounded-sm transition-all focus:outline-none flex items-center gap-1.5 ${
              activePivot === "tile"
                ? darkMode
                  ? "bg-[#202020] text-[#60cdff] font-medium shadow-sm"
                  : "bg-white text-[#0060b0] font-semibold shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <AppWindow size={12} />
            Live Tiles
          </button>
        </div>
      </div>

      {/* METEOROLOGICAL BLOCKS IN OVERVIEW TAB */}
      {activePivot === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Major Weather Card (Acrylic Material styled backdrop) */}
          <section
            id="current-conditions-uwp"
            className={`p-6 rounded-2xl shadow-fluent flex flex-col justify-between transition-all min-h-[300px] relative overflow-hidden backdrop-blur-3xl ${
              darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
            } border`}
          >
            {/* Visual gradient orb in background simulating solar conditions */}
            <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${currentCondition.gradientFrom} ${currentCondition.gradientTo}`} />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-gray-450 opacity-80">
                  Live Conditions
                </span>
                <p className="text-xs font-semibold mt-1 flex items-center gap-1">
                  <span>{currentCondition.label}</span>
                  {current.is_day ? (
                    <span className="text-[9px] bg-amber-550/10 text-amber-500 px-1 py-0.2 rounded-sm border border-amber-500/20">Daytime</span>
                  ) : (
                    <span className="text-[9px] bg-indigo-550/10 text-indigo-400 px-1 py-0.2 rounded-sm border border-indigo-505/20">Night</span>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-full bg-slate-500/5 backdrop-blur">
                {renderConditionIcon(currentCondition.icon, 36)}
              </div>
            </div>

            {/* Giant Temp Display */}
            <div className="my-6">
              <div className="flex items-start">
                <span className="text-6xl font-extrabold tracking-tight font-sans">
                  {Math.round(current.temperature_2m)}
                </span>
                <span className="text-2xl font-semibold mt-1">°C</span>
              </div>
              <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-0.5">
                  RealFeel: <strong className="text-gray-300 dark:text-gray-150">{Math.round(current.apparent_temperature)}°C</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  Pressure: <strong className="text-gray-300 dark:text-gray-150">{Math.round(current.pressure_msl)} hPa</strong>
                </span>
              </div>
            </div>

            {/* Micro details row */}
            <div className={`pt-4 border-t ${darkMode ? "border-[#3d3d3d]" : "border-[#e9e9e9]"} grid grid-cols-2 gap-4 text-xs`}>
              <div className="flex items-center gap-2">
                <Wind size={15} className="text-cyan-400" />
                <div>
                  <div className="text-gray-400 text-[10px]">WIND SPEED</div>
                  <div className="font-semibold">{current.wind_speed_10m} km/h</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={15} className="text-[#0078d4]" />
                <div>
                  <div className="text-gray-400 text-[10px]">HUMIDITY</div>
                  <div className="font-semibold">{current.relative_humidity_2m}%</div>
                </div>
              </div>
            </div>
          </section>

          {/* MIDDLE: Gemini TWC Broadcast Briefing (Smart Meteorological digest) */}
          <section
            id="twc-brief-card"
            className={`p-6 rounded-2xl shadow-fluent flex flex-col justify-between transition-all min-h-[300px] border border-dashed ${
              darkMode ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-[#202020]"
            } relative overflow-hidden lg:col-span-2`}
          >
            {/* Visual Header */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0078d4] animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0078d4]">
                    The Weather Channel Broadcast Briefing
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">Grounded Search Index</span>
              </div>

              {/* Generated text area */}
              <div className="mt-4 text-xs leading-relaxed space-y-3 font-sans">
                {briefing ? (
                  <p className="whitespace-pre-line text-gray-300 dark:text-gray-150 py-1 font-sans">
                    {briefing}
                  </p>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    Smart outlook generated briefing could not load. Configure a correct GEMINI_API_KEY in the Secrets menu to unleash live grounded search outlooks.
                  </div>
                )}
              </div>
            </div>

            {/* Quick status bar */}
            <div className={`mt-4 pt-3 border-t flex justify-between items-center text-[10px] text-gray-400 ${darkMode ? "border-[#333333]" : "border-[#dedede]"}`}>
              <div className="flex items-center gap-1.5">
                <Info size={11} className="text-[#0078d4]" />
                <span>Synchronized with Microsoft Store weather packet v3.2</span>
              </div>
              <span>Live cache active</span>
            </div>
          </section>

          {/* INTERACTIVE GEOGRAPHIC RADAR & PRECIPITATION MAP */}
          <div className="lg:col-span-3">
            <WeatherMap
              darkMode={darkMode}
              activeLocation={activeLocation}
              weatherData={weatherData}
              onTriggerToast={onTriggerToast}
            />
          </div>

          {/* HORIZONTAL HOURLY TRACK (24h outlook widget block) */}
          <section
            id="hourly-row-section"
            className={`p-5 rounded-2xl shadow-fluent flex flex-col justify-between transition-all border lg:col-span-3 ${
              darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                24-Hour Horizontal Timeline
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                Interval: Local Timezone ({weather.timezone_abbreviation})
              </span>
            </div>

            {/* Horizontal Scroll list */}
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1">
              {hourly.time.slice(0, 24).map((timeStr, idx) => {
                const hourTemp = hourly.temperature_2m[idx];
                const hourCode = hourly.weather_code[idx];
                const cond = getWeatherCondition(hourCode);
                const prob = hourly.precipitation_probability[idx];
                const isCurrent = idx === 0;

                return (
                  <div
                    key={timeStr}
                    className={`flex flex-col items-center justify-between p-3 rounded-sm min-w-[76px] transition-all duration-150 border relative ${
                      isCurrent
                        ? darkMode
                          ? "bg-[#333333] border-[#0078d4] shadow-md"
                          : "bg-blue-50 border-[#0078d4]/60 shadow-md"
                        : darkMode
                        ? "bg-[#242424] border-[#2e2e2e] hover:border-[#3e3e3e]"
                        : "bg-[#f9f9f9] border-[#e9e9e9] hover:border-[#cbcbcb]"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2 px-1 text-[8px] font-bold bg-[#0078d4] text-white rounded-full uppercase">
                        Now
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-gray-400">
                      {formatLocalTime(timeStr)}
                    </span>
                    <div className="my-2.5">
                      {renderConditionIcon(cond.icon, 20)}
                    </div>
                    <span className="text-xs font-bold font-mono">
                      {Math.round(hourTemp)}°C
                    </span>
                    
                    {/* Precip chance */}
                    <span className={`text-[8.5px] mt-1 font-medium ${prob > 40 ? "text-sky-400 font-semibold" : "text-gray-550 opacity-60"}`}>
                      ☔ {prob}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* INTERACTIVE TEMPERATURE TREND GRAPH */}
          <section
            id="hourly-trend-graph"
            className={`p-5 rounded-2xl shadow-fluent flex flex-col transition-all border lg:col-span-3 ${
              darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#0078d4]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Hourly Temperature Trend
                </span>
              </div>
            </div>
            <div className="h-[220px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0078d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: darkMode ? '#888' : '#888' }} 
                    dy={10}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: darkMode ? '#888' : '#888' }} 
                    dx={-10}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `${val}°`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1e1f22' : '#ffffff', 
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }} 
                    itemStyle={{ color: '#0078d4', fontWeight: 'bold' }}
                    labelStyle={{ color: darkMode ? '#a0a0a0' : '#6b7280', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value}°C`, 'Temperature']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#0078d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#tempGradient)" 
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#0078d4' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* EXTENDED SEVEN-DAY FORECAST GRID */}
          <section
            id="weekly-extended-outlook"
            className={`p-5 rounded-2xl shadow-fluent flex flex-col transition-all border lg:col-span-3 ${
              darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Extended 7-Day Forecast Grid
              </span>
              <span className="text-[10px] text-gray-400">Includes solar and precipitation outlooks</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {daily.time.map((dayStr, idx) => {
                const cond = getWeatherCondition(daily.weather_code[idx]);
                const maxT = daily.temperature_2m_max[idx];
                const minT = daily.temperature_2m_min[idx];
                const precipProb = daily.precipitation_probability_max[idx];
                const isToday = idx === 0;

                return (
                  <div
                    key={dayStr}
                    className={`p-3.5 rounded-sm border flex flex-col justify-between items-center transition-all ${
                      isToday
                        ? darkMode
                          ? "bg-[#333333] border-[#0078d4]/75 shadow"
                          : "bg-[#f5f9ff] border-[#0078d4]/50 shadow"
                        : darkMode
                        ? "bg-[#242424] border-[#2e2e2e] hover:bg-[#282828]"
                        : "bg-[#fdfdfd] border-[#ebebe] hover:bg-[#f6f6f6]"
                    }`}
                  >
                    <span className="text-[10.5px] font-bold text-center truncate w-full">
                      {isToday ? "Today" : formatLocalDateShort(dayStr)}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5 truncate max-w-full font-mono">
                      {dayStr}
                    </span>

                    <div className="my-3 flex items-center justify-center">
                      {renderConditionIcon(cond.icon, 24)}
                    </div>

                    <div className="w-full text-center space-y-1">
                      <div className="text-xs font-medium max-w-full truncate text-gray-400 leading-tight">
                        {cond.label}
                      </div>
                      
                      {/* High/Low bar */}
                      <div className="flex justify-center items-center gap-2 mt-1.5 font-mono text-xs">
                        <span className="font-extrabold text-white dark:text-gray-100">{Math.round(maxT)}°</span>
                        <span className="text-gray-500 font-medium">{Math.round(minT)}°</span>
                      </div>

                      {/* Rain maximum prob */}
                      <div className={`text-[9px] mt-1 ${precipProb > 30 ? "text-blue-400" : "text-gray-500 opacity-60"}`}>
                        💧 {precipProb}% max
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* METEOROLOGICAL BLOCKS IN ANALYTICAL SPECS TAB */}
      {activePivot === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Air Pressure & UV metrics widget */}
          <div className={`p-5 rounded-2xl shadow-fluent border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
            <span className="text-[10px] font-mono uppercase text-[#0078d4] font-semibold">Sunlight & Radiation Index</span>
            <div className="flex items-center gap-3 mt-4">
              <Sun className="text-orange-400 animate-spin-lazy" size={32} />
              <div>
                <div className="text-gray-400 text-[10px]">ULTRAVIOLET RATING</div>
                <div className="text-xl font-bold">{current.uv_index.toFixed(1)} UV</div>
                <div className="text-[10px] text-orange-400 font-semibold mt-0.5">
                  {current.uv_index <= 2 ? "Safe low exposure" : current.uv_index <= 5 ? "Moderate risk" : "High (Sunscreen recommended)"}
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-500/10 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Peak Daily Max:</span>
                <span className="font-bold">{daily.uv_index_max[0]} UV max</span>
              </div>
            </div>
          </div>

          {/* Wind Speed and Direction Dial block */}
          <div className={`p-5 rounded-2xl shadow-fluent border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
            <span className="text-[10px] font-mono uppercase text-[#0078d4] font-semibold">Anemometer & Wind Dial</span>
            <div className="flex items-center gap-3 mt-4">
              <Compass className="text-cyan-400 rotate-12" size={32} />
              <div>
                <div className="text-gray-400 text-[10px]">CURRENT VECTOR</div>
                <div className="text-xl font-bold">{current.wind_speed_10m} km/h</div>
                <div className="text-[10px] text-cyan-400 font-medium">Bearing angle: {current.wind_direction_10m}°</div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-500/10 text-xs text-gray-300 dark:text-gray-400 flex justify-between items-center">
              <span>Standard MS forecast scale</span>
              <span className="text-[10px] font-mono">10m Altitude</span>
            </div>
          </div>

          {/* Atmospheric pressure density widget */}
          <div className={`p-5 rounded-2xl shadow-fluent border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
            <span className="text-[10px] font-mono uppercase text-[#0078d4] font-semibold">Barometric Pressure Dynamics</span>
            <div className="flex items-center gap-3 mt-4">
              <Gauge className="text-teal-400" size={32} />
              <div>
                <div className="text-gray-400 text-[10px]">SEA LEVEL READING</div>
                <div className="text-xl font-bold">{current.pressure_msl} hPa</div>
                <div className="text-[10px] text-green-400 font-medium mt-0.5">Atmosphere density stable</div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-500/10 text-xs flex justify-between">
              <span className="text-gray-400">Relative status:</span>
              <span className="font-semibold text-green-400">Normal</span>
            </div>
          </div>

          {/* Solar Daylight intervals */}
          <div className={`p-5 rounded-2xl shadow-fluent border ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
            <span className="text-[10px] font-mono uppercase text-[#0078d4] font-semibold">Daylight Solar Cycle</span>
            <div className="my-3 space-y-2 text-xs">
              <div className="flex justify-between items-center p-1.5 rounded-sm bg-slate-500/5">
                <span className="text-amber-400 font-semibold flex items-center gap-1">🌅 Sunrise:</span>
                <span className="font-mono font-bold">{formatLocalTime(daily.sunrise[0])}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 rounded-sm bg-slate-500/5">
                <span className="text-indigo-400 font-semibold flex items-center gap-1">🌆 Sunset:</span>
                <span className="font-mono font-bold">{formatLocalTime(daily.sunset[0])}</span>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 text-center">Solar coordinates automatically configured for timezone</div>
          </div>

          <section className={`p-5 rounded-2xl shadow-fluent border md:col-span-2 lg:col-span-4 ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
            <span className="text-xs uppercase font-mono tracking-wider text-gray-400 block mb-2">Technical Geolocation Coordinates</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-sm bg-slate-500/5">
                <span className="text-gray-400">Latitude:</span>
                <p className="font-bold">{weather.latitude}° N</p>
              </div>
              <div className="p-2.5 rounded-sm bg-slate-500/5">
                <span className="text-gray-400">Longitude:</span>
                <p className="font-bold">{weather.longitude}° E</p>
              </div>
              <div className="p-2.5 rounded-sm bg-slate-500/5">
                <span className="text-gray-400">Elevation:</span>
                <p className="font-bold">{weather.elevation} meters</p>
              </div>
              <div className="p-2.5 rounded-sm bg-slate-500/5">
                <span className="text-gray-400">Compute Speed:</span>
                <p className="font-bold">{weather.generationtime_ms.toFixed(2)} ms</p>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* WINDOWS LIVE TILE SIMULATOR TAB */}
      {activePivot === "tile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SIMULATOR CARD SETTINGS */}
          <section className={`p-5 rounded-2xl shadow-fluent border lg:col-span-1 ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-4">
              Live Tile Customizer Panel
            </span>

            <div className="space-y-4 text-xs">
              {/* Size selector */}
              <div>
                <label className="text-[10.5px] font-semibold text-gray-400 block mb-2">Tile Dimension Group</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["small", "medium", "wide", "large"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setTileState({ ...tileState, size: sz })}
                      className={`py-1.5 rounded-sm font-semibold capitalize border transition-all ${
                        tileState.size === sz
                          ? "bg-[#0078d4] text-white border-[#0078d4]"
                          : darkMode
                          ? "bg-[#333333] border-[#3e3e3e] hover:bg-[#3d3d3d]"
                          : "bg-[#f5f5f5] border-[#dfdfdf] hover:bg-[#eaeaea]"
                      }`}
                    >
                      {sz} Code
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme/Accent Selector */}
              <div>
                <label className="text-[10.5px] font-semibold text-gray-400 block mb-2">Accent Backplate Theme</label>
                <div className="flex gap-2">
                  {(["blue", "dark", "teal", "purple", "crimson"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTileState({ ...tileState, theme: t })}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-110 ${
                        t === "blue" ? "bg-blue-600 border-blue-400" :
                        t === "dark" ? "bg-slate-800 border-slate-600" :
                        t === "teal" ? "bg-teal-600 border-teal-400" :
                        t === "purple" ? "bg-purple-600 border-purple-400" :
                        "bg-red-700 border-red-500"
                      }`}
                      title={`${t} theme`}
                    >
                      {tileState.theme === t && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle controls */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tileState.showTemp}
                    onChange={(e) => setTileState({ ...tileState, showTemp: e.target.checked })}
                    className="accent-[#0078d4]"
                  />
                  <span>Render Temperature Values</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tileState.showIcon}
                    onChange={(e) => setTileState({ ...tileState, showIcon: e.target.checked })}
                    className="accent-[#0078d4]"
                  />
                  <span>Render Weather Condition Icons</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tileState.pulseAnimation}
                    onChange={(e) => setTileState({ ...tileState, pulseAnimation: e.target.checked })}
                    className="accent-[#0078d4]"
                  />
                  <span>Allow dynamic transition pulsation</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handlePinTile}
                  className="w-full text-xs font-semibold h-9 bg-[#0078d4] text-white flex items-center justify-center gap-1.5 rounded-sm hover:bg-[#006cc0] shadow active:scale-98 transition-all"
                >
                  <Download size={14} /> Pin to Mock Windows Start
                </button>
              </div>
            </div>
          </section>

          {/* SIMULATED WINDOWS START MENU SCREEN */}
          <section className="lg:col-span-2 space-y-4">
            <div className={`p-5 rounded-2xl border text-xs justify-between flex flex-col ${darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"}`}>
              <div>
                <h3 className="font-bold text-xs uppercase text-gray-400 mb-1">Simulated Start Menu live-preview</h3>
                <p className="text-[10.5px] opacity-75 mb-4">See how the Live Tile matches Microsoft Store layout guidelines.</p>
              </div>

              {/* THE SHAPING OF TILE */}
              <div className="p-8 flex items-center justify-center bg-[#0d0d0d] rounded-sm relative overflow-hidden h-60">
                
                {/* Simulated start background mesh lines */}
                <div className="absolute inset-0 bg-radial-at-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />

                {/* THE MOCK PINNED TILE */}
                <div
                  className={`relative select-none border transition-all shadow-lg rounded-sm ${
                    tileState.theme === "blue" ? currentCondition.tileBg :
                    tileState.theme === "dark" ? "bg-zinc-800 border-zinc-700" :
                    tileState.theme === "teal" ? "bg-teal-800 border-teal-700" :
                    tileState.theme === "purple" ? "bg-purple-800 border-purple-700" :
                    "bg-red-900 border-red-800"
                  } ${
                    tileState.size === "small" ? "w-20 h-20 p-2 text-center flex flex-col items-center justify-center" :
                    tileState.size === "medium" ? "w-40 h-40 p-4 flex flex-col justify-between" :
                    tileState.size === "wide" ? "w-80 h-40 p-4 flex flex-col justify-between" :
                    "w-80 h-80 p-5 flex flex-col justify-between" // Large tile
                  } ${tileState.pulseAnimation ? "animate-pulse" : ""}`}
                >
                  {/* Small design */}
                  {tileState.size === "small" && (
                    <div className="flex flex-col items-center text-white">
                      {tileState.showIcon && renderConditionIcon(currentCondition.icon, 20)}
                      {tileState.showTemp && <div className="text-sm font-bold font-mono mt-1">{Math.round(current.temperature_2m)}°</div>}
                    </div>
                  )}

                  {/* Medium design */}
                  {tileState.size === "medium" && (
                    <div className="flex flex-col h-full justify-between text-white text-[11px]">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-gray-300 font-bold">WEATHER</span>
                        {tileState.showIcon && renderConditionIcon(currentCondition.icon, 22)}
                      </div>
                      <div>
                        {tileState.showTemp && <p className="text-3xl font-extrabold font-mono leading-none">{Math.round(current.temperature_2m)}°C</p>}
                        <p className="font-semibold text-gray-350 tracking-tight mt-1 truncate">{activeLocation.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Wide design */}
                  {tileState.size === "wide" && (
                    <div className="flex flex-col h-full justify-between text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono tracking-wider uppercase text-gray-300 font-semibold">TWC Live Updates</span>
                          <h4 className="text-sm font-bold leading-tight mt-0.5">{activeLocation.name}</h4>
                          <p className="text-[10.5px] text-gray-300">{currentCondition.label}</p>
                        </div>
                        {tileState.showIcon && renderConditionIcon(currentCondition.icon, 32)}
                      </div>
                      
                      <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[11px]">
                        <div>
                          {tileState.showTemp && <span className="text-2xl font-extrabold font-mono">{Math.round(current.temperature_2m)}°C</span>}
                          <span className="text-gray-300 ml-1.5 text-[9.5px]">Apparent: {Math.round(current.apparent_temperature)}°</span>
                        </div>
                        <div className="text-right text-[10px] text-gray-400">
                          ☔ Rain: {hourly.precipitation_probability[0]}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Large design */}
                  {tileState.size === "large" && (
                    <div className="flex flex-col h-full justify-between text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-gray-300">Start Board Station</span>
                          <h4 className="text-lg font-extrabold mt-0.5">{activeLocation.name}</h4>
                          <span className="text-xs text-gray-300">{activeLocation.country} Outlook</span>
                        </div>
                        {tileState.showIcon && renderConditionIcon(currentCondition.icon, 36)}
                      </div>

                      {/* Forecast details list inside large tile */}
                      <div className="space-y-1.5 p-2 bg-black/15 rounded-sm text-[11px]">
                        <div className="flex justify-between py-0.5 border-b border-white/5">
                          <span className="text-gray-300">Humidity index:</span>
                          <span className="font-bold">{current.relative_humidity_2m}%</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-white/5">
                          <span className="text-gray-300">Anemometer wind:</span>
                          <span className="font-bold">{current.wind_speed_10m} km/h</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-300">Barometer gauge:</span>
                          <span className="font-bold">{current.pressure_msl} hPa</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/10 pt-2">
                        <div>
                          {tileState.showTemp && <span className="text-4xl font-black font-mono leading-none">{Math.round(current.temperature_2m)}°C</span>}
                        </div>
                        <div className="text-right text-[10px] text-gray-300">
                          RealFeel: {Math.round(current.apparent_temperature)}°C
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Developer Metadata section */}
              <div className="mt-4 pt-4 border-t border-slate-500/10 space-y-2">
                <div className="flex items-center gap-1.5 text-[#0078d4] font-semibold">
                  <Terminal size={14} />
                  <span>UWP Dynamic XML Schema (Package.appxmanifest Integration)</span>
                </div>
                <p className="opacity-75 text-[10.5px]">Add dynamic tiles to your binary package by saving this XML block into app templates:</p>
                <div className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[9px] rounded-sm overflow-x-auto select-all max-h-32">
                  {`<tile>
  <visual>
    <binding template="Tile${tileState.size === "wide" ? "Wide310x150" : tileState.size === "large" ? "Large310x310" : "Medium15x15"}ImageAndText01">
      <image id="1" src="Assets/WeatherActiveLogo.png"/>
      <text id="1">${activeLocation.name}</text>
      <text id="2">${Math.round(current.temperature_2m)}°C - ${currentCondition.label}</text>
    </binding>
  </visual>
</tile>`}
                </div>
              </div>

            </div>
          </section>

        </div>
      )}

    </div>
  );
}
