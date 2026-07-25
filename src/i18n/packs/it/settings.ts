export const itSettingsTranslations = {
  'settings.title': 'Impostazioni',
  'settings.button.aria': 'Impostazioni',
  'settings.general': 'Generali',

  'settings.defaultFolder': 'Cartella di salvataggio predefinita',
  'settings.defaultFolder.placeholder': 'Non selezionata',
  'settings.defaultFolder.dialogTitle': 'Seleziona la cartella di salvataggio predefinita',
  'settings.defaultFolder.help':
    'Imposta la cartella in cui vengono salvate le icone. Una volta definita una cartella predefinita, le esportazioni vengono salvate automaticamente al suo interno.',

  'settings.exportDefaults': 'Impostazioni di esportazione predefinite',
  'settings.format': 'Formato predefinito',
  'settings.pngSize': 'Dimensione PNG predefinita',
  'settings.color': 'Colore predefinito',

  'settings.backup': 'Backup e ripristino',
  'settings.backup.help':
    "Esegue il backup dei preferiti, delle impostazioni di esportazione e dello spazio di lavoro SVG (categorie e icone salvate) in un unico file. Le impostazioni vengono conservate automaticamente durante gli aggiornamenti dell'app e un file di backup consente di passare a un altro computer o di recuperare i dati.",
  'settings.backup.export': 'Esporta backup',
  'settings.backup.import': 'Ripristina backup',
  'settings.backup.saveDialogTitle': 'Salva il backup delle impostazioni',
  'settings.backup.openDialogTitle': 'Seleziona un file di backup da ripristinare',
  'settings.backup.saved': 'Backup salvato. ({count} icone salvate incluse)',
  'settings.backup.failed': 'Backup non riuscito: {error}',
  'settings.backup.readFailed': 'Lettura del file di ripristino non riuscita: {error}',
  'settings.backup.restoreFailed': 'Ripristino non riuscito: {error}',
  'settings.backup.restoreWarning':
    "Il ripristino da {fileName} sovrascrive tutte le impostazioni attuali. L'app viene ricaricata al termine del ripristino.",
  'settings.backup.restoreApply': 'Applica ripristino',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'Licenza',
  'license.title': 'Politica di licenza delle icone',
  'license.intro':
    "Le icone di questa app provengono dalle raccolte open source di Iconify. Le licenze variano da raccolta a raccolta: consultare i dettagli qui sotto prima dell'uso, in particolare per l'uso commerciale.",
  'license.curated.title': 'Raccolte selezionate',
  'license.table.collection': 'Raccolta',
  'license.table.license': 'Licenza',
  'license.table.commercial': 'Uso commerciale',
  'license.table.obligation': 'Obbligo',
  'license.free': '✅ Libero',
  'license.conditional': '✅ Condizionato',
  'license.note.copyright': 'Avviso di copyright',
  'license.note.notice': 'Avviso',
  'license.note.attribution': 'Attribuzione obbligatoria',
  'license.note.shareAlike': 'Attribuzione + condividi allo stesso modo',

  'license.types.title': 'Tipi di licenza',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    "Di fatto libere per l'uso commerciale. È sufficiente conservare il testo della licenza e l'avviso di copyright.",
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': "Libere da usare, ma è obbligatoria l'attribuzione all'autore.",
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'Attribuzione obbligatoria e le opere derivate devono essere rilasciate con la stessa licenza: prestare attenzione nei prodotti commerciali.',

  'license.unified.title': '⚠️ Nota sulla ricerca "Tutti"',
  'license.unified.p1':
    'La ricerca predefinita Tutti copre tutte le raccolte Iconify (oltre 275.000 icone in circa 150 set), quindi nei risultati possono comparire set diversi dai nove elencati sopra.',
  'license.unified.p2':
    "In tal caso le licenze variano notevolmente e potrebbero non essere visualizzate nell'app.",
  'license.unified.p3':
    'I set di marchi e loghi potrebbero non essere liberamente utilizzabili anche con una licenza aperta, perché i diritti di marchio si applicano separatamente.',

  'license.recommend.title': 'Consigli',
  'license.recommend.item1': 'I set selezionati, in particolare la famiglia MIT/Apache, sono generalmente sicuri.',
  'license.recommend.item2':
    "Rispettare l'obbligo di attribuzione di Game-icons e la condizione share-alike di OpenMoji.",
  'license.recommend.item3':
    "Per l'uso commerciale, verificare la licenza esatta nella pagina “Vedi originale” di ogni scheda icona.",
  'license.disclaimer':
    'Queste indicazioni non costituiscono un parere legale. Verificare i termini esatti nella licenza originale di ogni raccolta.',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Aggiornamento disponibile',
  'update.title.downloading': 'Download in corso...',
  'update.title.installing': 'Installazione in corso...',
  'update.title.error': 'Aggiornamento non riuscito',
  'update.downloading.body': "Download dell'aggiornamento in corso...",
  'update.installing.body': "Installazione dell'aggiornamento. Richiederà solo un momento...",
  'update.changelog': 'Visualizza il changelog su GitHub',
  'update.later': 'Più tardi',
  'update.now': 'Aggiorna ora',
  'update.checkFailed': 'Controllo degli aggiornamenti non riuscito',
  'update.failed': 'Aggiornamento non riuscito',
} as const;
