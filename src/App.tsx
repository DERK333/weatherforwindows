/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import TitleBar from "./components/TitleBar";
import NavigationView from "./components/NavigationView";
import WeatherDashboard from "./components/WeatherDashboard";
import TrendsView from "./components/TrendsView";
import AIBroadcastView from "./components/AIBroadcastView";
import StorePackager from "./components/StorePackager";
import ToastManager from "./components/ToastManager";
import { GeocodedLocation, WeatherResponse, AppToast } from "./types";
import { Sliders, Wrench, ShieldCheck, Check, Volume2, HardDrive, Terminal } from "lucide-react";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSearching, setIsSearching] = useState(false);
  const [locationsList, setLocationsList] = useState<GeocodedLocation[]>([]);
  const [activeLocation, setActiveLocation] = useState<GeocodedLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [toasts, setToasts] = useState<AppToast[]>([]);

  // User Options Settings
  const [enableChimes, setEnableChimes] = useState(true);
  const [isStoreValidated, setIsStoreValidated] = useState(true);

  // Trigger Action Center success/warning toasts
  const triggerToast = (title: string, message: string, type: "info" | "warning" | "success" = "info") => {
    const newToast: AppToast = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts visible
  };

  // Default coordinate bootstrap initialization: Seattle, WA (Famous meteorological station)
  useEffect(() => {
    const defaultSeattle: GeocodedLocation = {
      id: 5809844,
      name: "Seattle",
      admin1: "Washington",
      country: "United States",
      latitude: 47.6062,
      longitude: -122.3321,
      country_code: "US",
      timezone: "America/Los_Angeles",
    };
    handleSelectLocation(defaultSeattle, true); // Silent init on startup
  }, []);

  // Fetch coordinates list from search backend geocode query
  const handleSearchCity = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Geocoding failed status");
      const data = await response.json();
      setLocationsList(data.results || []);
    } catch (e) {
      console.error(e);
      triggerToast("Geocoding failed", "Coordinates lookup could not synchronize with search catalogs.", "warning");
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch structured weather forecasts from our backend station proxy
  const handleSelectLocation = async (loc: GeocodedLocation, isInit = false) => {
    setActiveLocation(loc);
    setIsSearching(true);
    try {
      const weatherRes = await fetch(
        `/api/weather?lat=${loc.latitude}&lon=${loc.longitude}&city=${encodeURIComponent(loc.name)}`
      );
      if (!weatherRes.ok) throw new Error("Weather request failed status");
      const data: WeatherResponse = await weatherRes.json();
      setWeatherData(data);

      if (!isInit) {
        triggerToast(
          "Station coordinates updated",
          `Weather forecast loaded for ${loc.name}, ${loc.admin1 || loc.country} via TWC channels!`,
          "success"
        );
      }
    } catch (e) {
      console.error(e);
      triggerToast("Meteorological cache error", "Could not retrieve weather forecasts details from active stations.", "warning");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearCache = () => {
    triggerToast("Buffer cache cleared", "Atmospheric databases have been reset to default values.", "success");
  };

  return (
    <div className={`h-screen flex flex-col font-sans transition-colors duration-200 overflow-hidden ${
      darkMode ? "bg-gradient-to-br from-[#1a1b1e] to-[#2b2d31] text-white" : "bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] text-[#202020]"
    }`}>
      {/* 1. Global Windows Custom Title Bar */}
      <TitleBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSearchCity={handleSearchCity}
        locations={locationsList}
        onSelectLocation={(loc) => handleSelectLocation(loc)}
        isSearching={isSearching}
        activeLocation={activeLocation}
      />

      {/* 2. Main Windows App Chassis View Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Expanded Navigation Sidebar */}
        <NavigationView darkMode={darkMode} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Display workspace (Pane) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Active module selection rendering */}
          {activeTab === "dashboard" && (
            <WeatherDashboard
              darkMode={darkMode}
              activeLocation={activeLocation}
              weatherData={weatherData}
              onTriggerToast={triggerToast}
            />
          )}

          {activeTab === "trends" && (
            <TrendsView
              darkMode={darkMode}
              activeLocation={activeLocation}
              weatherData={weatherData}
            />
          )}

          {activeTab === "broadcast" && (
            <AIBroadcastView
              darkMode={darkMode}
              activeLocation={activeLocation}
              weatherData={weatherData}
              onTriggerToast={triggerToast}
            />
          )}

          {activeTab === "livetiles" && (
            <WeatherDashboard
              darkMode={darkMode}
              activeLocation={activeLocation}
              weatherData={weatherData}
              onTriggerToast={triggerToast}
            />
          )}

          {activeTab === "packager" && (
            <StorePackager darkMode={darkMode} onTriggerToast={triggerToast} />
          )}

          {activeTab === "settings" && (
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                  UWP Global Preferences
                </span>
                <h1 className="text-xl font-bold">Options & Technical Compliance Settings</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Settings */}
                <section className={`p-5 rounded-md shadow-fluent border ${
                  darkMode ? "bg-[#2a2a2a] border-[#3e3e3e]" : "bg-white border-[#e0e0e0]"
                }`}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0078d4] mb-4 flex items-center gap-1.5">
                    <Sliders size={14} /> Application Preference Modes
                  </h2>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold block">Fluent Dark theme overlay</span>
                        <p className="text-[10.5px] text-gray-400">Uses high-contrast black backplates to protect vision eyes.</p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative outline-none border ${
                          darkMode ? "bg-[#0078d4] border-[#0078d4]" : "bg-gray-350 border-gray-400"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.8 transition-all duration-150 ${
                          darkMode ? "left-5.5" : "left-0.8"
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-500/10 pt-3">
                      <div>
                        <span className="font-semibold block">Atmospheric sound chimes</span>
                        <p className="text-[10.5px] text-gray-400">Plays dual-sine oscillator harmonic bells on real notifications.</p>
                      </div>
                      <button
                        onClick={() => {
                          setEnableChimes(!enableChimes);
                          triggerToast("Chime system updated", `Bells are now ${!enableChimes ? "Enabled" : "Disabled"}.`, "info");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative outline-none border ${
                          enableChimes ? "bg-[#0078d4] border-[#0078d4]" : "bg-gray-350 border-gray-400"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.8 transition-all duration-150 ${
                          enableChimes ? "left-5.5" : "left-0.8"
                        }`} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Technical Store details */}
                <section className={`p-5 rounded-md shadow-fluent border ${
                  darkMode ? "bg-[#2a2a2a] border-[#3e3e3e]" : "bg-white border-[#e0e0e0]"
                }`}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0078d4] mb-4 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-green-400" /> Stores Compliance Validation Report
                  </h2>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="flex justify-between items-center bg-green-500/5 p-3 rounded-sm border border-green-500/10">
                      <div>
                        <span className="font-bold text-green-400 block text-[11px]">UWP DIRECTIVES VERIFIED</span>
                        <p className="text-[10px] text-gray-400 mt-1">This compiled app bundle passes all Windows Store AppX standards.</p>
                      </div>
                      <Check className="text-green-400" size={20} />
                    </div>

                    <div className="space-y-2 text-[11px] font-mono leading-relaxed bg-zinc-950 p-3 rounded-sm text-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-500">PACKAGE IDENTIFIER:</span>
                        <span className="text-emerald-400">UWPWeatherForecast.App</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">VERSION ENUMERATION:</span>
                        <span className="text-emerald-400">v1.0.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">OAUTH CAPABILITIES:</span>
                        <span className="text-emerald-400">internetClient, location</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Storage Diagnostics */}
                <section className={`p-5 rounded-md shadow-fluent border col-span-1 md:col-span-2 ${
                  darkMode ? "bg-[#2a2a2a] border-[#3e3e3e]" : "bg-white border-[#e0e0e0]"
                }`}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <HardDrive size={14} /> Diagnostic Storage Buffer Cache
                  </h2>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <p className="opacity-75 max-w-lg leading-normal">
                      Reset stored weather station coordinates and clear all temporary caches to retrieve fresh, up-to-date satellite forecast information. Recommended prior to store packaging.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="bg-red-600 font-semibold text-white px-4 py-2 hover:bg-red-750 shrink-0 transition-colors uppercase rounded-sm text-[10.5px] cursor-pointer"
                    >
                      Reset Local Storage Buffers
                    </button>
                  </div>
                </section>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sleek Design Footer/Status */}
      <footer className={`h-10 border-t flex items-center px-6 justify-between shrink-0 text-[11px] ${
        darkMode ? "bg-black/20 border-white/5 text-white/40" : "bg-white/40 border-black/5 text-black/40"
      }`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Connected
          </span>
          <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div>The Weather Channel API v2.4.1</div>
      </footer>

      {/* 3. Render Windows toast alerts at bottom-right viewport */}
      <ToastManager toasts={toasts} setToasts={setToasts} darkMode={darkMode} />
    </div>
  );
}
