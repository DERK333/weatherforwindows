/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LineChart, Play, Pause, RefreshCw, Layers, ShieldAlert, Navigation } from "lucide-react";
import { WeatherResponse, GeocodedLocation } from "../types";
import { formatLocalTime } from "../utils/weatherUtils";

interface TrendsViewProps {
  darkMode: boolean;
  activeLocation: GeocodedLocation | null;
  weatherData: WeatherResponse | null;
}

export default function TrendsView({ darkMode, activeLocation, weatherData }: TrendsViewProps) {
  const [isPlayingRadar, setIsPlayingRadar] = useState(true);
  const [radarFrame, setRadarFrame] = useState(0);
  const [radarIntensity, setRadarIntensity] = useState<"standard" | "storm" | "clear">("storm");

  // Spin doppler radar animation frame index
  useEffect(() => {
    if (!isPlayingRadar) return;
    const interval = setInterval(() => {
      setRadarFrame((prev) => (prev + 1) % 4);
    }, 900);
    return () => clearInterval(interval);
  }, [isPlayingRadar]);

  if (!weatherData || !activeLocation) return null;

  const { weather } = weatherData;
  const hours = weather.hourly.time.slice(0, 12); // Map first 12 hours for cleaner visual chart spacing
  const temps = weather.hourly.temperature_2m.slice(0, 12);
  const rainProb = weather.hourly.precipitation_probability.slice(0, 12);

  // SVG dimensions
  const chartHeight = 150;
  const chartWidth = 500;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 24;

  const minTemp = Math.min(...temps) - 1;
  const maxTemp = Math.max(...temps) + 1;
  const tempRange = maxTemp - minTemp;

  // Calculate coordinates for SVG lines
  const points = temps.map((t, idx) => {
    const x = paddingLeft + (idx / (temps.length - 1)) * (chartWidth - paddingLeft - paddingRight);
    // Inverse coordinate in SVG: higher value is lower down
    const y = paddingTop + (1 - (t - minTemp) / tempRange) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, temp: t };
  });

  // Create bezier curve syntax from nodes
  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  return (
    <div className="p-5 flex-1 overflow-y-auto space-y-6">
      
      {/* Title block */}
      <div>
        <span className="text-[10px] font-mono tracking-wider uppercase text-gray-400">Meteorological Analytics Suite</span>
        <h1 className="text-xl font-bold">Hourly Dynamic Trends & Interactive Radar</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Bezier Temp chart card */}
        <section className={`p-4 rounded-2xl shadow-fluent border col-span-1 lg:col-span-2 flex flex-col justify-between ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        }`}>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
              <LineChart size={14} className="text-[#0078d4]" />
              12-Hour Micro-Climate Temperature Curve
            </h2>
            <p className="text-[10px] opacity-75 mb-3">Analytical plot of direct physical temperature scales</p>
          </div>

          <div className="relative w-full overflow-x-auto py-2">
            {/* Smooth SVG chart */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[400px]">
              {/* horizontal guides */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                return (
                  <line
                    key={ratio}
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Bezier Area Fill */}
              {points.length > 0 && (
                <path
                  d={`${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`}
                  fill="url(#tempGradient)"
                  opacity="0.1"
                />
              )}

              {/* Definition gradient definitions */}
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0078d4" />
                  <stop offset="100%" stopColor="#0078d4" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Bezier Line outline */}
              <path d={linePath} fill="none" stroke="#0078d4" strokeWidth="2.5" strokeLinecap="round" />

              {/* Data Node Points & labels */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={3.5}
                    fill={darkMode ? "#1e1e1e" : "#ffffff"}
                    stroke="#0078d4"
                    strokeWidth="2"
                    className="cursor-pointer transition-transform hover:scale-130"
                  />
                  {/* Temp values aligned on top of dots */}
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="font-mono text-[9px] font-bold"
                    fill={darkMode ? "#e0e0e0" : "#303030"}
                  >
                    {Math.round(pt.temp)}°
                  </text>
                  {/* Hour indexes aligned on grid bottom */}
                  <text
                    x={pt.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[8.5px] opacity-60"
                    fill={darkMode ? "#a0a0a0" : "#505050"}
                  >
                    {formatLocalTime(hours[idx])}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-500/10 text-[9px] text-gray-400">
            <span>Minimum index: {Math.round(minTemp)}°C</span>
            <span>Scale reference: Metric Celsius</span>
            <span>Maximum index: {Math.round(maxTemp)}°C</span>
          </div>
        </section>

        {/* Rain Probability block */}
        <section className={`p-4 rounded-2xl shadow-fluent border col-span-1 flex flex-col justify-between ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        }`}>
          <div>
            <span className="text-[10px] font-mono tracking-wider text-gray-400">CONDENSATION METRICS</span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Precipitation Chance (%)</h2>
          </div>

          <div className="my-4 h-32 flex items-end justify-between px-1 border-b border-slate-500/10 pb-1">
            {rainProb.map((p, idx) => {
              const h = Math.max((p / 100) * 110, 4); // Min 4px height so bar appears visible
              return (
                <div key={idx} className="flex flex-col items-center flex-1 mx-1 group">
                  <span className="text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                    {p}%
                  </span>
                  <div
                    style={{ height: `${h}px` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      p > 50
                        ? "bg-[#0078d4] hover:bg-[#006cc0]"
                        : p > 20
                        ? "bg-sky-400 hover:bg-sky-500"
                        : "bg-slate-550 dark:bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                  <span className="text-[8px] mt-1.5 text-gray-400 font-mono text-center">
                    {formatLocalTime(hours[idx])}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#0078d4]" />
            <span>Heavy rain threshold: &gt; 50% risk</span>
          </div>
        </section>

        {/* MOCK DOPPLER RADAR SCREEN */}
        <section className={`p-5 rounded-2xl shadow-fluent border col-span-1 lg:col-span-3 ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0078d4] flex items-center gap-1.5">
                <Play className="text-[#0078d4] fill-[#0078d4]" size={12} />
                Dynamic Doppler Radar Simulation
              </h2>
              <p className="text-[10px] text-gray-450 dark:text-gray-400 mt-0.5">Simulated atmospheric radar sweep for {activeLocation.name}</p>
            </div>

            {/* Radar Controls */}
            <div className={`p-1 rounded-sm text-[10px] flex items-center gap-2 ${darkMode ? "bg-[#292929]" : "bg-[#f0f0f0]"}`}>
              <button
                onClick={() => setIsPlayingRadar(!isPlayingRadar)}
                className={`px-3 py-1 rounded-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  isPlayingRadar ? "bg-[#0078d4] text-white" : "hover:bg-slate-500/10"
                }`}
              >
                {isPlayingRadar ? <Pause size={10} /> : <Play size={10} />}
                <span>{isPlayingRadar ? "Scanning loop" : "Pause radar"}</span>
              </button>

              <div className="flex gap-1">
                {(["standard", "storm", "clear"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRadarIntensity(mode)}
                    className={`px-2 py-1 rounded-sm capitalize ${
                      radarIntensity === mode
                        ? darkMode
                          ? "bg-[#3a3a3a] text-white font-bold"
                          : "bg-white text-gray-900 shadow-sm font-bold"
                        : "text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive sweep grid layout */}
          <div className="relative h-64 rounded-sm bg-black border border-green-500/10 overflow-hidden flex items-center justify-center">
            
            {/* Matrix radar overlay screen background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,120,212,0.1)_1px,transparent_1px)] bg-[size:16px_16px] opacity-35" />

            {/* Classic sweeping vertical line */}
            {isPlayingRadar && (
              <div className="absolute inset-y-0 w-[3px] bg-[#0078d4] shadow-[0_0_15px_#0078d4] right-1/2 animate-sweep pointer-events-none" style={{
                animation: "sweep 4s linear infinite"
              }} />
            )}

            {/* Simulated doppler clouds */}
            <div className="absolute inset-0 p-4 font-mono flex items-center justify-center">
              
              {/* Radar cell 1 */}
              {radarIntensity !== "clear" && (
                <div
                  className={`absolute w-32 h-32 rounded-full filter blur-xl opacity-35 mix-blend-screen transition-all duration-700 ${
                    radarIntensity === "storm" ? "bg-red-500 scale-120" : "bg-emerald-500"
                  }`}
                  style={{
                    top: radarFrame === 0 ? "10%" : radarFrame === 1 ? "22%" : radarFrame === 2 ? "15%" : "8%",
                    left: radarFrame === 0 ? "30%" : radarFrame === 1 ? "28%" : radarFrame === 2 ? "35%" : "32%"
                  }}
                />
              )}

              {/* Radar cell 2 (rain cell) */}
              {radarIntensity === "storm" && (
                <div
                  className="absolute w-24 h-24 rounded-full bg-yellow-500 filter blur-xl opacity-40 mix-blend-screen transition-all duration-700"
                  style={{
                    bottom: radarFrame === 0 ? "25%" : radarFrame === 1 ? "18%" : radarFrame === 2 ? "30%" : "22%",
                    right: radarFrame === 0 ? "20%" : radarFrame === 1 ? "30%" : radarFrame === 2 ? "12%" : "25%"
                  }}
                />
              )}

              {/* Radar cell 3 (cold front indicator) */}
              {radarIntensity === "storm" && (
                <div className="absolute bottom-8 left-1/4 border-b border-sky-400 border-dashed text-[10px] text-sky-400 py-1 px-3 flex items-center gap-1.5 bg-black/60 backdrop-blur rounded">
                  <ShieldAlert size={12} className="animate-bounce" /> Warning: Approaching Cold Front index
                </div>
              )}

              {/* Radial Sweep circular rings */}
              <div className="absolute w-60 h-60 border border-[#0078d4]/10 rounded-full flex items-center justify-center">
                <div className="w-40 h-40 border border-[#0078d4]/15 rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 border border-[#0078d4]/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#0078d4] rounded-full animate-ping" />
                  </div>
                </div>
              </div>

              {/* Angle scale coordinate tags */}
              <span className="absolute top-2 text-[9px] text-[#0078d4]/40">NORTH 0°</span>
              <span className="absolute right-2 text-[9px] text-[#0078d4]/40">EAST 90°</span>
              <span className="absolute bottom-2 text-[9px] text-[#0078d4]/40">SOUTH 180°</span>
              <span className="absolute left-2 text-[9px] text-[#0078d4]/40">WEST 270°</span>

              {/* Dynamic Coordinate point flag */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="flex items-center gap-1 bg-black/75 px-1.5 py-0.5 rounded text-[8.5px] text-green-400 border border-green-500/20 font-bold">
                  <Navigation size={8} className="rotate-45" />
                  <span>STATION METRO COORDS</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick legal stats */}
          <div className="flex justify-between items-center text-[9.5px] text-gray-400 mt-3">
            <span>Radar Sweep: WSR-88D Doppler technology</span>
            <span>Reflectivity: DBZ scale standard calibration</span>
            <span>Update Rate: Real-time 900ms scan sweep</span>
          </div>
        </section>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes sweep {
            from {
              transform: rotate(0deg) translateX(120px) rotate(0deg);
            }
            to {
              transform: rotate(360deg) translateX(120px) rotate(-360deg);
            }
          }
          .animate-spin-lazy {
            animation: spin 20s linear infinite;
          }
        `
      }} />

    </div>
  );
}
