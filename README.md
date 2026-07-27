# IconFinder

**English** · [한국어](README.ko.md)

**Website:** [zzamjak-cloud.github.io/IconFinder](https://zzamjak-cloud.github.io/IconFinder/) — product overview, install guide, and feature walkthrough (KO/EN).

A desktop icon workspace: search 275,000+ Iconify icons, organize them into a library, style them, and export as SVG/PNG — all in one screen.

> IconFinder is the successor to [IconMaker](https://github.com/zzamjak-cloud/IconMaker), merging its separate Search and Editor tabs into a single unified workspace.

## The workspace

One three-pane screen instead of tabs:

### 📚 Library (left)
- Organize icons by category (20 built-in categories aimed at casual games, plus Uncategorized)
- ☆ **Favorites smart view** — every starred icon across all categories in one place
- Drag icons between categories; per-category sprite-sheet export
- Selecting a category auto-fills a recommended search term

### 🔍 Search (center)
- One search across the entire Iconify API (275,000+ icons)
- **Scope chips**: All / curated packs (Game, UI/HUD, Pixel, System, Emoji) / any single collection
- Korean search terms are auto-expanded to English Iconify tags
- Paginated, virtualized results grid with adjustable columns
- ★ on a result saves it straight into Uncategorized as a favorite; save puts it in the selected category

### 🎛️ Detail (right)
- **Quick export** by default: SVG/PNG with size control — search results export the original, library icons export with their saved style
- Expandable **Style** section: color mode (original / solid / duotone / gradient / 3D), effects (drop shadow · outer/inner glow · bevel · outline) with per-effect color and intensity, 108-color palette with HEX input
- Copy as SVG / HTML / CSS; batch export any selection or category

### ⚙️ Settings · Backup
- 11-language UI, auto-detected from the OS locale, switchable in Settings
- Default save folder with auto-save
- Full settings backup/restore as a single JSON file — IconMaker (v1) backups import cleanly, favorites included
- Data survives app updates (Tauri Store)

## Tech Stack

- **Frontend**: Tauri 2.0 + React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Lucide
- **State**: TanStack Query + Zustand
- **Backend**: Rust + resvg (SVG→PNG)
- **Persistence**: Tauri Store Plugin

## Download

- **macOS / Windows:** [GitHub Releases](https://github.com/zzamjak-cloud/IconFinder/releases/latest)
- Install steps (Gatekeeper / SmartScreen): [Website → Install](https://zzamjak-cloud.github.io/IconFinder/#install)

## Development

```bash
npm install
npm run tauri dev      # run in development
npm run tauri build    # production build
npx tsc --noEmit       # type check
```

## GitHub Pages

The public site lives in [`docs/`](./docs/) and is published from the `main` branch `/docs` folder.

## License

Each icon is licensed under the policy of its own icon set (Iconify collection).
