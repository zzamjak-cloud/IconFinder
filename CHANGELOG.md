# Changelog

**English** · [한국어](CHANGELOG.ko.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-language support (i18n) for 11 languages: English, Korean, Japanese, Simplified Chinese, Traditional Chinese, Spanish, French, German, Russian, Portuguese, Italian
  - The display language is auto-detected from the OS locale on first launch and can be changed from the Settings dialog
  - The selected language persists via Tauri Store

### Changed
- The auto-update dialog no longer shows inline release notes; it links to the CHANGELOG on GitHub instead
- English is now the primary language for the README and CHANGELOG, with Korean available as `README.ko.md` / `CHANGELOG.ko.md`

## [0.3.1] - 2026-06-30

### Fixed
- Fixed saved icons in the Editor tab being lost when the app restarted for an auto-update
  - Pending workspace writes are now flushed to disk right before the restart
  - On a failed load, existing data is no longer overwritten with defaults
  - Saves immediately when the window is hidden, the app exits, or tabs are switched

## [0.3.0] - 2026-06-30

### Added
- Pagination for search results (full name lookup plus per-page SVG loading, with previous/numbered/next controls)
- License information dialog and a "License" button in the header (per-collection licenses, with a caveat for unified search)
- Custom color picker now also applies to effect colors (shadow/glow) and outline color

### Changed
- Fixed the number of search results shown to 100 (removed the 24/48/72 dropdown)
- Changed the default search source to "Unified" and moved it to the top of the list
- Repositioned the custom color picker popup to stay within the viewport (fixes it being cut off)
- Inner glow is now based on the content (excluding the outline), while shadow and outer glow include the outline

### Removed
- The "saved icon filter" input (unnecessary)
- The search-complete toast notification (removed UX jitter)

## [0.2.0] - 2026-06-30

### Added
- **SVG Workspace (Editor tab)**: ported StyleStudio's SVG session feature into a single panel
  - Collect and organize icons by category, with 20 built-in categories aimed at casual games
  - Selecting a category auto-fills a recommended English search term (more accurate than Korean)
  - Export as SVG/PNG/sprite sheet/HTML snippet, and copy as SVG, HTML, or CSS
- **Style effects system** (SVG filter based, compatible with HTML and PNG):
  - Drop shadow, outer/inner glow, bevel (embossed/engraved) — each with color and intensity control
  - Outline effect (color and width); shadows include the outline, while inner glow is based on the content
  - Color mode (original/solid/duotone) and finish (gradient/3D) combined into a single style selector
- **Custom color picker**: 108-color palette popup plus direct selection / HEX input
- **Full settings backup/restore**: back up and restore favorites, export settings, and the SVG workspace as JSON
- Search/Editor view toggle, and image scaling that matches the grid column ratio

### Changed
- Moved the grid slider to the search results row and center-aligned the header tabs
- Disabled controls that are irrelevant to the active tab (search-only controls are hidden in the Editor tab)

## [0.1.2] - 2026-02-05

### Fixed
- Fixed a PNG export bug

## [0.1.1] - 2026-02-05

### Added
- Built out the GitHub Actions CI/CD pipeline
- Auto-update system via Tauri Updater
- Version bump automation script (`npm run version:bump`)
- Update dialog UI component

### Changed
- Redesigned the app icon and updated the icons for all platforms
- Improved the development workflow

## [0.1.0] - 2026-02-05

### Added
- Initial project setup
- Icon search powered by the Iconify API
- Favorites
- SVG/PNG export
- Batch export
- Settings management (default folder, export options)
- Dark mode support

[unreleased]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/zzamjak-cloud/IconMaker/releases/tag/v0.1.0
