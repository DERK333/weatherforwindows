/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Play,
  Pause,
  Plus,
  Minus,
  Layers,
  MapPin,
  RefreshCw,
  Compass,
  Wind,
  Cloud,
  Activity,
  Maximize2,
  Sliders,
  Check,
} from "lucide-react";
import { GeocodedLocation, WeatherResponse } from "../types";

interface WeatherMapProps {
  darkMode: boolean;
  activeLocation: GeocodedLocation | null;
  weatherData: WeatherResponse | null;
  onTriggerToast: (title: string, message: string, type: "info" | "warning" | "success") => void;
}

type MapLayer = "precipitation" | "wind" | "clouds" | "pressure";

export default function WeatherMap({
  darkMode,
  activeLocation,
  weatherData,
  onTriggerToast,
}: WeatherMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLayer, setActiveLayer] = useState<MapLayer>("precipitation");
  const [zoom, setZoom] = useState(4); // Zoom scale multiplier
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Navigation offset in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [radarOpacity, setRadarOpacity] = useState(0.8);
  const [radarSpeed, setRadarSpeed] = useState(1);
  const [showCoordinateGrid, setShowCoordinateGrid] = useState(true);
  const [crosshairPos, setCrosshairPos] = useState({ x: 0, y: 0 }); // relative to canvas center

  // Weather data extraction helpers
  const tempVal = weatherData ? Math.round(weatherData.weather.current.temperature_2m) : 20;
  const windSpdVal = weatherData ? weatherData.weather.current.wind_speed_10m : 15;
  const windDirVal = weatherData ? weatherData.weather.current.wind_direction_10m : 240;
  const pressureVal = weatherData ? Math.round(weatherData.weather.current.pressure_msl) : 1013;

  const lat = activeLocation?.latitude ?? 47.6062;
  const lng = activeLocation?.longitude ?? -122.3321;
  const locationName = activeLocation?.name ?? "Seattle";

  // Compute scale: pixels per degree
  const pixelsPerDegree = useMemo(() => {
    return 30 * Math.pow(1.5, zoom);
  }, [zoom]);

  // Handle Drag-to-Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: mouseX - offset.x, y: mouseY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      setOffset({
        x: mouseX - dragStart.x,
        y: mouseY - dragStart.y,
      });
    }

    // Capture crosshair coordinates
    setCrosshairPos({
      x: mouseX - canvas.width / 2,
      y: mouseY - canvas.height / 2,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetNavigation = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(4);
    onTriggerToast("Map Recentered", "Position reset back to selected station query coordinates.", "info");
  };

  // Compute calculated coordinate at center or crosshair
  const crosshairCoords = useMemo(() => {
    // Offset in degrees
    const degX = (crosshairPos.x - offset.x) / pixelsPerDegree;
    const degY = (crosshairPos.y - offset.y) / pixelsPerDegree;

    // Standard Mercator-like map coordinates project shift
    const currentLat = lat - degY;
    const currentLng = lng + degX;

    // Calculate simulated telemetry values at crosshair coordinates using trig waves
    const distanceToLoc = Math.sqrt(degX * degX + degY * degY);
    
    // Simulate telemetry
    const simulatedTemp = tempVal - Math.round(degY * 0.8) + Math.sin(currentLng * 0.5) * 2;
    const simulatedPressure = pressureVal + Math.round(degY * 0.5 + degX * 0.3) + Math.round(Math.cos(distanceToLoc) * 4);
    const simulatedReflectivity = Math.max(
      0,
      Math.round(45 * Math.sin(currentLat * 0.8) * Math.cos(currentLng * 0.6 + distanceToLoc * 0.5))
    );

    return {
      lat: currentLat.toFixed(4),
      lng: currentLng.toFixed(4),
      temp: simulatedTemp.toFixed(1),
      pressure: Math.round(simulatedPressure),
      reflectivity: simulatedReflectivity,
    };
  }, [crosshairPos, offset, pixelsPerDegree, lat, lng, tempVal, pressureVal]);

  // Infinite main canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frameTime = 0;

    // Simulated storm cells definition (persistent across loop for deterministic rendering)
    const stormCells = [
      { rx: 1.2, ry: -0.8, size: 1.5, dbz: 55, speed: 0.05 },
      { rx: -0.8, ry: 1.4, size: 1.2, dbz: 42, speed: 0.03 },
      { rx: 2.2, ry: 2.0, size: 2.0, dbz: 62, speed: 0.04 },
      { rx: -1.6, ry: -1.8, size: 0.8, dbz: 35, speed: 0.06 },
      { rx: 0.2, ry: 0.5, size: 1.0, dbz: 48, speed: 0.02 },
    ];

    // Simulated wind tracers particles
    const particles: { x: number; y: number; life: number; maxLife: number; speed: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        life: Math.random() * 100,
        maxLife: 60 + Math.random() * 80,
        speed: 1 + Math.random() * 2,
      });
    }

    const render = () => {
      // 1. Get container dimensions
      const width = canvas.width;
      const height = canvas.height;

      // 2. Clear background with grid theme colors
      if (darkMode) {
        ctx.fillStyle = "#1e1f22";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#f6f8fa";
        ctx.fillRect(0, 0, width, height);
      }

      // Draw coordinate system offset starting from center of canvas
      const centerX = width / 2 + offset.x;
      const centerY = height / 2 + offset.y;

      // 3. Render Coordinate Grid (Parallel and Meridian lines)
      if (showCoordinateGrid) {
        ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
        ctx.lineWidth = 1;
        ctx.font = "8.5px JetBrains Mono, monospace";
        ctx.fillStyle = darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)";

        // Draw grid lines dynamically spaced based on scale
        // Spacing: decide how many degrees between lines
        let stepDegrees = 1;
        if (zoom < 2) stepDegrees = 5;
        else if (zoom < 4) stepDegrees = 2;
        else if (zoom < 6) stepDegrees = 1;
        else stepDegrees = 0.25;

        // Draw Vertical Meridians (Longitude Lines)
        const minLng = lng - width / 2 / pixelsPerDegree;
        const maxLng = lng + width / 2 / pixelsPerDegree;
        const startLngDeg = Math.floor(minLng / stepDegrees) * stepDegrees;

        for (let gLng = startLngDeg; gLng <= maxLng + stepDegrees; gLng += stepDegrees) {
          const x = centerX + (gLng - lng) * pixelsPerDegree;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();

          // Text label
          const textLabel = `${Math.abs(gLng).toFixed(2)}° ${gLng >= 0 ? "E" : "W"}`;
          ctx.fillText(textLabel, x + 4, height - 8);
        }

        // Draw Horizontal Parallels (Latitude Lines)
        const minLat = lat - height / 2 / pixelsPerDegree;
        const maxLat = lat + height / 2 / pixelsPerDegree;
        const startLatDeg = Math.floor(minLat / stepDegrees) * stepDegrees;

        for (let gLat = startLatDeg; gLat <= maxLat + stepDegrees; gLat += stepDegrees) {
          const y = centerY - (gLat - lat) * pixelsPerDegree;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();

          // Text label
          const textLabel = `${Math.abs(gLat).toFixed(2)}° ${gLat >= 0 ? "N" : "S"}`;
          ctx.fillText(textLabel, 8, y - 4);
        }
      }

      // Increment clock for animations
      if (isPlaying) {
        frameTime += 0.5 * radarSpeed;
      }

      // 4. Draw weather overlay layers
      if (activeLayer === "precipitation") {
        ctx.save();
        ctx.globalAlpha = radarOpacity;

        // Render simulated radial weather radar sweeps
        const sweepAngle = (frameTime * 0.02) % (Math.PI * 2);
        const sweepRadius = Math.max(width, height);

        // Sweep gradient
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, sweepRadius, sweepAngle - 0.2, sweepAngle);
        ctx.closePath();
        const radarSweepGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, sweepRadius / 2);
        radarSweepGrad.addColorStop(0, darkMode ? "rgba(96, 205, 255, 0.15)" : "rgba(0, 120, 212, 0.1)");
        radarSweepGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = radarSweepGrad;
        ctx.fill();

        // Draw sweep indicator line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(sweepAngle) * sweepRadius, centerY + Math.sin(sweepAngle) * sweepRadius);
        ctx.strokeStyle = darkMode ? "rgba(96, 205, 255, 0.3)" : "rgba(0, 120, 212, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Render radar storm blobs
        stormCells.forEach((cell, idx) => {
          // Drifting movement based on frame time
          const driftX = Math.sin(frameTime * 0.005 + idx) * 40;
          const driftY = Math.cos(frameTime * 0.003 + idx * 0.5) * 30;

          const cx = centerX + cell.rx * pixelsPerDegree + driftX;
          const cy = centerY + cell.ry * pixelsPerDegree + driftY;
          const r = cell.size * pixelsPerDegree * 0.4;

          if (cx < -r || cx > width + r || cy < -r || cy > height + r) return;

          // Multi-layer radar heat map blob (green -> yellow -> orange -> red for dbz reflectivity)
          const radGrad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
          if (cell.dbz > 50) {
            // Intense cell (Storm)
            radGrad.addColorStop(0, "rgba(220, 38, 38, 0.85)"); // Red heavy core
            radGrad.addColorStop(0.3, "rgba(245, 158, 11, 0.7)"); // Orange
            radGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.4)"); // Green fringe
            radGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
          } else {
            // Light showers
            radGrad.addColorStop(0, "rgba(16, 185, 129, 0.8)"); // Green core
            radGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.45)"); // Light blue
            radGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
          }

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // Radar reflectivity contour label
          if (zoom >= 5) {
            ctx.fillStyle = darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
            ctx.font = "8px monospace";
            ctx.fillText(`${cell.dbz} dBZ`, cx - 15, cy - r - 4);
          }
        });

        ctx.restore();
      } else if (activeLayer === "wind") {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 120, 212, 0.4)";
        ctx.lineWidth = 1.8;

        // Draw wind traces following windAngle vector
        const windRadian = (windDirVal * Math.PI) / 180;
        const windVx = Math.cos(windRadian) * (windSpdVal * 0.1);
        const windVy = Math.sin(windRadian) * (windSpdVal * 0.1);

        particles.forEach((p) => {
          // If playing, update position
          if (isPlaying) {
            p.x += windVx * p.speed;
            p.y += windVy * p.speed;
            p.life++;

            // Recycle off-screen or dead particles
            if (p.life > p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
              p.x = Math.random() * width;
              p.y = p.y < 0 || p.y > height ? Math.random() * height : (windVy > 0 ? 0 : height);
              p.life = 0;
            }
          }

          // Render particle trail
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - windVx * 4, p.y - windVy * 4);
          ctx.strokeStyle = darkMode
            ? `rgba(96, 205, 255, ${Math.min(0.5, 1 - p.life / p.maxLife)})`
            : `rgba(0, 120, 212, ${Math.min(0.6, 1 - p.life / p.maxLife)})`;
          ctx.stroke();
        });

        ctx.restore();
      } else if (activeLayer === "clouds") {
        ctx.save();
        ctx.globalAlpha = 0.3 * radarOpacity;

        // Drift clouds across the viewport
        const cloudDriftX = (frameTime * 0.15) % width;

        for (let i = -1; i < 3; i++) {
          const cx = (i * 300 + cloudDriftX) % (width + 300) - 150;
          const cy = 120 + Math.sin(i + frameTime * 0.001) * 40;
          const size = 100;

          const cloudGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, size);
          cloudGrad.addColorStop(0, darkMode ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)");
          cloudGrad.addColorStop(0.5, darkMode ? "rgba(200,200,220,0.3)" : "rgba(240,240,240,0.5)");
          cloudGrad.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (activeLayer === "pressure") {
        ctx.save();
        ctx.strokeStyle = darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
        ctx.lineWidth = 1.2;
        ctx.font = "9px monospace";
        ctx.fillStyle = darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.6)";

        // Draw concentric isotherm lines modeling real regional high/low systems
        for (let r = 80; r < 500; r += 80) {
          ctx.beginPath();
          ctx.arc(centerX + 180, centerY - 120, r, 0, Math.PI * 2);
          ctx.stroke();

          // Label isotherm with simulated isobar value
          const angle = Math.PI / 4;
          const lx = centerX + 180 + Math.cos(angle) * r;
          const ly = centerY - 120 + Math.sin(angle) * r;
          const isobarVal = pressureVal - 4 + Math.round(r * 0.04);
          ctx.fillText(`${isobarVal} hPa`, lx, ly);
        }

        // Draw "H" / L pressure system indicators
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#ff6060";
        ctx.fillText("L", centerX - 120, centerY + 80);
        ctx.font = "10px monospace";
        ctx.fillText("995 hPa", centerX - 130, centerY + 95);

        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#60cdff";
        ctx.fillText("H", centerX + 180, centerY - 120);
        ctx.font = "10px monospace";
        ctx.fillText("1024 hPa", centerX + 170, centerY - 105);

        ctx.restore();
      }

      // 5. Place Station Pin on the center origin (active location coordinate)
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(0, 120, 212, 0.4)";

      // Flashing ping rings around station pin
      const pingPulse = (frameTime * 0.04) % 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8 + pingPulse * 30, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 120, 212, ${1 - pingPulse})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Location Pin Indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#0078d4";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Title/Name plaque
      if (zoom >= 3.5) {
        ctx.font = "bold 10px font-sans, sans-serif";
        ctx.fillStyle = darkMode ? "#ffffff" : "#1e1e1e";
        const pinText = `${locationName} (${tempVal}°C)`;
        const textWidth = ctx.measureText(pinText).width;

        // Plaque bounding box
        ctx.fillStyle = darkMode ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.85)";
        ctx.strokeStyle = "#0078d4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(centerX - textWidth / 2 - 6, centerY - 28, textWidth + 12, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = darkMode ? "#ffffff" : "#000000";
        ctx.fillText(pinText, centerX - textWidth / 2, centerY - 16);
      }

      ctx.restore();

      // 6. Draw dynamic central crosshair overlay
      ctx.save();
      ctx.strokeStyle = "rgba(255, 96, 96, 0.4)";
      ctx.lineWidth = 1;

      // Target circular scope
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs cross
      ctx.beginPath();
      ctx.moveTo(width / 2 - 20, height / 2);
      ctx.lineTo(width / 2 + 20, height / 2);
      ctx.moveTo(width / 2, height / 2 - 20);
      ctx.lineTo(width / 2, height / 2 + 20);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    darkMode,
    activeLayer,
    offset,
    zoom,
    pixelsPerDegree,
    isPlaying,
    radarOpacity,
    radarSpeed,
    showCoordinateGrid,
    lat,
    lng,
    locationName,
    tempVal,
    pressureVal,
    windSpdVal,
    windDirVal,
  ]);

  return (
    <div className={`p-5 rounded-2xl border shadow-fluent ${
      darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
    } transition-all space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#0078d4] font-semibold flex items-center gap-1.5">
            <Activity size={12} className="animate-pulse" />
            Meteorological GIS Satellite Scanner
          </span>
          <h2 className="text-base font-bold tracking-tight">Interactive Weather System overlays</h2>
          <p className="text-[11px] opacity-75">Click and drag inside map layout to pan coordinates coordinates, scroll or use controls to scale.</p>
        </div>

        {/* Pivot buttons for layer overlays */}
        <div className={`p-0.5 rounded-md flex gap-1 ${darkMode ? "bg-white/5" : "bg-black/5"}`}>
          {(["precipitation", "wind", "clouds", "pressure"] as MapLayer[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2.5 py-1 text-[11px] font-medium capitalize rounded-md transition-all focus:outline-none ${
                activeLayer === layer
                  ? "bg-[#0078d4] text-white shadow"
                  : "hover:bg-white/10 opacity-75"
              }`}
            >
              {layer === "precipitation" && "Radar"}
              {layer === "wind" && "Wind"}
              {layer === "clouds" && "Clouds"}
              {layer === "pressure" && "Isobars"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Box Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left side: Interactive Canvas */}
        <div className="lg:col-span-3 h-[380px] rounded-xl overflow-hidden border border-slate-500/10 relative">
          <canvas
            ref={canvasRef}
            width={750}
            height={380}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-crosshair select-none block"
            id="meteorological-interactive-canvas"
          />

          {/* Quick HUD overlay in top-right */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
            <div className={`p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed pointer-events-auto flex flex-col gap-1 shadow-md ${
              darkMode ? "bg-zinc-900/90 border-white/10 text-emerald-400" : "bg-white/90 border-black/10 text-emerald-600"
            }`}>
              <div className="flex justify-between gap-6">
                <span>GPS CROSSHAIR:</span>
                <span className="font-bold">{crosshairCoords.lat}°N, {crosshairCoords.lng}°W</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>EST COORD TEMP:</span>
                <span className="font-bold">{crosshairCoords.temp}°C</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>LOCAL CONT PRE:</span>
                <span className="font-bold">{crosshairCoords.pressure} hPa</span>
              </div>
              {activeLayer === "precipitation" && (
                <div className="flex justify-between gap-6">
                  <span>RADAR DBZ REF:</span>
                  <span className="font-bold">{crosshairCoords.reflectivity} dBZ</span>
                </div>
              )}
            </div>
          </div>

          {/* Map navigation floating layout in bottom-left */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setZoom((z) => Math.min(8, z + 1))}
              className={`p-1.5 rounded-md border shadow transition-all ${
                darkMode ? "bg-zinc-900 border-white/10 hover:bg-zinc-800" : "bg-white border-black/10 hover:bg-gray-100"
              }`}
              title="Zoom In"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 1))}
              className={`p-1.5 rounded-md border shadow transition-all ${
                darkMode ? "bg-zinc-900 border-white/10 hover:bg-zinc-800" : "bg-white border-black/10 hover:bg-gray-100"
              }`}
              title="Zoom Out"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleResetNavigation}
              className={`px-2.5 py-1.5 rounded-md border shadow text-[10px] uppercase font-mono transition-all flex items-center gap-1.5 ${
                darkMode ? "bg-zinc-900 border-white/10 hover:bg-zinc-800" : "bg-white border-black/10 hover:bg-gray-100"
              }`}
            >
              <RefreshCw size={11} />
              <span>Center</span>
            </button>
          </div>

          {/* Dynamic Map Legend banner */}
          <div className="absolute bottom-3 right-3 pointer-events-none">
            {activeLayer === "precipitation" && (
              <div className={`p-1.5 rounded-md border text-[9px] font-mono shadow-md flex items-center gap-2 ${
                darkMode ? "bg-zinc-900/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-[#202020]"
              }`}>
                <span>Radar dBZ:</span>
                <div className="flex items-center">
                  <div className="w-4 h-2.5 bg-emerald-500/20" />
                  <div className="w-4 h-2.5 bg-emerald-500/60" />
                  <div className="w-4 h-2.5 bg-emerald-500" />
                  <div className="w-4 h-2.5 bg-yellow-500" />
                  <div className="w-4 h-2.5 bg-red-500" />
                  <div className="w-4 h-2.5 bg-red-800" />
                </div>
                <span className="text-[8px] opacity-75">Lt (20) - Hvy (65)</span>
              </div>
            )}
            {activeLayer === "wind" && (
              <div className={`p-1.5 rounded-md border text-[9px] font-mono shadow-md flex items-center gap-2 ${
                darkMode ? "bg-zinc-900/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-[#202020]"
              }`}>
                <Compass size={11} className="text-[#0078d4] animate-spin-lazy" />
                <span>Flow Vector Direction: {windDirVal}° ({windSpdVal} km/h)</span>
              </div>
            )}
            {activeLayer === "pressure" && (
              <div className={`p-1.5 rounded-md border text-[9px] font-mono shadow-md flex items-center gap-3 ${
                darkMode ? "bg-zinc-900/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-[#202020]"
              }`}>
                <span className="text-[#ff6060] font-bold">L: Low</span>
                <span className="text-[#60cdff] font-bold">H: High</span>
                <span>Isobars (hPa spacing)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Simulation panel controls */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/10 text-[#202020]"
        }`}>
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0078d4] flex items-center gap-1.5">
              <Sliders size={13} />
              Overlay Settings
            </h3>

            {/* Playbacks state */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-gray-400 font-mono">ANIMATION SCAN STATE</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 py-1.5 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isPlaying
                      ? "bg-[#0078d4] text-white border-[#0078d4]"
                      : darkMode
                      ? "bg-zinc-900 border-white/10 hover:bg-zinc-800"
                      : "bg-white border-black/10 hover:bg-gray-100"
                  }`}
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlaying ? "Active Sweep" : "Paused"}</span>
                </button>
              </div>
            </div>

            {/* Opacity control slider */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-gray-400">LAYER TRANSPARENCY</span>
                <span>{Math.round(radarOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={radarOpacity}
                onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                className="w-full h-1 accent-[#0078d4] rounded outline-none cursor-pointer bg-slate-300 dark:bg-zinc-700"
              />
            </div>

            {/* Radar speeds slider */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-gray-400">SWEEP SPEED SCALER</span>
                <span>{radarSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={radarSpeed}
                onChange={(e) => setRadarSpeed(parseFloat(e.target.value))}
                className="w-full h-1 accent-[#0078d4] rounded outline-none cursor-pointer bg-slate-300 dark:bg-zinc-700"
              />
            </div>

            {/* LatLng values coordinate details */}
            <div className="space-y-2 bg-slate-500/5 p-2.5 rounded-lg border border-slate-500/10 text-[10px] font-mono leading-normal">
              <span className="text-[#0078d4] font-bold block">Selected GPS coordinates</span>
              <div className="flex justify-between text-gray-400">
                <span>STATION LAT:</span>
                <span className="text-white dark:text-gray-200">{lat}° N</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>STATION LNG:</span>
                <span className="text-white dark:text-gray-200">{lng}° W</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>ISOBAR GRAD:</span>
                <span className="text-white dark:text-gray-200">{pressureVal} hPa</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-500/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={showCoordinateGrid}
                onChange={(e) => setShowCoordinateGrid(e.target.checked)}
                className="accent-[#0078d4]"
              />
              <span className="text-gray-400 text-[11px] font-medium leading-none">Toggle Parallel Gridlines</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
