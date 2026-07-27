# Changelog

**English** · [한국어](CHANGELOG.ko.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> IconFinder is the successor to [IconMaker](https://github.com/zzamjak-cloud/IconMaker).
> It unifies IconMaker's separate Search and Editor tabs into a single icon workspace.
> For pre-1.0 history, see the IconMaker repository — its full git history is preserved here.

## [Unreleased]

## [1.0.2] - 2026-07-27

IconFinder is now open source, free for everyone.

### Added
- **MIT License** (`LICENSE`) — the app and its source code are free to use, modify and redistribute
- `THIRD-PARTY-NOTICES.md` — licenses of bundled third-party components (Lucide, shadcn/ui, Tauri, etc.)
- GitHub Pages product site (`docs/`) with introduction, install and usage guide
- Promotional video (`promo/IconFinder-Promo.mp4`)

### Changed
- README: license section now covers the MIT license and third-party notices; tech stack description fixed (Canvas rasterization + Rust ICO/ICNS encoding, not resvg)
- App favicon now uses the IconFinder app icon instead of the Vite scaffold logo

### Removed
- Leftover scaffold assets (`public/vite.svg`, `public/tauri.svg`, `src/assets/react.svg`)

## [1.0.0] - 2026-07-26

First release. Everything below describes the app as a whole.

### The unified workspace

IconMaker's two tabs (Search / Editor) — each with its own search, its own way of
keeping icons, and its own export path — are merged into one three-pane workspace:

- **Library** (left): categorized icon vault with a ☆ Favorites smart view
- **Search** (center): one search across all of Iconify with scope chips
  (All / curated packs / collection picker), Korean query expansion, pagination,
  and a virtualized results grid
- **Detail** (right): preview with quick export (SVG/PNG, size, color) by default,
  plus an expandable Style section (color modes, gradients, outline, glow, bevel)

### Behavior notes

- Starring a search result saves it into the **Uncategorized** category with the
  favorite flag set; organize later by dragging onto categories
- Quick export follows the item's state: search results export the original,
  library icons export with their saved style
- Batch export works on any selection or category (no longer favorites-only);
  sprite export stays per-category

### Inherited from IconMaker (0.x)

- 275,000+ icons via the Iconify API; per-collection license guidance
- SVG icon styling engine: color modes, gradient, outline, glow, bevel, style presets
- Multi-language support (i18n) for 11 languages, auto-detected from the OS locale,
  switchable in Settings, persisted via Tauri Store
- Settings backup/restore as a single file; default save folder with auto-save
- Auto-update via GitHub Releases; the update dialog links to this CHANGELOG

[unreleased]: https://github.com/zzamjak-cloud/IconFinder/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zzamjak-cloud/IconFinder/releases/tag/v1.0.0
