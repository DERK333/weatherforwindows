/**
 * Electron main process — entry point for the desktop application.
 *
 * Startup sequence:
 *   1. Spawn the compiled Express server (dist/server.cjs) as a child process.
 *   2. Poll http://localhost:PORT until the server responds (max ~10 s).
 *   3. Open a frameless BrowserWindow and load the app URL.
 */

import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import http from "http";

const PORT = Number(process.env.PORT) || 3000;
const APP_URL = `http://localhost:${PORT}`;
const MAX_WAIT_MS = 15_000;
const POLL_INTERVAL_MS = 300;

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

// ---------------------------------------------------------------------------
// Server management
// ---------------------------------------------------------------------------

/** Spawns the compiled Express backend as a child process. */
function startExpressServer(): void {
  const serverCjs = path.join(__dirname, "..", "dist", "server.cjs");
  serverProcess = spawn("node", [serverCjs], {
    env: { ...process.env, NODE_ENV: "production", PORT: String(PORT) },
    stdio: "inherit",
  });

  serverProcess.on("error", (err) => {
    console.error("[Electron] Failed to start server process:", err.message);
  });

  serverProcess.on("exit", (code) => {
    console.log(`[Electron] Server process exited with code ${code}`);
  });
}

/**
 * Polls the app URL until it responds with HTTP 200 (or any non-error status).
 * Resolves once ready, rejects after `MAX_WAIT_MS`.
 */
function waitForServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const poll = () => {
      http
        .get(APP_URL, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve();
          } else {
            retry();
          }
        })
        .on("error", retry);
    };

    const retry = () => {
      if (Date.now() - start > MAX_WAIT_MS) {
        reject(new Error(`Server did not respond within ${MAX_WAIT_MS} ms`));
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
  });
}

// ---------------------------------------------------------------------------
// Window management
// ---------------------------------------------------------------------------

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    // The React app draws its own custom TitleBar — hide the native frame chrome.
    frame: false,
    // Keep system window buttons (minimize / maximize / close) via overlay.
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#1a1b1e",
      symbolColor: "#ffffff",
      height: 44,
    },
    backgroundColor: "#1a1b1e",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: path.join(__dirname, "..", "assets", "icons", "icon.png"),
    show: false, // Wait until ready-to-show to avoid white flash
  });

  mainWindow.loadURL(APP_URL);

  // Show once fully rendered to avoid white-flash on startup
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Open external links in the default browser instead of a new Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(async () => {
  startExpressServer();

  try {
    await waitForServer();
  } catch (err) {
    console.error("[Electron] Server startup timed out:", err);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
