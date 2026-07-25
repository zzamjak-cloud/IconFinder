export const ptSettingsTranslations = {
  'settings.title': 'Configurações',
  'settings.button.aria': 'Configurações',
  'settings.general': 'Geral',

  'settings.defaultFolder': 'Pasta de salvamento padrão',
  'settings.defaultFolder.placeholder': 'Não selecionada',
  'settings.defaultFolder.dialogTitle': 'Selecionar pasta de salvamento padrão',
  'settings.defaultFolder.help':
    'Define a pasta em que os ícones são salvos. Depois que uma pasta padrão é definida, as exportações são salvas nela automaticamente.',

  'settings.exportDefaults': 'Configurações padrão de exportação',
  'settings.format': 'Formato padrão',
  'settings.pngSize': 'Tamanho PNG padrão',
  'settings.color': 'Cor padrão',

  'settings.backup': 'Backup e restauração',
  'settings.backup.help':
    'Faz backup dos seus favoritos, das configurações de exportação e do espaço de trabalho SVG (categorias e ícones salvos) em um único arquivo. As configurações são mantidas automaticamente nas atualizações do aplicativo, e um arquivo de backup permite migrar para outro computador ou recuperar seus dados.',
  'settings.backup.export': 'Exportar backup',
  'settings.backup.import': 'Restaurar backup',
  'settings.backup.saveDialogTitle': 'Salvar backup das configurações',
  'settings.backup.openDialogTitle': 'Selecione um arquivo de backup para restaurar',
  'settings.backup.saved': 'Backup salvo. ({count} ícones salvos incluídos)',
  'settings.backup.failed': 'Falha no backup: {error}',
  'settings.backup.readFailed': 'Falha ao ler o arquivo de restauração: {error}',
  'settings.backup.restoreFailed': 'Falha na restauração: {error}',
  'settings.backup.restoreWarning':
    'Restaurar a partir de {fileName} substitui todas as suas configurações atuais. O aplicativo será recarregado quando a restauração terminar.',
  'settings.backup.restoreApply': 'Aplicar restauração',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'Licença',
  'license.title': 'Política de licença dos ícones',
  'license.intro':
    'Os ícones deste aplicativo vêm das coleções de código aberto do Iconify. As licenças variam de coleção para coleção, portanto revise os detalhes abaixo antes de usar — especialmente para uso comercial.',
  'license.curated.title': 'Coleções selecionadas',
  'license.table.collection': 'Coleção',
  'license.table.license': 'Licença',
  'license.table.commercial': 'Uso comercial',
  'license.table.obligation': 'Obrigação',
  'license.free': '✅ Livre',
  'license.conditional': '✅ Condicional',
  'license.note.copyright': 'Aviso de copyright',
  'license.note.notice': 'Aviso',
  'license.note.attribution': 'Atribuição obrigatória',
  'license.note.shareAlike': 'Atribuição + compartilhamento pela mesma licença',

  'license.types.title': 'Tipos de licença',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    'Praticamente livres para uso comercial. Basta manter o texto da licença e o aviso de copyright.',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': 'Uso livre, mas a atribuição ao autor é obrigatória.',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'Atribuição e, além disso, obras derivadas também devem ser publicadas sob a mesma licença — tenha cuidado com produtos comerciais.',

  'license.unified.title': '⚠️ Observação sobre a pesquisa "Todos"',
  'license.unified.p1':
    'A pesquisa padrão em Todos abrange todas as coleções do Iconify (mais de 275.000 ícones em cerca de 150 conjuntos), então conjuntos além dos nove acima podem aparecer nos resultados.',
  'license.unified.p2':
    'Nesse caso, as licenças variam bastante e podem não ser exibidas no aplicativo.',
  'license.unified.p3':
    'Conjuntos de marcas e logotipos podem não ser livres para uso mesmo sob uma licença aberta, porque os direitos de marca registrada se aplicam separadamente.',

  'license.recommend.title': 'Recomendações',
  'license.recommend.item1': 'Os conjuntos selecionados — especialmente a família MIT/Apache — são geralmente seguros.',
  'license.recommend.item2':
    'Siga a exigência de atribuição do Game-icons e a condição de compartilhamento pela mesma licença do OpenMoji.',
  'license.recommend.item3':
    'Para uso comercial, confirme a licença exata na página "Ver original" de cada cartão de ícone.',
  'license.disclaimer':
    'Esta orientação não constitui assessoria jurídica. Confirme os termos exatos na licença original de cada coleção.',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Atualização disponível',
  'update.title.downloading': 'Baixando...',
  'update.title.installing': 'Instalando...',
  'update.title.error': 'Falha na atualização',
  'update.downloading.body': 'Baixando a atualização...',
  'update.installing.body': 'Instalando a atualização. Isso leva apenas um instante...',
  'update.changelog': 'Ver o changelog no GitHub',
  'update.later': 'Mais tarde',
  'update.now': 'Atualizar agora',
  'update.checkFailed': 'Falha ao verificar atualizações',
  'update.failed': 'Falha na atualização',
} as const;
