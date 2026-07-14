/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Wrench, Shield, CheckCircle, Copy, Terminal, AppWindow, FileCode, Check } from "lucide-react";
import { StorePackageManifest } from "../types";

interface StorePackagerProps {
  darkMode: boolean;
  onTriggerToast: (title: string, message: string, type: "info" | "warning" | "success") => void;
}

export default function StorePackager({ darkMode, onTriggerToast }: StorePackagerProps) {
  const [copied, setCopied] = useState(false);
  const [manifest, setManifest] = useState<StorePackageManifest>({
    packageIdentityName: "UWPWeatherForecast.App",
    publisherDisplayName: "Derrick Samuel Development",
    publisherId: "CN=4697F8B6-8C38-4C8B-8833-FE66EEFDEF0B",
    packageVersion: "1.0.0.0",
    displayName: "UWP Weather Forecast",
    description: "High-accuracy live weather forecast app with Fluent design principles.",
    capabilities: {
      internetClient: true,
      location: true,
    },
  });

  // Calculate XML output dynamically
  const xmlOutput = `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:mp="http://schemas.microsoft.com/appx/2014/phone/manifest"
  IgnorableNamespaces="uap mp">

  <Identity
    Name="${manifest.packageIdentityName}"
    Publisher="${manifest.publisherId}"
    Version="${manifest.packageVersion}"
    ProcessorArchitecture="neutral" />

  <mp:PhoneIdentity PhoneProductId="8fccf365-d602-4da8-96f3-f2b74070a25b" PhonePublisherId="00000000-0000-0000-0000-000000000000"/>

  <Properties>
    <DisplayName>${manifest.displayName}</DisplayName>
    <PublisherDisplayName>${manifest.publisherDisplayName}</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Universal" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22000.0" />
  </Dependencies>

  <Resources>
    <Resource Language="x-generate" />
  </Resources>

  <Applications>
    <Application Id="App"
      Executable="$targetnametoken$.exe"
      EntryPoint="${manifest.packageIdentityName}.App">
      <uap:VisualElements
        DisplayName="${manifest.displayName}"
        Square150x150Logo="Assets\\Square150x150Logo.png"
        Square44x44Logo="Assets\\Square44x44Logo.png"
        Description="${manifest.description}"
        BackgroundColor="#0078d4">
        <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" Square310x310Logo="Assets\\Large310x310Logo.png" />
        <uap:SplashScreen Image="Assets\\SplashScreen.png" />
      </uap:VisualElements>
    </Application>
  </Applications>

  <Capabilities>
    ${manifest.capabilities.internetClient ? '<Capability Name="internetClient" />' : ""}
    ${manifest.capabilities.location ? '<DeviceCapability Name="location" />' : ""}
  </Capabilities>
</Package>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(xmlOutput);
    setCopied(true);
    onTriggerToast("XML Copied", "UWP AppX Manifest schema copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 flex-1 overflow-y-auto space-y-6">
      
      {/* Header bar */}
      <div>
        <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">UWP Package Deployment Suite</span>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wrench size={20} className="text-[#0078d4]" />
          Microsoft Partner Center Store Packager
        </h1>
        <p className="text-xs opacity-75 mt-0.5">Quickly construct correct package deployment metadata to compile and list your applet on the Windows Store.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Manifest editor parameters */}
        <section className={`p-5 rounded-2xl shadow-fluent border col-span-1 lg:col-span-2 ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        }`}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0078d4] mb-4 flex items-center gap-1.5">
            <AppWindow size={14} />
            Package.appxmanifest Parameters
          </h2>

          <form className="space-y-3.5 text-xs">
            
            {/* Display Name */}
            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">APP DISPLAY NAME</label>
              <input
                type="text"
                value={manifest.displayName}
                onChange={(e) => setManifest({ ...manifest, displayName: e.target.value })}
                className={`w-full p-2 rounded-sm border outline-none font-sans ${
                  darkMode ? "bg-[#1f1f1f] border-[#3a3a3a] text-white focus:border-[#0078d4]" : "bg-white border-[#cbcbcb] focus:border-[#0078d4]"
                }`}
              />
            </div>

            {/* Package catalog identification ID */}
            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">PACKAGE IDENTITY NAME</label>
              <input
                type="text"
                value={manifest.packageIdentityName}
                onChange={(e) => setManifest({ ...manifest, packageIdentityName: e.target.value })}
                className={`w-full p-2 rounded-sm border outline-none font-mono text-[10.5px] ${
                  darkMode ? "bg-[#1f1f1f] border-[#3a3a3a] text-white focus:border-[#0078d4]" : "bg-white border-[#cbcbcb] focus:border-[#0078d4]"
                }`}
              />
            </div>

            {/* Publisher identifier (from Microsoft Developer Account) */}
            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">PUBLISHER IDENTIFIER (CN SUBJECT)</label>
              <input
                type="text"
                value={manifest.publisherId}
                onChange={(e) => setManifest({ ...manifest, publisherId: e.target.value })}
                className={`w-full p-2 rounded-sm border outline-none font-mono text-[10.5px] ${
                  darkMode ? "bg-[#1f1f1f] border-[#3a3a3a] text-white focus:border-[#0078d4]" : "bg-white border-[#cbcbcb] focus:border-[#0078d4]"
                }`}
              />
            </div>

            {/* Publisher display name */}
            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">PUBLISHER DISPLAY NAME</label>
              <input
                type="text"
                value={manifest.publisherDisplayName}
                onChange={(e) => setManifest({ ...manifest, publisherDisplayName: e.target.value })}
                className={`w-full p-2 rounded-sm border outline-none font-sans ${
                  darkMode ? "bg-[#1f1f1f] border-[#3a3a3a] text-white focus:border-[#0078d4]" : "bg-white border-[#cbcbcb] focus:border-[#0078d4]"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Package Version */}
              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-1">VERSION</label>
                <input
                  type="text"
                  value={manifest.packageVersion}
                  onChange={(e) => setManifest({ ...manifest, packageVersion: e.target.value })}
                  className={`w-full p-2 rounded-sm border outline-none font-mono ${
                    darkMode ? "bg-[#1f1f1f] border-[#3a3a3a] text-white focus:border-[#0078d4]" : "bg-white border-[#cbcbcb] focus:border-[#0078d4]"
                  }`}
                />
              </div>

              {/* Package Capabilites */}
              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-1">UWP DECLARED PERMISSIONS</label>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manifest.capabilities.internetClient}
                      onChange={(e) => setManifest({
                        ...manifest,
                        capabilities: { ...manifest.capabilities, internetClient: e.target.checked }
                      })}
                      className="accent-[#0078d4]"
                    />
                    <span>internetClient</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manifest.capabilities.location}
                      onChange={(e) => setManifest({
                        ...manifest,
                        capabilities: { ...manifest.capabilities, location: e.target.checked }
                      })}
                      className="accent-[#0078d4]"
                    />
                    <span>location</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Short app catalog description */}
            <div>
              <label className="text-[10px] font-mono text-gray-400 block mb-1">CATAOG DESCRIPTION FIELD</label>
              <textarea
                value={manifest.description}
                onChange={(e) => setManifest({ ...manifest, description: e.target.value })}
                rows={2}
                className={`w-full p-2 rounded-sm border outline-none font-sans text-xs resize-none ${
                  darkMode ? "bg-[#1f1f1f] border-[#3a3a3a] text-white focus:border-[#0078d4]" : "bg-white border-[#cbcbcb] focus:border-[#0078d4]"
                }`}
              />
            </div>

          </form>

          {/* Guidelines info */}
          <div className="mt-5 p-3.5 bg-sky-500/5 text-sky-400 rounded-sm space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-sky-400">
              <Shield size={13} strokeWidth={2.5} />
              <span>Microsoft Store Guidelines Compliance</span>
            </div>
            <p className="text-[10.5px] opacity-75">
              This manifest utilizes standard neutral processor architectures to compile for x86, x64, or ARM64 architectures natively.
            </p>
          </div>
        </section>

        {/* XML output screen container */}
        <section className={`p-5 rounded-2xl shadow-fluent border col-span-1 lg:col-span-3 ${
          darkMode ? "bg-white/5 border-white/5 text-white" : "bg-black/5 border-black/15 text-[#202020]"
        } flex flex-col justify-between h-full`}>
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-[#0078d4]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">XML Manifest Preview (UWP Schema)</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="text-[10px] font-semibold text-white bg-[#0078d4] hover:bg-[#006cc0] px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all shadow"
              >
                {copied ? <Check size={12} className="text-green-300" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy Manifest Code"}</span>
              </button>
            </div>

            {/* XML pre code */}
            <div className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[10px] rounded-sm overflow-auto max-h-[350px] border border-zinc-800 flex-grow select-all">
              <pre>{xmlOutput}</pre>
            </div>

            {/* Store assets list checklist */}
            <div className="mt-4 pt-3.5 border-t border-slate-500/10 space-y-2">
              <div className="text-[11px] font-semibold text-[#0078d4] uppercase">Required Microsoft Partner Center Asset assets checklist:</div>
              <ul className="text-[10.5px] opacity-80 grid grid-cols-2 md:grid-cols-3 gap-2.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  <span>Square 150x150 Logo (.png)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  <span>Square 44x44 Logo (.png)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  <span>Wide 310x150 Tile Logo (.png)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  <span>Store Logo 50x50 (.png)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  <span>SplashScreen 620x300 (.png)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  <span>Wide 310x310 Logo (.png)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
