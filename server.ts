/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

/** Lazily-initialized Gemini AI client — created only when a valid API key is present. */
let aiClient: GoogleGenAI | null = null;

/**
 * Returns a shared GoogleGenAI instance, or `null` when `GEMINI_API_KEY` is absent
 * or still set to the placeholder value.
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or uses empty placeholder.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Geocoding Endpoint
app.get("/api/geocode", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query as string)}&count=8&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding service updated status to ${response.status}`);
    }
    const data = await response.json();
    const results = data.results || [];
    res.json({ results });
  } catch (error: any) {
    console.error("Geocoding failed:", error.message);
    res.status(500).json({ error: "Failed to resolve location details." });
  }
});

// 2. Weather Endpoint (Open-Meteo coordinates + optional Gemini TWC outlook analysis)
app.get("/api/weather", async (req, res) => {
  const { lat, lon, city } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude 'lat' and Longitude 'lon' parameters are required." });
  }

  try {
    // Call Open-Meteo API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather service returned ${weatherResponse.status}`);
    }
    const weatherData = await weatherResponse.json();

    // Try to append Gemini-powered Weather Channel grounded analysis
    let briefing = null;
    const ai = getGeminiClient();
    if (ai && city) {
      try {
        const currentTemp = weatherData.current?.temperature_2m;
        const currentHumidity = weatherData.current?.relative_humidity_2m;
        const windSpeed = weatherData.current?.wind_speed_10m;
        const prompt = `You are an elite, professional meteorologist presenting for "The Weather Channel", fully compliant with high-tier broadcast and store standards.
Give a premium, concise forecast outlook for "${city}" based on current data: Temperature ${currentTemp}°C, Relative humidity ${currentHumidity}%, Wind ${windSpeed} km/h.
Provide:
1. "The Weather Channel Broadcast Briefing": A 2-3 sentence overview highlighting the micro-climate feel and immediate conditions.
2. "Store-Compliant Weather Advice": Suggested action (for example: outdoor plans, commute risks, sunscreen levels, or heating requirements).
3. "Apparel Advisor": Tailored clothing recommendation for the temperature/weather (such as breathable layers, windbreakers, heavy jackets, or umbrellas).
Style it with authoritative but welcoming language. Include local details from your web knowledge search if suitable.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        if (response && response.text) {
          briefing = response.text;
        }
      } catch (aiError: any) {
        // Fallback briefing
        briefing = `Current outlook for ${city} features standard ambient conditions with temperature of ${weatherData.current?.temperature_2m}°C, humidity of ${weatherData.current?.relative_humidity_2m}% and gentle wind patterns. Consider carrying appropriate seasonal attire for current conditions.`;
      }
    } else {
      briefing = `Smart Weather Analyst is offline. Configure GEMINI_API_KEY for dynamic, live-grounded meteorological forecasts. Currently, temperature is ${weatherData.current?.temperature_2m}°C with apparent real-feel of ${weatherData.current?.apparent_temperature}°C.`;
    }

    res.json({
      weather: weatherData,
      briefing,
      provider: "Open-Meteo & The Weather Channel Grounded Index"
    });
  } catch (error: any) {
    console.error("Weather query failed:", error.message);
    res.status(500).json({ error: "Failed to load weather conditions." });
  }
});

// Serve frontend with Vite in development, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Windows Weather PC Server listening on http://localhost:${PORT}`);
  });
}

startServer();
