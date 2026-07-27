export const ptErrorTranslations = {
  'error.unknown': 'Erro desconhecido',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'Falha na pesquisa de ícones',
  'error.svgDownloadFailed': 'Falha ao baixar o SVG',
  'error.collectionsFailed': 'Falha ao obter a lista de coleções',
  'error.noFilePath': 'Nenhum caminho de arquivo foi selecionado',
  'error.invalidBackup': 'Este não é um arquivo de backup válido.',
  'error.backupInvalidFormat': 'O formato não é válido.',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'Não foi possível encontrar a tag raiz do SVG.',
  'error.svg.notSvg': 'O elemento raiz não é um svg.',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'Falha ao analisar o SVG de teste: {detail}',
  'error.rust.svgParse': 'Falha ao analisar o SVG: {detail}',
  'error.rust.zeroSize': 'O tamanho do SVG é zero',
  'error.rust.pixmap': 'Falha ao criar o pixmap',
  'error.rust.noPixels': 'A imagem renderizada não tem pixels',
  'error.rust.pngEncode': 'Falha ao codificar o PNG: {detail}',
  'error.rust.fileSave': 'Falha ao salvar o arquivo: {detail}',
  'error.rust.fileRead': 'Falha ao ler o arquivo: {detail}',
  'error.rust.noDownloadDir': 'Não foi possível encontrar a pasta Downloads',
  'error.rust.createDir': 'Falha ao criar a pasta: {detail}',
  'error.rust.pathConvert': 'Não foi possível converter o caminho em texto',
  'error.rust.icoSize': 'O tamanho ICO deve estar entre 16 e 256',
  'error.rust.icoEncode': 'Falha ao criar o arquivo ICO: {detail}',
  'error.rust.icnsSize': 'O tamanho ICNS deve estar entre 16 e 1024',
  'error.rust.icnsEncode': 'Falha ao criar o arquivo ICNS: {detail}',
} as const;
