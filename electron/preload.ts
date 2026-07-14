/**
 * Electron preload script.
 *
 * Runs in the renderer's context with a restricted Node.js environment
 * (contextIsolation: true, nodeIntegration: false). Exposes a safe
 * `window.electronAPI` surface via contextBridge for any IPC the UI needs.
 *
 * Keep this minimal — only add entries when the renderer genuinely needs
 * to call into the main process.
 */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  /** Returns the Electron app version string (from package.json). */
  getVersion: () => ipcRenderer.invoke("app:version"),

  /** Platform identifier: 'win32' | 'darwin' | 'linux'. */
  platform: process.platform,
});
