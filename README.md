# IconFinder

**English** · [한국어](README.ko.md)

A desktop app for searching, styling, and exporting icons as SVG/PNG, powered by the Iconify library.

## Features

### 🔍 Icon Search (Search tab)
- Search 275,000+ icons through the Iconify API
- Favorites and caching
- Export as SVG / PNG, plus batch export
- Adjustable grid column count (image scale follows the column ratio)

### 🎨 SVG Workspace (Editor tab)
- Collect and organize icons by category (20 built-in categories aimed at casual games)
- Selecting a category auto-fills a recommended English search term
- **Styling**: color mode (original / solid / duotone), gradient, and 3D combined into a single style selector
- **Effects** (SVG filters, compatible with HTML and PNG): drop shadow · outer/inner glow · bevel (embossed/engraved) · outline
  - Per-effect color and intensity control; shadows include the outline, while inner glow is based on the content
- **Custom color picker**: 108-color palette plus direct selection / HEX input
- Export: individual SVG/PNG, sprite sheet, HTML snippet / Copy: SVG, HTML, CSS

### ⚙️ Settings · Backup
- Default save folder and auto-save
- Full settings backup/restore (favorites, export settings, and the SVG workspace as JSON)
- Data survives app updates (Tauri Store)

## Tech Stack

- **Frontend**: Tauri 2.0 + React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Lucide
- **State**: TanStack Query + Zustand
- **Backend**: Rust + resvg (SVG→PNG)
- **Persistence**: Tauri Store Plugin

## Development

```bash
npm install
npm run tauri dev      # run in development
npm run tauri build    # production build
npx tsc --noEmit       # type check
```

## License

Each icon is licensed under the policy of its own icon set (Iconify collection).
