/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, CloudSun, Moon, Sun, Monitor, Loader2, Sparkles } from "lucide-react";
import { GeocodedLocation } from "../types";

interface TitleBarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onSearchCity: (query: string) => Promise<void>;
  locations: GeocodedLocation[];
  onSelectLocation: (loc: GeocodedLocation) => void;
  isSearching: boolean;
  activeLocation: GeocodedLocation | null;
}

export default function TitleBar({
  darkMode,
  setDarkMode,
  onSearchCity,
  locations,
  onSelectLocation,
  isSearching,
  activeLocation,
}: TitleBarProps) {
  const [searchVal, setSearchVal] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    await onSearchCity(searchVal);
    setDropdownOpen(true);
  };

  const selectItem = (loc: GeocodedLocation) => {
    onSelectLocation(loc);
    setSearchVal(`${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ""}`);
    setDropdownOpen(false);
  };

  return (
    <header
      id="uwp-title-bar"
      className={`h-12 flex items-center justify-between px-4 select-none border-b transition-colors duration-200 shrink-0 ${
        darkMode ? "bg-[#1a1b1e]/90 border-white/10 text-white backdrop-blur-md" : "bg-[#f3f4f6]/95 border-black/10 text-[#1c1c1c]"
      }`}
    >
      {/* App Logo and Branding */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#0078d4] text-white rounded-md shadow-md shadow-[#0078d4]/10 transition-transform hover:scale-105">
          <CloudSun size={15} />
        </div>
        <span className="text-xs font-semibold tracking-wide font-sans text-white/80">UWP Weather Forecast</span>
        {activeLocation && (
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium tracking-wide ${
            darkMode ? "bg-white/5 text-white/50 border border-white/5" : "bg-black/5 text-black/50 border border-black/5"
          }`}>
            Live Connected
          </span>
        )}
      </div>

      {/* Dynamic Flight / Search Input */}
      <div ref={containerRef} className="relative w-full max-w-xs mx-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Search worldwide locations..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            className={`w-full h-8 pl-8 pr-12 text-xs rounded-full border outline-none font-sans transition-all duration-150 ${
              darkMode
                ? "bg-white/5 border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:border-[#0078d4]"
                : "bg-white border-black/10 text-[#202020] placeholder-black/40 focus:bg-white focus:border-[#0078d4]"
            }`}
          />
          <Search size={12} className="absolute left-3 text-white/40" />
          
          <div className="absolute right-2 flex items-center gap-1.5 text-gray-400">
            {isSearching ? (
              <Loader2 size={12} className="animate-spin text-[#0078d4]" />
            ) : searchVal.trim() ? (
              <button
                type="submit"
                className="text-[10px] bg-[#0078d4]/80 text-white px-2 py-0.5 rounded-full font-semibold hover:bg-[#0078d4] transition-all"
              >
                Go
              </button>
            ) : null}
          </div>
        </form>

        {/* Dropdown Results list */}
        {dropdownOpen && (locations.length > 0 || isSearching) && (
          <div
            className={`absolute top-9 left-0 right-0 z-50 rounded-lg shadow-uwp-picker border p-1.5 text-xs max-h-60 overflow-y-auto backdrop-blur-xl ${
              darkMode ? "bg-[#1f2024]/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-[#2c2c2c]"
            }`}
          >
            {isSearching && locations.length === 0 ? (
              <div className="p-3 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={13} className="animate-spin text-[#0078d4]" /> Searching catalog...
              </div>
            ) : locations.length === 0 ? (
              <div className="p-2 text-center text-gray-400">No locations matched</div>
            ) : (
              <ul>
                {locations.map((loc) => (
                  <li key={loc.id}>
                    <button
                      type="button"
                      onClick={() => selectItem(loc)}
                      className={`w-full text-left px-2 py-1.5 rounded-sm flex items-center justify-between transition-colors ${
                        darkMode ? "hover:bg-[#333333]" : "hover:bg-[#f1f1f1]"
                      }`}
                    >
                      <div>
                        <span className="font-medium text-xs">{loc.name}</span>
                        {loc.admin1 && (
                          <span className={`text-[10px] ml-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {loc.admin1}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {loc.country_code?.toUpperCase()} ({loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°)
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Windows Window-Actions Controls & Theme Switcher */}
      <div className="flex items-center">
        {/* Theme select knob */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Windows Theme Mode"
          className={`h-12 w-10 flex items-center justify-center transition-colors ${
            darkMode ? "hover:bg-[#2d2d2d] text-[#e0e0e0]" : "hover:bg-[#e9e9e9] text-[#404040]"
          }`}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Windows Minimize Mock */}
        <div
          title="Minimize app"
          className={`h-12 w-11 flex items-center justify-center transition-colors duration-150 cursor-pointer ${
            darkMode ? "hover:bg-[#2d2d2d]" : "hover:bg-[#e9e9e9]"
          }`}
        >
          <div className="w-2.5 h-[1px] bg-gray-500"></div>
        </div>

        {/* Windows Maximize / Windowed Mode Mock */}
        <div
          title="Maximize app"
          className={`h-12 w-11 flex items-center justify-center transition-colors duration-150 cursor-pointer ${
            darkMode ? "hover:bg-[#2d2d2d]" : "hover:bg-[#e9e9e9]"
          }`}
        >
          <div className="w-[9px] h-[9px] border border-gray-500 rounded-sm"></div>
        </div>

        {/* Windows Close Red Hover Action */}
        <div
          title="Quit Forecast (Mock)"
          className="h-12 w-11 flex items-center justify-center transition-colors duration-150 text-gray-500 hover:bg-[#e81123] hover:text-white cursor-pointer"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M 0,0 L 10,10 M 10,0 L 0,10" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </header>
  );
}
