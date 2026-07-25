export const zhCNSettingsTranslations = {
  'settings.title': '设置',
  'settings.button.aria': '设置',
  'settings.general': '常规',

  'settings.defaultFolder': '默认保存文件夹',
  'settings.defaultFolder.placeholder': '未选择',
  'settings.defaultFolder.dialogTitle': '选择默认保存文件夹',
  'settings.defaultFolder.help':
    '设置图标的保存位置。设定默认文件夹后，导出的文件会自动保存到该文件夹。',

  'settings.exportDefaults': '默认导出设置',
  'settings.format': '默认格式',
  'settings.pngSize': '默认 PNG 尺寸',
  'settings.color': '默认颜色',

  'settings.backup': '备份与恢复',
  'settings.backup.help':
    '将收藏、导出设置以及 SVG 工作区（分类和已保存的图标）备份到单个文件中。应用更新时设置会自动保留，而备份文件可用于迁移到其他电脑或恢复数据。',
  'settings.backup.export': '导出备份',
  'settings.backup.import': '恢复备份',
  'settings.backup.saveDialogTitle': '保存设置备份',
  'settings.backup.openDialogTitle': '选择要恢复的备份文件',
  'settings.backup.saved': '备份已保存。（包含 {count} 个已保存图标）',
  'settings.backup.failed': '备份失败：{error}',
  'settings.backup.readFailed': '读取恢复文件失败：{error}',
  'settings.backup.restoreFailed': '恢复失败：{error}',
  'settings.backup.restoreWarning':
    '从 {fileName} 恢复会覆盖当前的所有设置。恢复完成后应用将重新加载。',
  'settings.backup.restoreApply': '执行恢复',

  // 라이선스 안내 (LicenseDialog)
  'license.button': '许可协议',
  'license.title': '图标许可政策',
  'license.intro':
    '本应用的图标来自 Iconify 开源图标集。各图标集的许可协议不同，使用前请先查看下方说明，商业用途尤需注意。',
  'license.curated.title': '精选图标集',
  'license.table.collection': '图标集',
  'license.table.license': '许可协议',
  'license.table.commercial': '商业用途',
  'license.table.obligation': '义务',
  'license.free': '✅ 自由使用',
  'license.conditional': '✅ 有条件使用',
  'license.note.copyright': '保留版权声明',
  'license.note.notice': '保留声明',
  'license.note.attribution': '必须署名',
  'license.note.shareAlike': '署名 + 相同方式共享',

  'license.types.title': '许可协议类型',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    '基本可自由用于商业用途。只需保留许可协议文本和版权声明。',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': '可自由使用，但必须署名原作者。',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    '需要署名，且衍生作品也必须以相同许可协议发布——用于商业产品时请格外注意。',

  'license.unified.title': '⚠️ 关于“全部”搜索的注意事项',
  'license.unified.p1':
    '默认的“全部”搜索会覆盖所有 Iconify 图标集（约 150 个图标集、275,000 多个图标），因此结果中可能出现上述九个图标集以外的图标。',
  'license.unified.p2':
    '这种情况下许可协议差异很大，且应用中可能不会显示。',
  'license.unified.p3':
    '品牌和标志类图标集即使采用开源许可协议也未必可以自由使用，因为商标权是单独适用的。',

  'license.recommend.title': '使用建议',
  'license.recommend.item1': '精选图标集，尤其是 MIT/Apache 系列，通常可以放心使用。',
  'license.recommend.item2':
    '请遵守 Game-icons 的署名要求以及 OpenMoji 的相同方式共享条件。',
  'license.recommend.item3':
    '用于商业用途时，请在各图标卡片的“查看原始页面”中确认准确的许可协议。',
  'license.disclaimer':
    '本说明不构成法律意见。请在各图标集的原始许可协议中确认准确条款。',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': '有可用更新',
  'update.title.downloading': '正在下载...',
  'update.title.installing': '正在安装...',
  'update.title.error': '更新失败',
  'update.downloading.body': '正在下载更新...',
  'update.installing.body': '正在安装更新，请稍等...',
  'update.changelog': '在 GitHub 上查看更新日志',
  'update.later': '稍后',
  'update.now': '立即更新',
  'update.checkFailed': '检查更新失败',
  'update.failed': '更新失败',
} as const;
