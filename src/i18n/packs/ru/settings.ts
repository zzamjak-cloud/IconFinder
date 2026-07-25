export const ruSettingsTranslations = {
  'settings.title': 'Настройки',
  'settings.button.aria': 'Настройки',
  'settings.general': 'Общие',

  'settings.defaultFolder': 'Папка сохранения по умолчанию',
  'settings.defaultFolder.placeholder': 'Не выбрана',
  'settings.defaultFolder.dialogTitle': 'Выберите папку сохранения по умолчанию',
  'settings.defaultFolder.help':
    'Задаёт папку, в которую сохраняются иконки. Если папка по умолчанию задана, экспорт сохраняется в неё автоматически.',

  'settings.exportDefaults': 'Параметры экспорта по умолчанию',
  'settings.format': 'Формат по умолчанию',
  'settings.pngSize': 'Размер PNG по умолчанию',
  'settings.color': 'Цвет по умолчанию',

  'settings.backup': 'Резервное копирование и восстановление',
  'settings.backup.help':
    'Сохраняет избранное, параметры экспорта и рабочее пространство SVG (категории и сохранённые иконки) в один файл. Настройки сохраняются автоматически при обновлениях приложения, а файл резервной копии позволяет перенести данные на другой компьютер или восстановить их.',
  'settings.backup.export': 'Создать резервную копию',
  'settings.backup.import': 'Восстановить из копии',
  'settings.backup.saveDialogTitle': 'Сохранить резервную копию настроек',
  'settings.backup.openDialogTitle': 'Выберите файл резервной копии для восстановления',
  'settings.backup.saved': 'Резервная копия сохранена. (включено сохранённых иконок: {count})',
  'settings.backup.failed': 'Не удалось создать резервную копию: {error}',
  'settings.backup.readFailed': 'Не удалось прочитать файл для восстановления: {error}',
  'settings.backup.restoreFailed': 'Не удалось выполнить восстановление: {error}',
  'settings.backup.restoreWarning':
    'Восстановление из файла {fileName} перезапишет все текущие настройки. После завершения восстановления приложение будет перезагружено.',
  'settings.backup.restoreApply': 'Восстановить',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'Лицензия',
  'license.title': 'Лицензионная политика для иконок',
  'license.intro':
    'Иконки в этом приложении взяты из открытых коллекций Iconify. Лицензии различаются от коллекции к коллекции, поэтому перед использованием — особенно коммерческим — ознакомьтесь с подробностями ниже.',
  'license.curated.title': 'Отобранные коллекции',
  'license.table.collection': 'Коллекция',
  'license.table.license': 'Лицензия',
  'license.table.commercial': 'Коммерческое использование',
  'license.table.obligation': 'Обязательства',
  'license.free': '✅ Свободно',
  'license.conditional': '✅ С условиями',
  'license.note.copyright': 'Указание авторских прав',
  'license.note.notice': 'Уведомление',
  'license.note.attribution': 'Требуется указание автора',
  'license.note.shareAlike': 'Указание автора + та же лицензия',

  'license.types.title': 'Типы лицензий',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    'Практически свободны для коммерческого использования. Достаточно сохранить текст лицензии и указание авторских прав.',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': 'Использование свободно, но требуется указание автора.',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'Требуется указание автора, а производные работы должны распространяться под той же лицензией — будьте внимательны с коммерческими продуктами.',

  'license.unified.title': '⚠️ Примечание о поиске «All»',
  'license.unified.p1':
    'Поиск All по умолчанию охватывает все коллекции Iconify (более 275 000 иконок в примерно 150 наборах), поэтому в результатах могут появляться наборы помимо девяти перечисленных выше.',
  'license.unified.p2':
    'В этом случае лицензии сильно различаются и могут не отображаться в приложении.',
  'license.unified.p3':
    'Наборы брендов и логотипов могут быть несвободны в использовании даже под открытой лицензией, поскольку права на товарные знаки действуют отдельно.',

  'license.recommend.title': 'Рекомендации',
  'license.recommend.item1':
    'Отобранные наборы — особенно семейство MIT/Apache — как правило безопасны.',
  'license.recommend.item2':
    'Соблюдайте требование об указании автора для Game-icons и условие о той же лицензии для OpenMoji.',
  'license.recommend.item3':
    'Для коммерческого использования уточните точную лицензию на странице «Открыть оригинал» в карточке каждой иконки.',
  'license.disclaimer':
    'Эти сведения не являются юридической консультацией. Уточняйте точные условия в оригинальной лицензии каждой коллекции.',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Доступно обновление',
  'update.title.downloading': 'Загрузка...',
  'update.title.installing': 'Установка...',
  'update.title.error': 'Не удалось обновить',
  'update.downloading.body': 'Загрузка обновления...',
  'update.installing.body': 'Установка обновления. Это займёт всего мгновение...',
  'update.changelog': 'Список изменений на GitHub',
  'update.later': 'Позже',
  'update.now': 'Обновить сейчас',
  'update.checkFailed': 'Не удалось проверить обновления',
  'update.failed': 'Не удалось обновить',
} as const;
