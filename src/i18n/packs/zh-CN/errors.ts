export const zhCNErrorTranslations = {
  'error.unknown': '未知错误',

  // Iconify API · 내보내기 · 저장소
  'error.iconSearchFailed': '图标搜索失败',
  'error.svgDownloadFailed': 'SVG 下载失败',
  'error.collectionsFailed': '获取图标集列表失败',
  'error.noFilePath': '未选择文件路径',
  'error.invalidBackup': '这不是有效的备份文件。',
  'error.backupInvalidFormat': '格式无效。',

  // SVG 검증 (svgSanitizer)
  'error.svg.noRoot': '找不到 SVG 根标签。',
  'error.svg.notSvg': '根元素不是 svg。',

  // Rust 커맨드가 반환하는 에러 코드 매핑 (src-tauri/src/commands/export.rs)
  'error.rust.testSvgParse': '解析测试 SVG 失败：{detail}',
  'error.rust.svgParse': '解析 SVG 失败：{detail}',
  'error.rust.zeroSize': 'SVG 尺寸为零',
  'error.rust.pixmap': '创建 pixmap 失败',
  'error.rust.noPixels': '渲染出的图像没有像素',
  'error.rust.pngEncode': 'PNG 编码失败：{detail}',
  'error.rust.fileSave': '保存文件失败：{detail}',
  'error.rust.fileRead': '读取文件失败：{detail}',
  'error.rust.noDownloadDir': '找不到下载文件夹',
  'error.rust.createDir': '创建文件夹失败：{detail}',
  'error.rust.pathConvert': '无法将路径转换为字符串',
} as const;
