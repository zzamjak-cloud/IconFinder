export const enErrorTranslations = {
  'error.unknown': 'Unknown error',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'Icon search failed',
  'error.svgDownloadFailed': 'Failed to download SVG',
  'error.collectionsFailed': 'Failed to fetch the collection list',
  'error.noFilePath': 'No file path was selected',
  'error.invalidBackup': 'This is not a valid backup file.',
  'error.backupInvalidFormat': 'The format is not valid.',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'Could not find the SVG root tag.',
  'error.svg.notSvg': 'The root element is not an svg.',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'Failed to parse the test SVG: {detail}',
  'error.rust.svgParse': 'Failed to parse the SVG: {detail}',
  'error.rust.zeroSize': 'The SVG size is zero',
  'error.rust.pixmap': 'Failed to create the pixmap',
  'error.rust.noPixels': 'The rendered image has no pixels',
  'error.rust.pngEncode': 'Failed to encode the PNG: {detail}',
  'error.rust.fileSave': 'Failed to save the file: {detail}',
  'error.rust.fileRead': 'Failed to read the file: {detail}',
  'error.rust.noDownloadDir': 'Could not find the Downloads folder',
  'error.rust.createDir': 'Failed to create the folder: {detail}',
  'error.rust.pathConvert': 'Could not convert the path to a string',
} as const;
