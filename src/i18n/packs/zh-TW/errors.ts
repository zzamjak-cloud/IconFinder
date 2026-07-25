export const zhTWErrorTranslations = {
  'error.unknown': '未知的錯誤',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': '圖示搜尋失敗',
  'error.svgDownloadFailed': '無法下載 SVG',
  'error.collectionsFailed': '無法取得集合清單',
  'error.noFilePath': '未選擇檔案路徑',
  'error.invalidBackup': '這不是有效的備份檔。',
  'error.backupInvalidFormat': '格式無效。',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': '找不到 SVG 根標籤。',
  'error.svg.notSvg': '根元素不是 svg。',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': '無法解析測試 SVG：{detail}',
  'error.rust.svgParse': '無法解析 SVG：{detail}',
  'error.rust.zeroSize': 'SVG 尺寸為零',
  'error.rust.pixmap': '無法建立 pixmap',
  'error.rust.noPixels': '算繪出的影像沒有任何像素',
  'error.rust.pngEncode': '無法編碼 PNG：{detail}',
  'error.rust.fileSave': '無法儲存檔案：{detail}',
  'error.rust.fileRead': '無法讀取檔案：{detail}',
  'error.rust.noDownloadDir': '找不到下載資料夾',
  'error.rust.createDir': '無法建立資料夾：{detail}',
  'error.rust.pathConvert': '無法將路徑轉換為字串',
} as const;
