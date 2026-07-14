/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { Info, Bell, ShieldAlert, CheckCircle, X } from "lucide-react";
import { AppToast } from "../types";

interface ToastManagerProps {
  toasts: AppToast[];
  setToasts: React.Dispatch<React.SetStateAction<AppToast[]>>;
  darkMode: boolean;
}

export default function ToastManager({ toasts, setToasts, darkMode }: ToastManagerProps) {
  const previousLengthRef = useRef(toasts.length);

  // Play a gorgeous browser-synthesized chime whenever a new toast is added!
  useEffect(() => {
    if (toasts.length > previousLengthRef.current) {
      triggerChime();
    }
    previousLengthRef.current = toasts.length;
  }, [toasts]);

  const triggerChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Node 1: Primary oscillator (pleasant tone)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 523.25; // C5 note
      osc1.type = "sine";
      
      // Node 2: Harmonizing oscillator
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 659.25; // E5 note
      osc2.type = "sine";

      // Gain transitions to decay naturally like a real bell
      const now = ctx.currentTime;
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      gain2.gain.setValueAtTime(0.1, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.start(now);
      osc1.stop(now + 0.7);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.75);
    } catch (e) {
      console.warn("Chime synth not supported or blocked by user gesture:", e);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      id="uwp-toast-container"
      className="fixed bottom-4 right-4 z-[9999] w-80 space-y-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        let icon = <Info size={16} className="text-[#0078d4]" />;
        let topBorder = "border-t-[3px] border-t-[#0078d4]";

        if (toast.type === "success") {
          icon = <CheckCircle size={16} className="text-green-500" />;
          topBorder = "border-t-[3px] border-t-green-500";
        } else if (toast.type === "warning") {
          icon = <ShieldAlert size={16} className="text-amber-500" />;
          topBorder = "border-t-[3px] border-t-amber-500";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border animate-toast-in relative transition-all duration-300 ${topBorder} ${
              darkMode ? "bg-[#25262b]/95 border-white/10 text-white backdrop-blur-md" : "bg-white/95 border-black/10 text-[#1e1e1e] backdrop-blur-md"
            }`}
          >
            {/* Close cross */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`absolute top-2 right-2 p-1 rounded-sm transition-colors outline-none ${
                darkMode ? "hover:bg-[#333333] text-gray-400" : "hover:bg-[#f1f1f1] text-gray-500"
              }`}
            >
              <X size={12} />
            </button>

            {/* Layout body */}
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">{icon}</div>
              <div className="space-y-1.5 pr-4">
                <h4 className="text-[12px] font-bold tracking-wide font-sans mt-0.5">
                  {toast.title}
                </h4>
                <p className="text-[10.5px] opacity-80 leading-normal font-sans">
                  {toast.message}
                </p>
                <span className="text-[8.5px] block font-mono text-gray-500">
                  {toast.timestamp}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
