export const itErrorTranslations = {
  'error.unknown': 'Errore sconosciuto',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'Ricerca icone non riuscita',
  'error.svgDownloadFailed': 'Download dello SVG non riuscito',
  'error.collectionsFailed': "Recupero dell'elenco delle raccolte non riuscito",
  'error.noFilePath': 'Nessun percorso file selezionato',
  'error.invalidBackup': 'Questo non è un file di backup valido.',
  'error.backupInvalidFormat': 'Il formato non è valido.',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'Impossibile trovare il tag radice SVG.',
  'error.svg.notSvg': "L'elemento radice non è un elemento svg.",

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'Analisi dello SVG di test non riuscita: {detail}',
  'error.rust.svgParse': 'Analisi dello SVG non riuscita: {detail}',
  'error.rust.zeroSize': 'La dimensione dello SVG è zero',
  'error.rust.pixmap': 'Creazione della pixmap non riuscita',
  'error.rust.noPixels': "L'immagine renderizzata non contiene pixel",
  'error.rust.pngEncode': 'Codifica del PNG non riuscita: {detail}',
  'error.rust.fileSave': 'Salvataggio del file non riuscito: {detail}',
  'error.rust.fileRead': 'Lettura del file non riuscita: {detail}',
  'error.rust.noDownloadDir': 'Impossibile trovare la cartella Download',
  'error.rust.createDir': 'Creazione della cartella non riuscita: {detail}',
  'error.rust.pathConvert': 'Impossibile convertire il percorso in una stringa',
  'error.rust.icoSize': 'La dimensione ICO deve essere tra 16 e 256',
  'error.rust.icoEncode': 'Creazione del file ICO non riuscita: {detail}',
  'error.rust.icnsSize': 'La dimensione ICNS deve essere tra 16 e 1024',
  'error.rust.icnsEncode': 'Creazione del file ICNS non riuscita: {detail}',
} as const;
