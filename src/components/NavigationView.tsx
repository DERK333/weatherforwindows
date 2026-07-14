/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Menu,
  Home,
  LineChart,
  BrainCircuit,
  Grid,
  Info,
  Archive,
  Wrench,
  Settings,
  HelpCircle,
} from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationViewProps {
  darkMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavigationView({ darkMode, activeTab, setActiveTab }: NavigationViewProps) {
  const [expanded, setExpanded] = useState(true);

  const primaryItems: NavigationItem[] = [
    { id: "dashboard", label: "Weather Dashboard", icon: <Home size={16} /> },
    { id: "trends", label: "Hourly Trends & Radar", icon: <LineChart size={16} /> },
    { id: "broadcast", label: "TWC AI Meteorological Digest", icon: <BrainCircuit size={16} /> },
    { id: "livetiles", label: "Simulated Live Tile Settings", icon: <Grid size={16} /> },
    { id: "packager", label: "Microsoft Store Packaging Tool", icon: <Wrench size={16} /> },
  ];

  return (
    <aside
      id="uwp-navigation-view"
      className={`relative flex flex-col justify-between select-none transition-all duration-200 shrink-0 border-r ${
        expanded ? "w-64" : "w-14"
      } ${
        darkMode ? "bg-[#25262b] border-white/10 text-white" : "bg-[#f9f9fb] border-black/10 text-[#2c2c2c]"
      }`}
    >
      {/* Upper Navigation section */}
      <div className="flex flex-col">
        {/* Toggle Hamburger button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`h-11 w-full pl-5 flex items-center gap-4 transition-colors outline-none text-left ${
            darkMode ? "hover:bg-white/5 text-white/60 hover:text-white" : "hover:bg-black/5 text-black/60 hover:text-black"
          }`}
          title={expanded ? "Collapse Navigation Pane" : "Expand Navigation Pane"}
        >
          <Menu size={16} className="shrink-0" />
          {expanded && (
            <span className="text-[12px] font-medium tracking-wide opacity-80">
              Navigation Menu
            </span>
          )}
        </button>

        {/* Navigation List */}
        <nav className="mt-2 px-2.5 space-y-1">
          {primaryItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-10 px-3 flex items-center rounded-md gap-4 transition-all duration-150 relative text-left outline-none ${
                  isActive
                    ? "bg-[#0078d4] text-white shadow-lg shadow-[#0078d4]/20 font-medium"
                    : darkMode
                    ? "text-white/50 hover:text-white hover:bg-white/5"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                <div className={`shrink-0 ${isActive ? "scale-105" : ""}`}>
                  {item.icon}
                </div>

                {expanded && (
                  <span className="text-[12px] truncate font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings at bottom */}
      <div className="p-2.5 border-t border-transparent">
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full h-10 px-3 flex items-center rounded-md gap-4 transition-all duration-150 text-left outline-none relative ${
            activeTab === "settings"
              ? "bg-[#0078d4] text-white shadow-lg shadow-[#0078d4]/20 font-medium"
              : darkMode
              ? "text-white/50 hover:text-white hover:bg-white/5"
              : "text-black/60 hover:text-black hover:bg-black/5"
          }`}
        >
          <Settings size={16} className="shrink-0" />
          {expanded && <span className="text-[12px] font-medium">Application Options</span>}
        </button>
      </div>
    </aside>
  );
}
