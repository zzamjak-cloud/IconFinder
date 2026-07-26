export const enSettingsTranslations = {
  'settings.title': 'Settings',
  'settings.button.aria': 'Settings',
  'settings.general': 'General',
  'settings.theme': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.system': 'System',

  'settings.defaultFolder': 'Default save folder',
  'settings.defaultFolder.placeholder': 'Not selected',
  'settings.defaultFolder.dialogTitle': 'Select default save folder',
  'settings.defaultFolder.help':
    'Sets the folder where icons are saved. Once a default folder is set, exports are saved there automatically.',

  'settings.exportDefaults': 'Default export settings',
  'settings.format': 'Default format',
  'settings.pngSize': 'Default PNG size',
  'settings.color': 'Default color',

  'settings.backup': 'Backup and restore',
  'settings.backup.help':
    'Backs up your favorites, export settings, and SVG workspace (categories and saved icons) into a single file. Settings are kept automatically across app updates, and a backup file lets you move to another machine or recover your data.',
  'settings.backup.export': 'Export backup',
  'settings.backup.import': 'Restore backup',
  'settings.backup.saveDialogTitle': 'Save settings backup',
  'settings.backup.openDialogTitle': 'Select a backup file to restore',
  'settings.backup.saved': 'Backup saved. ({count} saved icons included)',
  'settings.backup.failed': 'Backup failed: {error}',
  'settings.backup.readFailed': 'Failed to read the restore file: {error}',
  'settings.backup.restoreFailed': 'Restore failed: {error}',
  'settings.backup.restoreWarning':
    'Restoring from {fileName} overwrites all of your current settings. The app reloads once the restore finishes.',
  'settings.backup.restoreApply': 'Apply restore',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'License',
  'license.title': 'Icon license policy',
  'license.intro':
    "This app's icons come from the Iconify open-source collections. Licenses differ from collection to collection, so please review the details below before use — especially for commercial use.",
  'license.curated.title': 'Curated collections',
  'license.table.collection': 'Collection',
  'license.table.license': 'License',
  'license.table.commercial': 'Commercial use',
  'license.table.obligation': 'Obligation',
  'license.free': '✅ Free',
  'license.conditional': '✅ Conditional',
  'license.note.copyright': 'Copyright notice',
  'license.note.notice': 'Notice',
  'license.note.attribution': 'Attribution required',
  'license.note.shareAlike': 'Attribution + share alike',

  'license.types.title': 'License types',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    'Effectively free for commercial use. You only need to keep the license text and copyright notice.',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': 'Free to use, but attribution to the creator is required.',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'Attribution, plus derivative works must also be released under the same license — take care with commercial products.',

  'license.unified.title': '⚠️ Note on "All" search',
  'license.unified.p1':
    'The default All search covers every Iconify collection (275,000+ icons across roughly 150 sets), so sets other than the nine above can appear in your results.',
  'license.unified.p2':
    'In that case licenses vary widely and may not be shown in the app.',
  'license.unified.p3':
    'Brand and logo sets may not be free to use even under an open license, because trademark rights apply separately.',

  'license.recommend.title': 'Recommendations',
  'license.recommend.item1': 'Curated sets — especially the MIT/Apache family — are generally safe.',
  'license.recommend.item2':
    'Follow the attribution requirement for Game-icons and the share-alike condition for OpenMoji.',
  'license.recommend.item3':
    'For commercial use, confirm the exact license on the "View original" page of each icon card.',
  'license.disclaimer':
    'This guidance is not legal advice. Please confirm exact terms in the original license of each collection.',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Update available',
  'update.title.downloading': 'Downloading...',
  'update.title.installing': 'Installing...',
  'update.title.error': 'Update failed',
  'update.downloading.body': 'Downloading the update...',
  'update.installing.body': 'Installing the update. This will only take a moment...',
  'update.changelog': 'View changelog on GitHub',
  'update.later': 'Later',
  'update.now': 'Update now',
  'update.checkFailed': 'Failed to check for updates',
  'update.failed': 'Update failed',
} as const;
