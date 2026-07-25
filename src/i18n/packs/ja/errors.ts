export const jaErrorTranslations = {
  'error.unknown': '不明なエラー',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': 'アイコン検索に失敗しました',
  'error.svgDownloadFailed': 'SVG のダウンロードに失敗しました',
  'error.collectionsFailed': 'コレクション一覧の取得に失敗しました',
  'error.noFilePath': 'ファイルパスが選択されていません',
  'error.invalidBackup': '有効なバックアップファイルではありません。',
  'error.backupInvalidFormat': '形式が正しくありません。',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': 'SVG のルートタグが見つかりませんでした。',
  'error.svg.notSvg': 'ルート要素が svg ではありません。',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': 'テスト SVG の解析に失敗しました: {detail}',
  'error.rust.svgParse': 'SVG の解析に失敗しました: {detail}',
  'error.rust.zeroSize': 'SVG のサイズがゼロです',
  'error.rust.pixmap': 'ピクスマップの作成に失敗しました',
  'error.rust.noPixels': 'レンダリングされた画像にピクセルがありません',
  'error.rust.pngEncode': 'PNG のエンコードに失敗しました: {detail}',
  'error.rust.fileSave': 'ファイルの保存に失敗しました: {detail}',
  'error.rust.fileRead': 'ファイルの読み込みに失敗しました: {detail}',
  'error.rust.noDownloadDir': 'ダウンロードフォルダが見つかりませんでした',
  'error.rust.createDir': 'フォルダの作成に失敗しました: {detail}',
  'error.rust.pathConvert': 'パスを文字列に変換できませんでした',
} as const;
