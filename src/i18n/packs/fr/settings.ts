export const frSettingsTranslations = {
  'settings.title': 'Paramètres',
  'settings.button.aria': 'Paramètres',
  'settings.general': 'Général',

  'settings.defaultFolder': 'Dossier de sauvegarde par défaut',
  'settings.defaultFolder.placeholder': 'Non sélectionné',
  'settings.defaultFolder.dialogTitle': 'Sélectionner le dossier de sauvegarde par défaut',
  'settings.defaultFolder.help':
    "Définit le dossier dans lequel les icônes sont enregistrées. Une fois un dossier par défaut défini, les exports y sont enregistrés automatiquement.",

  'settings.exportDefaults': "Paramètres d'export par défaut",
  'settings.format': 'Format par défaut',
  'settings.pngSize': 'Taille PNG par défaut',
  'settings.color': 'Couleur par défaut',

  'settings.backup': 'Sauvegarde et restauration',
  'settings.backup.help':
    "Sauvegarde vos favoris, vos paramètres d'export et votre espace de travail SVG (catégories et icônes enregistrées) dans un seul fichier. Les paramètres sont conservés automatiquement lors des mises à jour de l'application, et un fichier de sauvegarde vous permet de passer à une autre machine ou de récupérer vos données.",
  'settings.backup.export': 'Exporter la sauvegarde',
  'settings.backup.import': 'Restaurer la sauvegarde',
  'settings.backup.saveDialogTitle': 'Enregistrer la sauvegarde des paramètres',
  'settings.backup.openDialogTitle': 'Sélectionner un fichier de sauvegarde à restaurer',
  'settings.backup.saved': 'Sauvegarde enregistrée. ({count} icônes enregistrées incluses)',
  'settings.backup.failed': 'Échec de la sauvegarde : {error}',
  'settings.backup.readFailed': 'Échec de la lecture du fichier de restauration : {error}',
  'settings.backup.restoreFailed': 'Échec de la restauration : {error}',
  'settings.backup.restoreWarning':
    "La restauration depuis {fileName} remplace tous vos paramètres actuels. L'application se recharge une fois la restauration terminée.",
  'settings.backup.restoreApply': 'Appliquer la restauration',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'Licence',
  'license.title': "Politique de licence des icônes",
  'license.intro':
    "Les icônes de cette application proviennent des collections open source Iconify. Les licences diffèrent d'une collection à l'autre : veuillez donc consulter les détails ci-dessous avant toute utilisation, en particulier pour un usage commercial.",
  'license.curated.title': 'Collections sélectionnées',
  'license.table.collection': 'Collection',
  'license.table.license': 'Licence',
  'license.table.commercial': 'Usage commercial',
  'license.table.obligation': 'Obligation',
  'license.free': '✅ Libre',
  'license.conditional': '✅ Sous conditions',
  'license.note.copyright': 'Mention de copyright',
  'license.note.notice': 'Mention légale',
  'license.note.attribution': 'Attribution obligatoire',
  'license.note.shareAlike': 'Attribution + partage dans les mêmes conditions',

  'license.types.title': 'Types de licence',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    "Pratiquement libres pour un usage commercial. Il suffit de conserver le texte de la licence et la mention de copyright.",
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc':
    "Libres d'utilisation, mais l'attribution à l'auteur est obligatoire.",
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    "Attribution obligatoire, et les œuvres dérivées doivent également être publiées sous la même licence — attention aux produits commerciaux.",

  'license.unified.title': '⚠️ Remarque sur la recherche « Tout »',
  'license.unified.p1':
    "La recherche « Tout » par défaut couvre toutes les collections Iconify (plus de 275 000 icônes réparties sur environ 150 jeux) : des jeux autres que les neuf ci-dessus peuvent donc apparaître dans vos résultats.",
  'license.unified.p2':
    "Dans ce cas, les licences varient fortement et peuvent ne pas être affichées dans l'application.",
  'license.unified.p3':
    "Les jeux de marques et de logos peuvent ne pas être libres d'utilisation, même sous licence ouverte, car les droits de marque s'appliquent séparément.",

  'license.recommend.title': 'Recommandations',
  'license.recommend.item1':
    "Les jeux sélectionnés — en particulier la famille MIT/Apache — sont généralement sûrs.",
  'license.recommend.item2':
    "Respectez l'obligation d'attribution pour Game-icons et la condition de partage dans les mêmes conditions pour OpenMoji.",
  'license.recommend.item3':
    "Pour un usage commercial, vérifiez la licence exacte sur la page « Voir l'original » de chaque carte d'icône.",
  'license.disclaimer':
    "Ces informations ne constituent pas un avis juridique. Veuillez vérifier les conditions exactes dans la licence originale de chaque collection.",

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Mise à jour disponible',
  'update.title.downloading': 'Téléchargement...',
  'update.title.installing': 'Installation...',
  'update.title.error': 'Échec de la mise à jour',
  'update.downloading.body': 'Téléchargement de la mise à jour...',
  'update.installing.body': "Installation de la mise à jour. Cela ne prendra qu'un instant...",
  'update.changelog': 'Voir le journal des modifications sur GitHub',
  'update.later': 'Plus tard',
  'update.now': 'Mettre à jour',
  'update.checkFailed': 'Échec de la vérification des mises à jour',
  'update.failed': 'Échec de la mise à jour',
} as const;
