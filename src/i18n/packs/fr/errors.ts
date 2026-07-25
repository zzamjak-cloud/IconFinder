export const frErrorTranslations = {
  'error.unknown': 'Erreur inconnue',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': "Échec de la recherche d'icônes",
  'error.svgDownloadFailed': 'Échec du téléchargement du SVG',
  'error.collectionsFailed': 'Échec de la récupération de la liste des collections',
  'error.noFilePath': "Aucun chemin de fichier n'a été sélectionné",
  'error.invalidBackup': "Ce fichier de sauvegarde n'est pas valide.",
  'error.backupInvalidFormat': "Le format n'est pas valide.",

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'Impossible de trouver la balise racine SVG.',
  'error.svg.notSvg': "L'élément racine n'est pas un svg.",

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': "Échec de l'analyse du SVG de test : {detail}",
  'error.rust.svgParse': "Échec de l'analyse du SVG : {detail}",
  'error.rust.zeroSize': 'La taille du SVG est nulle',
  'error.rust.pixmap': 'Échec de la création du pixmap',
  'error.rust.noPixels': "L'image rendue ne contient aucun pixel",
  'error.rust.pngEncode': "Échec de l'encodage du PNG : {detail}",
  'error.rust.fileSave': "Échec de l'enregistrement du fichier : {detail}",
  'error.rust.fileRead': 'Échec de la lecture du fichier : {detail}',
  'error.rust.noDownloadDir': 'Impossible de trouver le dossier Téléchargements',
  'error.rust.createDir': 'Échec de la création du dossier : {detail}',
  'error.rust.pathConvert': 'Impossible de convertir le chemin en chaîne',
} as const;
