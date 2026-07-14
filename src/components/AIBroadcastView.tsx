/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BrainCircuit, Tv, PlayCircle, Radio, Sparkles, Volume2, ShieldAlert, Check } from "lucide-react";
import { WeatherResponse, GeocodedLocation } from "../types";

interface AIBroadcastViewProps {
  darkMode: boolean;
  activeLocation: GeocodedLocation | null;
  weatherData: WeatherResponse | null;
  onTriggerToast: (title: string, message: string, type: "info" | "warning" | "success") => void;
}

export default function AIBroadcastView({
  darkMode,
  activeLocation,
  weatherData,
  onTriggerToast,
}: AIBroadcastViewProps) {
  const [isPlayingBrief, setIsPlayingBrief] = useState(false);

  if (!weatherData || !activeLocation) return null;

  const { weather, briefing } = weatherData;
  const temp = Math.round(weather.current.temperature_2m);
  const code = weather.current.weather_code;

  // Synthesize simulated voice readout
  const handleVoiceReadout = () => {
    if (!briefing) return;
    setIsPlayingBrief(true);
    onTriggerToast(
      "Audio Broadcast Active",
      "Simulating UWP Speech Synthesizer vocal readout process...",
      "success"
    );

    // Dynamic browser Text-to-speech synthesize
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        // Extract pure text by stripping labels
        const cleanText = briefing.replace(/[#*_-]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05; 
        utterance.onend = () => setIsPlayingBrief(false);
        utterance.onerror = () => setIsPlayingBrief(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingBrief(false), 4000);
      }
    } catch (e) {
      setTimeout(() => setIsPlayingBrief(false), 4000);
    }
  };

  const handleStopSpeech = () => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    setIsPlayingBrief(false);
  };

  return (
    <div className="p-5 flex-grow overflow-y-auto space-y-6">
      
      {/* Title block */}
      <div>
        <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">Interactive Newsroom Studio</span>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit size={20} className="text-[#0078d4]" />
          The Weather Channel AI Meteorological Broadcaster
        </h1>
        <p className="text-xs opacity-75 mt-0.5">Stream live, grounded meteorologist summaries using AI. Real-time newsroom experience compliant with Microsoft Store audio packages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Newsroom TV simulator frame */}
        <div className={`col-span-1 lg:col-span-2 p-5 rounded-2xl shadow-fluent border relative ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        }`}>
          {/* Simulated TV border bezel */}
          <div className="p-4 rounded bg-[#0b0c10] border border-zinc-800 text-white min-h-[280px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Screen static lines */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[size:100%_4px] pointer-events-none opacity-25" />

            {/* Broadcast header metrics */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest animate-pulse">
                <Radio size={8} /> LIVE BROADCAST
              </div>
              <span className="font-mono text-[9px] text-[#0078d4] font-bold">1080P COMPLIANT</span>
            </div>

            {/* Simulated transcript text container */}
            <div className="my-5 z-10 text-xs flex-grow leading-relaxed max-h-[190px] overflow-y-auto pr-1">
              {briefing ? (
                <p className="font-sans text-gray-250 italic">
                  "{briefing.replace(/[#*_-]/g, "")}"
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 text-gray-550 italic">
                  <span>Searching Satellite signals... No active briefing found.</span>
                </div>
              )}
            </div>

            {/* TV news tickers scrollbar */}
            <div className="bg-zinc-950 border-t border-zinc-800 p-2 -mx-4 -mb-4 z-10 flex items-center overflow-hidden">
              <span className="bg-amber-600 text-[10px] font-bold px-1.5 h-full flex items-center shrink-0 rounded-sm mr-2 z-15 text-white">BULLETIN</span>
              <div className="relative w-full overflow-hidden h-5">
                <div className="absolute whitespace-nowrap animate-ticker text-[10.5px] font-semibold text-[#60cdff] flex items-center gap-10">
                  <span>Satellite radar scan active for {activeLocation.name} — Present index {temp}°C</span>
                  <span>•</span>
                  <span>Microsoft Store package compilation checklist: Square150x150, Square44x44, Splash ready</span>
                  <span>•</span>
                  <span>Barometric coordinates standard 10m altitude reading: {weather.current.pressure_msl} hPa</span>
                  <span>•</span>
                  <span>Grounded using The Weather Channel search database parameters</span>
                </div>
              </div>
            </div>

          </div>

          {/* Voice controller buttons */}
          <div className="mt-4 flex items-center justify-between gap-4 text-xs">
            <span className="text-[10px] text-gray-400">Speech Synthesizer Voice API</span>
            {isPlayingBrief ? (
              <button
                onClick={handleStopSpeech}
                className="bg-red-600 text-white font-semibold transition-all px-4 py-1.5 rounded-sm hover:bg-red-750 inline-flex items-center gap-1.5"
              >
                <span>Stop Vocal Broadcast</span>
              </button>
            ) : (
              <button
                onClick={handleVoiceReadout}
                disabled={!briefing}
                className="bg-[#0078d4] text-white font-semibold transition-all px-4 py-1.5 rounded-sm hover:bg-[#006cc0] disabled:opacity-40 inline-flex items-center gap-1.5 shadow"
              >
                <Volume2 size={13} />
                <span>Simulate Vocal Broadcast</span>
              </button>
            )}
          </div>
        </div>

        {/* Dress code advisory block */}
        <div className={`p-5 rounded-2xl shadow-fluent border ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        }`}>
          <div className="flex items-center gap-1.5 mb-4 text-[#0078d4] font-semibold text-xs">
            <Sparkles size={14} />
            <span>Meteorological Apparel Advisory</span>
          </div>

          <div className="space-y-4 text-xs">
            <p className="opacity-75 leading-relaxed">Recommended clothing specifications dynamically mapped to current temperatures ({temp}°C):</p>
            
            <div className="space-y-3">
              {temp <= 10 ? (
                <div className="p-3 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-sm space-y-1">
                  <span className="font-bold">🍂 Winter Insulation Required</span>
                  <p className="text-[11px] opacity-80">Heavy jackets, layered windbreakers, scarf, and thermal beanie elements recommended for wind protections.</p>
                </div>
              ) : temp <= 18 ? (
                <div className="p-3 bg-teal-500/5 text-teal-400 border border-teal-500/10 rounded-sm space-y-1">
                  <span className="font-bold">🧥 Light Autumn Layering</span>
                  <p className="text-[11px] opacity-80">Light sweaters, micro-fleece coats, or thin cardigans are perfect. Ensure windbreakers are accessible for coordinates.</p>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/5 text-amber-500 border border-amber-500/10 rounded-sm space-y-1">
                  <span className="font-bold">👕 Summer Active Attire</span>
                  <p className="text-[11px] opacity-80">Light breathable cotton shirts, shorts, or activewear. Sunscreen highly indices if UV rating is high.</p>
                </div>
              )}

              {/* Rain warning */}
              {code >= 51 && (
                <div className="p-3 bg-red-500/5 text-red-500 border border-red-500/10 rounded-sm space-y-1">
                  <span className="font-bold">☔ Shielding required (Precipitation warning)</span>
                  <p className="text-[11px] opacity-80">Carry a high-grade mechanical umbrella or deploy fully water-resistant hooded weather jackets.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-500/5 text-gray-400 rounded-sm text-[10px] space-y-1">
              <span className="font-semibold block">Microsoft Store Quality Standard Checklist</span>
              <p className="opacity-80">UWP applications offering smart meteorologist instructions are highly recommended to outline advisory constraints to minimize review duration.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Embedded CSS animation for continuous marquee marquee ticker */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker {
            animation: ticker 25s linear infinite;
          }
        `
      }} />

    </div>
  );
}
