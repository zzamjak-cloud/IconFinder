export const jaSettingsTranslations = {
  'settings.title': '設定',
  'settings.button.aria': '設定',
  'settings.general': '一般',

  'settings.defaultFolder': 'デフォルト保存フォルダ',
  'settings.defaultFolder.placeholder': '未選択',
  'settings.defaultFolder.dialogTitle': 'デフォルト保存フォルダを選択',
  'settings.defaultFolder.help':
    'アイコンを保存するフォルダを設定します。デフォルトフォルダを設定すると、エクスポート時に自動でそこへ保存されます。',

  'settings.exportDefaults': 'エクスポートの初期設定',
  'settings.format': 'デフォルト形式',
  'settings.pngSize': 'デフォルト PNG サイズ',
  'settings.color': 'デフォルトカラー',

  'settings.backup': 'バックアップと復元',
  'settings.backup.help':
    'お気に入り、エクスポート設定、SVG ワークスペース (カテゴリと保存したアイコン) を1つのファイルにバックアップします。設定はアプリの更新後も自動的に保持されますが、バックアップファイルがあれば別のマシンへの移行やデータの復旧ができます。',
  'settings.backup.export': 'バックアップを書き出す',
  'settings.backup.import': 'バックアップを復元',
  'settings.backup.saveDialogTitle': '設定のバックアップを保存',
  'settings.backup.openDialogTitle': '復元するバックアップファイルを選択',
  'settings.backup.saved': 'バックアップを保存しました。(保存済みアイコン {count}件を含む)',
  'settings.backup.failed': 'バックアップに失敗しました: {error}',
  'settings.backup.readFailed': '復元ファイルの読み込みに失敗しました: {error}',
  'settings.backup.restoreFailed': '復元に失敗しました: {error}',
  'settings.backup.restoreWarning':
    '{fileName} から復元すると、現在のすべての設定が上書きされます。復元が完了するとアプリが再読み込みされます。',
  'settings.backup.restoreApply': '復元を実行',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'ライセンス',
  'license.title': 'アイコンのライセンス方針',
  'license.intro':
    'このアプリのアイコンは Iconify のオープンソースコレクションから提供されています。ライセンスはコレクションごとに異なるため、特に商用利用の場合は、ご利用前に以下の内容をご確認ください。',
  'license.curated.title': '厳選コレクション',
  'license.table.collection': 'コレクション',
  'license.table.license': 'ライセンス',
  'license.table.commercial': '商用利用',
  'license.table.obligation': '義務',
  'license.free': '✅ 自由',
  'license.conditional': '✅ 条件付き',
  'license.note.copyright': '著作権表示',
  'license.note.notice': '告知',
  'license.note.attribution': 'クレジット表示が必要',
  'license.note.shareAlike': 'クレジット表示 + 継承',

  'license.types.title': 'ライセンスの種類',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    '商用利用は実質的に自由です。ライセンス文と著作権表示を残すだけで済みます。',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': '自由に利用できますが、制作者のクレジット表示が必要です。',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'クレジット表示に加えて、二次的著作物も同じライセンスで公開する必要があります。商用製品では特にご注意ください。',

  'license.unified.title': '⚠️ 「All」検索に関する注意',
  'license.unified.p1':
    'デフォルトの All 検索は Iconify のすべてのコレクション (約150セット・275,000点以上のアイコン) を対象とするため、上記9セット以外のセットが結果に含まれることがあります。',
  'license.unified.p2':
    'その場合、ライセンスは多岐にわたり、アプリ内に表示されないこともあります。',
  'license.unified.p3':
    'ブランドやロゴのセットは、オープンライセンスであっても商標権が別途適用されるため、自由に利用できるとは限りません。',

  'license.recommend.title': '推奨事項',
  'license.recommend.item1':
    '厳選セット、特に MIT/Apache 系であれば概ね安全にご利用いただけます。',
  'license.recommend.item2':
    'Game-icons のクレジット表示義務と OpenMoji の継承条件は必ず守ってください。',
  'license.recommend.item3':
    '商用利用の場合は、各アイコンカードの「原本を表示」ページで正確なライセンスをご確認ください。',
  'license.disclaimer':
    'この案内は法的助言ではありません。正確な条件は各コレクションの原本ライセンスでご確認ください。',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'アップデートがあります',
  'update.title.downloading': 'ダウンロード中...',
  'update.title.installing': 'インストール中...',
  'update.title.error': 'アップデート失敗',
  'update.downloading.body': 'アップデートをダウンロードしています...',
  'update.installing.body': 'アップデートをインストールしています。まもなく完了します...',
  'update.changelog': 'GitHub で変更履歴を見る',
  'update.later': '後で',
  'update.now': '今すぐ更新',
  'update.checkFailed': 'アップデートの確認に失敗しました',
  'update.failed': 'アップデートに失敗しました',
} as const;
