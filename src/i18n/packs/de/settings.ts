export const deSettingsTranslations = {
  'settings.title': 'Einstellungen',
  'settings.button.aria': 'Einstellungen',
  'settings.general': 'Allgemein',

  'settings.defaultFolder': 'Standard-Speicherordner',
  'settings.defaultFolder.placeholder': 'Nicht ausgewählt',
  'settings.defaultFolder.dialogTitle': 'Standard-Speicherordner auswählen',
  'settings.defaultFolder.help':
    'Legt den Ordner fest, in dem Icons gespeichert werden. Sobald ein Standardordner festgelegt ist, werden Exporte automatisch dort gespeichert.',

  'settings.exportDefaults': 'Standard-Exporteinstellungen',
  'settings.format': 'Standardformat',
  'settings.pngSize': 'Standard-PNG-Größe',
  'settings.color': 'Standardfarbe',

  'settings.backup': 'Sichern und Wiederherstellen',
  'settings.backup.help':
    'Sichert Ihre Favoriten, Exporteinstellungen und den SVG-Arbeitsbereich (Kategorien und gespeicherte Icons) in einer einzigen Datei. Einstellungen bleiben bei App-Updates automatisch erhalten, und mit einer Sicherungsdatei können Sie auf einen anderen Rechner wechseln oder Ihre Daten wiederherstellen.',
  'settings.backup.export': 'Sicherung exportieren',
  'settings.backup.import': 'Sicherung wiederherstellen',
  'settings.backup.saveDialogTitle': 'Einstellungssicherung speichern',
  'settings.backup.openDialogTitle': 'Sicherungsdatei zum Wiederherstellen auswählen',
  'settings.backup.saved': 'Sicherung gespeichert. ({count} gespeicherte Icons enthalten)',
  'settings.backup.failed': 'Sicherung fehlgeschlagen: {error}',
  'settings.backup.readFailed': 'Die Wiederherstellungsdatei konnte nicht gelesen werden: {error}',
  'settings.backup.restoreFailed': 'Wiederherstellung fehlgeschlagen: {error}',
  'settings.backup.restoreWarning':
    'Das Wiederherstellen aus {fileName} überschreibt alle aktuellen Einstellungen. Die App wird nach Abschluss der Wiederherstellung neu geladen.',
  'settings.backup.restoreApply': 'Wiederherstellen',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'Lizenz',
  'license.title': 'Icon-Lizenzrichtlinie',
  'license.intro':
    'Die Icons dieser App stammen aus den Open-Source-Sammlungen von Iconify. Die Lizenzen unterscheiden sich von Sammlung zu Sammlung — prüfen Sie daher vor der Verwendung die folgenden Angaben, insbesondere bei kommerzieller Nutzung.',
  'license.curated.title': 'Kuratierte Sammlungen',
  'license.table.collection': 'Sammlung',
  'license.table.license': 'Lizenz',
  'license.table.commercial': 'Kommerzielle Nutzung',
  'license.table.obligation': 'Pflicht',
  'license.free': '✅ Frei',
  'license.conditional': '✅ Bedingt',
  'license.note.copyright': 'Urheberrechtshinweis',
  'license.note.notice': 'Hinweis',
  'license.note.attribution': 'Namensnennung erforderlich',
  'license.note.shareAlike': 'Namensnennung + Weitergabe unter gleichen Bedingungen',

  'license.types.title': 'Lizenzarten',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    'Praktisch frei für kommerzielle Nutzung. Sie müssen lediglich den Lizenztext und den Urheberrechtshinweis beibehalten.',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc':
    'Frei nutzbar, aber die Namensnennung der Urheber ist erforderlich.',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'Namensnennung, und abgeleitete Werke müssen ebenfalls unter derselben Lizenz veröffentlicht werden — bei kommerziellen Produkten ist Vorsicht geboten.',

  'license.unified.title': '⚠️ Hinweis zur Suche über "Alle"',
  'license.unified.p1':
    'Die Standardsuche "Alle" umfasst alle Iconify-Sammlungen (über 275.000 Icons in rund 150 Sätzen), sodass in den Ergebnissen auch andere Sätze als die neun oben genannten erscheinen können.',
  'license.unified.p2':
    'In diesem Fall variieren die Lizenzen stark und werden möglicherweise nicht in der App angezeigt.',
  'license.unified.p3':
    'Marken- und Logo-Sätze sind selbst unter einer offenen Lizenz möglicherweise nicht frei nutzbar, da Markenrechte separat gelten.',

  'license.recommend.title': 'Empfehlungen',
  'license.recommend.item1':
    'Kuratierte Sätze — besonders die MIT/Apache-Familie — sind in der Regel unbedenklich.',
  'license.recommend.item2':
    'Beachten Sie die Namensnennungspflicht bei Game-icons und die Share-alike-Bedingung bei OpenMoji.',
  'license.recommend.item3':
    'Prüfen Sie für die kommerzielle Nutzung die genaue Lizenz auf der Seite "Original ansehen" der jeweiligen Icon-Karte.',
  'license.disclaimer':
    'Diese Hinweise sind keine Rechtsberatung. Bitte prüfen Sie die genauen Bedingungen in der Originallizenz der jeweiligen Sammlung.',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Update verfügbar',
  'update.title.downloading': 'Wird heruntergeladen...',
  'update.title.installing': 'Wird installiert...',
  'update.title.error': 'Update fehlgeschlagen',
  'update.downloading.body': 'Das Update wird heruntergeladen...',
  'update.installing.body': 'Das Update wird installiert. Das dauert nur einen Moment...',
  'update.changelog': 'Änderungsprotokoll auf GitHub ansehen',
  'update.later': 'Später',
  'update.now': 'Jetzt aktualisieren',
  'update.checkFailed': 'Suche nach Updates fehlgeschlagen',
  'update.failed': 'Update fehlgeschlagen',
} as const;
