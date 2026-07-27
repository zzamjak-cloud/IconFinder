export const deErrorTranslations = {
  'error.unknown': 'Unbekannter Fehler',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'Icon-Suche fehlgeschlagen',
  'error.svgDownloadFailed': 'SVG konnte nicht heruntergeladen werden',
  'error.collectionsFailed': 'Die Sammlungsliste konnte nicht abgerufen werden',
  'error.noFilePath': 'Es wurde kein Dateipfad ausgewählt',
  'error.invalidBackup': 'Dies ist keine gültige Sicherungsdatei.',
  'error.backupInvalidFormat': 'Das Format ist nicht gültig.',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'Das SVG-Wurzelelement wurde nicht gefunden.',
  'error.svg.notSvg': 'Das Wurzelelement ist kein svg.',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'Das Test-SVG konnte nicht geparst werden: {detail}',
  'error.rust.svgParse': 'Das SVG konnte nicht geparst werden: {detail}',
  'error.rust.zeroSize': 'Die SVG-Größe ist null',
  'error.rust.pixmap': 'Die Pixmap konnte nicht erstellt werden',
  'error.rust.noPixels': 'Das gerenderte Bild enthält keine Pixel',
  'error.rust.pngEncode': 'Das PNG konnte nicht codiert werden: {detail}',
  'error.rust.fileSave': 'Die Datei konnte nicht gespeichert werden: {detail}',
  'error.rust.fileRead': 'Die Datei konnte nicht gelesen werden: {detail}',
  'error.rust.noDownloadDir': 'Der Downloads-Ordner wurde nicht gefunden',
  'error.rust.createDir': 'Der Ordner konnte nicht erstellt werden: {detail}',
  'error.rust.pathConvert': 'Der Pfad konnte nicht in eine Zeichenfolge umgewandelt werden',
  'error.rust.icoSize': 'ICO-Größe muss zwischen 16 und 256 liegen',
  'error.rust.icoEncode': 'ICO-Datei konnte nicht erstellt werden: {detail}',
  'error.rust.icnsSize': 'ICNS-Größe muss zwischen 16 und 1024 liegen',
  'error.rust.icnsEncode': 'ICNS-Datei konnte nicht erstellt werden: {detail}',
} as const;
