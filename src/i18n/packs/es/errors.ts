export const esErrorTranslations = {
  'error.unknown': 'Error desconocido',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'La búsqueda de iconos ha fallado',
  'error.svgDownloadFailed': 'No se ha podido descargar el SVG',
  'error.collectionsFailed': 'No se ha podido obtener la lista de colecciones',
  'error.noFilePath': 'No se ha seleccionado ninguna ruta de archivo',
  'error.invalidBackup': 'Este no es un archivo de copia de seguridad válido.',
  'error.backupInvalidFormat': 'El formato no es válido.',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'No se ha encontrado la etiqueta raíz del SVG.',
  'error.svg.notSvg': 'El elemento raíz no es un svg.',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'No se ha podido analizar el SVG de prueba: {detail}',
  'error.rust.svgParse': 'No se ha podido analizar el SVG: {detail}',
  'error.rust.zeroSize': 'El tamaño del SVG es cero',
  'error.rust.pixmap': 'No se ha podido crear el pixmap',
  'error.rust.noPixels': 'La imagen renderizada no tiene píxeles',
  'error.rust.pngEncode': 'No se ha podido codificar el PNG: {detail}',
  'error.rust.fileSave': 'No se ha podido guardar el archivo: {detail}',
  'error.rust.fileRead': 'No se ha podido leer el archivo: {detail}',
  'error.rust.noDownloadDir': 'No se ha encontrado la carpeta de Descargas',
  'error.rust.createDir': 'No se ha podido crear la carpeta: {detail}',
  'error.rust.pathConvert': 'No se ha podido convertir la ruta en texto',
} as const;
