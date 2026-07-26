export const zhTWSettingsTranslations = {
  'settings.title': '設定',
  'settings.button.aria': '設定',
  'settings.general': '一般',
  'settings.theme': '主題',
  'settings.theme.light': '淺色',
  'settings.theme.dark': '深色',
  'settings.theme.system': '跟隨系統',

  'settings.defaultFolder': '預設儲存資料夾',
  'settings.defaultFolder.placeholder': '未選取',
  'settings.defaultFolder.dialogTitle': '選擇預設儲存資料夾',
  'settings.defaultFolder.help':
    '設定圖示儲存的資料夾。設定預設資料夾後，匯出的檔案會自動存到該處。',

  'settings.exportDefaults': '預設匯出設定',
  'settings.format': '預設格式',
  'settings.pngSize': '預設 PNG 尺寸',
  'settings.color': '預設顏色',

  'settings.backup': '備份與還原',
  'settings.backup.help':
    '將收藏、匯出設定與 SVG 工作區（分類與已儲存的圖示）備份成單一檔案。應用程式更新時會自動保留設定，而備份檔可讓你移轉到其他電腦或復原資料。',
  'settings.backup.export': '匯出備份',
  'settings.backup.import': '還原備份',
  'settings.backup.saveDialogTitle': '儲存設定備份',
  'settings.backup.openDialogTitle': '選擇要還原的備份檔',
  'settings.backup.saved': '備份已儲存。（包含 {count} 個已儲存的圖示）',
  'settings.backup.failed': '備份失敗：{error}',
  'settings.backup.readFailed': '無法讀取還原檔案：{error}',
  'settings.backup.restoreFailed': '還原失敗：{error}',
  'settings.backup.restoreWarning':
    '從 {fileName} 還原會覆寫你目前的所有設定。還原完成後應用程式會重新載入。',
  'settings.backup.restoreApply': '套用還原',

  // 라이선스 안내 (LicenseDialog)
  'license.button': '授權',
  'license.title': '圖示授權政策',
  'license.intro':
    '本應用程式的圖示來自 Iconify 開源集合。各集合的授權條款不同，使用前請詳閱以下說明，商業用途尤須留意。',
  'license.curated.title': '精選集合',
  'license.table.collection': '集合',
  'license.table.license': '授權',
  'license.table.commercial': '商業用途',
  'license.table.obligation': '義務',
  'license.free': '✅ 自由使用',
  'license.conditional': '✅ 有條件',
  'license.note.copyright': '版權聲明',
  'license.note.notice': '聲明',
  'license.note.attribution': '須標示出處',
  'license.note.shareAlike': '標示出處 + 相同方式分享',

  'license.types.title': '授權類型',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    '實務上可自由用於商業用途，只需保留授權條文與版權聲明。',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': '可自由使用，但必須標示創作者出處。',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    '除標示出處外，衍生作品也必須以相同授權釋出，用於商業產品時請特別留意。',

  'license.unified.title': '⚠️ 關於「All」搜尋的注意事項',
  'license.unified.p1':
    '預設的 All 搜尋涵蓋所有 Iconify 集合（約 150 個圖示集、275,000 個以上的圖示），因此結果中可能出現上述九個集合以外的圖示集。',
  'license.unified.p2':
    '這種情況下授權條款差異很大，且可能不會顯示在應用程式中。',
  'license.unified.p3':
    '品牌與標誌類圖示集即使採用開源授權也未必能自由使用，因為商標權另有規範。',

  'license.recommend.title': '建議事項',
  'license.recommend.item1': '精選圖示集（尤其是 MIT/Apache 系列）一般而言較為安全。',
  'license.recommend.item2':
    '請遵守 Game-icons 的出處標示要求，以及 OpenMoji 的相同方式分享條件。',
  'license.recommend.item3':
    '若用於商業用途，請在各圖示卡片的「檢視原始頁面」確認確切的授權條款。',
  'license.disclaimer':
    '本說明不構成法律意見。請在各集合的原始授權中確認確切條款。',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': '有可用的更新',
  'update.title.downloading': '正在下載...',
  'update.title.installing': '正在安裝...',
  'update.title.error': '更新失敗',
  'update.downloading.body': '正在下載更新...',
  'update.installing.body': '正在安裝更新，請稍候...',
  'update.changelog': '在 GitHub 上檢視更新日誌',
  'update.later': '稍後',
  'update.now': '立即更新',
  'update.checkFailed': '檢查更新失敗',
  'update.failed': '更新失敗',
} as const;
