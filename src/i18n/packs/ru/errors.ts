export const ruErrorTranslations = {
  'error.unknown': 'Неизвестная ошибка',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'Не удалось выполнить поиск иконок',
  'error.svgDownloadFailed': 'Не удалось скачать SVG',
  'error.collectionsFailed': 'Не удалось получить список коллекций',
  'error.noFilePath': 'Путь к файлу не выбран',
  'error.invalidBackup': 'Это некорректный файл резервной копии.',
  'error.backupInvalidFormat': 'Формат некорректен.',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'Не удалось найти корневой тег SVG.',
  'error.svg.notSvg': 'Корневой элемент не является svg.',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'Не удалось разобрать тестовый SVG: {detail}',
  'error.rust.svgParse': 'Не удалось разобрать SVG: {detail}',
  'error.rust.zeroSize': 'Размер SVG равен нулю',
  'error.rust.pixmap': 'Не удалось создать pixmap',
  'error.rust.noPixels': 'В отрисованном изображении нет пикселей',
  'error.rust.pngEncode': 'Не удалось закодировать PNG: {detail}',
  'error.rust.fileSave': 'Не удалось сохранить файл: {detail}',
  'error.rust.fileRead': 'Не удалось прочитать файл: {detail}',
  'error.rust.noDownloadDir': 'Не удалось найти папку «Загрузки»',
  'error.rust.createDir': 'Не удалось создать папку: {detail}',
  'error.rust.pathConvert': 'Не удалось преобразовать путь в строку',
} as const;
