# App Icon Assets

Place the following image files in this folder before running `npm run electron:pack`.

All icons should use the **blue cloud/weather theme** (`#0078d4` background).

## Required files

| Filename | Size | Format | Usage |
|---|---|---|---|
| `icon.png` | 512×512 | PNG | High-res source; used by Electron on Linux/macOS |
| `icon.ico` | 256×256 | ICO | Windows taskbar + window chrome |
| `icon.icns` | — | ICNS | macOS (multi-resolution bundle) |
| `StoreLogo.png` | 50×50 | PNG | Microsoft Store listing icon |
| `Square44x44Logo.png` | 44×44 | PNG | Windows taskbar + title bar |
| `Square150x150Logo.png` | 150×150 | PNG | Start menu medium tile |
| `Wide310x150Logo.png` | 310×150 | PNG | Start menu wide tile |
| `Square310x310Logo.png` | 310×310 | PNG | Start menu large tile |
| `SplashScreen.png` | 620×300 | PNG | App launch splash screen |

## Generating icons

Use any of these free tools to batch-generate all sizes from a single 512×512 source:

- [PWABuilder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- ImageMagick CLI: `magick icon.png -resize 44x44 Square44x44Logo.png`
