<div align="center">

# 🌤️ The Weather Channel on Windows

**A premium Windows weather forecast app built with Fluent Design, React, and AI-powered meteorological analysis.**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078d4.svg)](https://microsoft.com/windows)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Weather Dashboard** | Live current conditions, hourly & 7-day forecasts powered by Open-Meteo |
| **AI Broadcast Digest** | Gemini AI generates a professional TWC-style meteorological briefing |
| **Hourly Trends & Radar** | Interactive Recharts visualizations for temperature, precipitation, UV index |
| **Store Packager** | In-app tool to generate a valid `Package.appxmanifest` for Microsoft Store submission |
| **Live Tile Simulation** | Preview Windows Live Tile layouts for the app's Start menu tile |
| **Fluent Design** | WinUI-style navigation pane, toast notifications, dark/light themes |
| **Electron Desktop App** | Packaged as a native Windows `.msix` for distribution via the Microsoft Store |

---

## 🏗️ Architecture

```
TheWeatherChannelonWindows/
├── electron/               # Electron main process (desktop shell)
│   ├── main.ts             # BrowserWindow creation + embedded Express server
│   └── preload.ts          # Context bridge (secure IPC)
├── src/                    # React frontend (Vite + Tailwind CSS)
│   ├── App.tsx             # Root component, state management
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── components/         # UI components
│   │   ├── TitleBar.tsx        # Custom Windows title bar + city search
│   │   ├── NavigationView.tsx  # Fluent sidebar navigation pane
│   │   ├── WeatherDashboard.tsx
│   │   ├── TrendsView.tsx
│   │   ├── AIBroadcastView.tsx
│   │   ├── StorePackager.tsx
│   │   ├── ToastManager.tsx
│   │   └── WeatherMap.tsx
│   └── utils/
│       └── weatherUtils.ts # WMO code mapping, date formatters
├── server.ts               # Express API proxy (geocoding, weather, Gemini)
├── assets/                 # App icons and store images
├── docs/                   # Additional documentation
│   ├── ARCHITECTURE.md
│   └── STORE_SUBMISSION.md
└── electron-builder.yml    # MSIX / Windows Store packaging config
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a detailed breakdown of the data flow.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18  ([nodejs.org](https://nodejs.org))
- **npm** ≥ 9
- A **Gemini API key** ([aistudio.google.com](https://aistudio.google.com)) — optional but recommended for AI briefings

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your key:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** The app works without a Gemini key — it will show a static fallback briefing instead of an AI-generated one.

### 3. Run in development mode

```bash
npm run dev
```

This starts the Express backend + Vite dev server together at `http://localhost:3000`.

### 4. Run as a desktop app (Electron)

```bash
npm run electron:dev
```

Opens the app in an Electron window with the full native desktop experience.

---

## 🏪 Building for the Microsoft Store

The app packages as an **MSIX** via Electron Builder. See the full guide in [`docs/STORE_SUBMISSION.md`](docs/STORE_SUBMISSION.md).

**Quick build:**

```bash
# 1. Build the frontend + backend
npm run build

# 2. Package as MSIX (requires Windows)
npm run electron:pack
```

The `.msix` file will be output to `dist-electron/`. Submit it to [Microsoft Partner Center](https://partner.microsoft.com/dashboard).

---

## 🔌 API Reference

The Express backend (`server.ts`) exposes two endpoints:

### `GET /api/geocode?q=<city>`

Resolves city names to GPS coordinates via the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api).

| Parameter | Type | Description |
|---|---|---|
| `q` | `string` | City name to search (e.g. `Seattle`) |

**Response:**
```json
{
  "results": [
    { "id": 5809844, "name": "Seattle", "latitude": 47.6062, "longitude": -122.3321, ... }
  ]
}
```

### `GET /api/weather?lat=<lat>&lon=<lon>&city=<city>`

Fetches forecast data from [Open-Meteo](https://open-meteo.com) and optionally appends a Gemini AI briefing.

| Parameter | Type | Description |
|---|---|---|
| `lat` | `number` | Latitude |
| `lon` | `number` | Longitude |
| `city` | `string` | City name (used for the AI briefing prompt) |

**Response:**
```json
{
  "weather": { "current": {...}, "hourly": {...}, "daily": {...} },
  "briefing": "The Weather Channel broadcast text...",
  "provider": "Open-Meteo & The Weather Channel Grounded Index"
}
```

---

## 🧰 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Express + Vite HMR) at `http://localhost:3000` |
| `npm run build` | Build frontend to `dist/` and compile backend to `dist/server.cjs` |
| `npm run start` | Run production build (`node dist/server.cjs`) |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run electron:dev` | Run app in Electron with live-reload |
| `npm run electron:build` | Compile Electron TypeScript sources |
| `npm run electron:pack` | Full MSIX package build for Windows Store |

---

## 🎨 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Motion
- **Backend:** Node.js, Express, Open-Meteo API, Google Gemini AI (`@google/genai`)
- **Desktop:** Electron, electron-builder (MSIX target)
- **Design System:** Fluent Design / WinUI aesthetics

---

## 📋 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI weather briefings |
| `PORT` | Optional | Override default port `3000` |
| `NODE_ENV` | Auto-set | `development` or `production` |

---

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE) or the SPDX headers in each source file.
