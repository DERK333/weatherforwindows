# Architecture Overview

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Electron Shell (main.ts)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  BrowserWindow  (loads http://localhost:3000)           │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │          React Frontend  (Vite + Tailwind)         │ │ │
│  │  │                                                    │ │ │
│  │  │  App.tsx ──► TitleBar, NavigationView              │ │ │
│  │  │         └──► WeatherDashboard                      │ │ │
│  │  │         └──► TrendsView                            │ │ │
│  │  │         └──► AIBroadcastView                       │ │ │
│  │  │         └──► StorePackager                         │ │ │
│  │  │         └──► Settings panel                        │ │ │
│  │  └─────────────────────┬──────────────────────────────┘ │ │
│  └────────────────────────│────────────────────────────────┘ │
│                           │ fetch() API calls                 │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │               Express Backend  (server.ts)              │ │
│  │                                                         │ │
│  │  GET /api/geocode  ──► open-meteo.com/geocoding         │ │
│  │  GET /api/weather  ──► api.open-meteo.com/forecast      │ │
│  │                    └──► Gemini AI (briefing)            │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend (`src/`)

### State Management

State lives in `App.tsx` and flows down as props — no external state library is used.

| State | Type | Description |
|---|---|---|
| `darkMode` | `boolean` | Global Fluent dark/light theme toggle |
| `activeTab` | `string` | Currently selected navigation pane item |
| `locationsList` | `GeocodedLocation[]` | Autocomplete results from geocoding |
| `activeLocation` | `GeocodedLocation \| null` | Currently selected city |
| `weatherData` | `WeatherResponse \| null` | Full forecast payload for the active city |
| `toasts` | `AppToast[]` | Queue of Action Center-style toast notifications (max 5) |

### Data Flow

```
User types city → TitleBar onSearchCity
  → App.handleSearchCity
    → GET /api/geocode?q=<query>
      → setLocationsList(results)
        → TitleBar shows dropdown

User clicks location → TitleBar onSelectLocation
  → App.handleSelectLocation
    → GET /api/weather?lat=&lon=&city=
      → setWeatherData(response)
        → WeatherDashboard / TrendsView / AIBroadcastView re-render
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| `TitleBar` | Custom Windows title bar: app icon, city search, theme toggle |
| `NavigationView` | Fluent left NavigationView pane with collapsible items |
| `WeatherDashboard` | Current conditions hero card + hourly + 7-day daily forecast |
| `TrendsView` | Recharts line/bar charts for temperature, precipitation, UV |
| `AIBroadcastView` | Renders the Gemini AI markdown briefing with broadcast styling |
| `StorePackager` | Form → generates `Package.appxmanifest` XML for Store submission |
| `ToastManager` | Renders Windows-style toast notifications (bottom-right) |
| `WeatherMap` | Map widget placeholder for radar overlays |

---

## Backend (`server.ts`)

The Express server acts as a **secure proxy** — it keeps external API keys server-side and handles CORS for the frontend.

### Endpoints

#### `GET /api/geocode`

Proxies to `https://geocoding-api.open-meteo.com/v1/search`. Returns up to 8 matched locations. No API key required.

#### `GET /api/weather`

1. Calls `https://api.open-meteo.com/v1/forecast` with the full variable set (current, hourly, daily).
2. If `GEMINI_API_KEY` is configured, sends a structured meteorologist prompt to `gemini-2.5-flash` with Google Search grounding enabled.
3. Returns a combined `{ weather, briefing, provider }` response.

---

## Electron Desktop Shell (`electron/`)

| File | Role |
|---|---|
| `electron/main.ts` | App entry point — spawns Express server, creates `BrowserWindow`, handles lifecycle |
| `electron/preload.ts` | Runs in renderer context with `contextIsolation: true`; exposes a safe `window.electronAPI` bridge |

### Startup Sequence

```
app.whenReady()
  → startExpressServer()   // spawns dist/server.cjs via child_process
  → waitForServer()        // polls http://localhost:3000 until ready
  → createWindow()         // BrowserWindow loads http://localhost:3000
```

### Window Settings

- `frame: false` — Custom TitleBar component draws the window chrome
- `titleBarOverlay` — Uses Windows system overlay for minimize/maximize/close buttons
- `minWidth: 960, minHeight: 640` — Minimum sensible layout size
- `backgroundColor: '#1a1b1e'` — Matches dark theme to prevent flash

---

## Type System (`src/types.ts`)

All shared data shapes are defined as TypeScript interfaces:

- `GeocodedLocation` — City search result from the geocoding API
- `CurrentWeather` — Snapshot of current conditions (WMO codes, temperature, wind, etc.)
- `HourlyForecast` — Arrays of hourly forecast values (parallel arrays keyed by `time[]`)
- `DailyForecast` — 7-day summary arrays
- `WeatherData` — Full Open-Meteo response envelope
- `WeatherResponse` — Backend response combining `WeatherData + briefing`
- `AppToast` — Toast notification payload
- `LiveTileState` — Live tile configuration
- `StorePackageManifest` — Form state for the Store Packager tool

---

## Weather Code Mapping (`src/utils/weatherUtils.ts`)

WMO weather interpretation codes (0–99) are mapped to human-readable labels, Lucide icon keys, and Tailwind color classes via `getWeatherCondition(code)`. Covers: clear, partly cloudy, fog, drizzle, rain, snow, showers, thunderstorms.
