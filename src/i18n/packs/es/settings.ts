export const esSettingsTranslations = {
  'settings.title': 'Ajustes',
  'settings.button.aria': 'Ajustes',
  'settings.general': 'General',

  'settings.defaultFolder': 'Carpeta de guardado predeterminada',
  'settings.defaultFolder.placeholder': 'Sin seleccionar',
  'settings.defaultFolder.dialogTitle': 'Seleccionar la carpeta de guardado predeterminada',
  'settings.defaultFolder.help':
    'Define la carpeta donde se guardan los iconos. Una vez definida una carpeta predeterminada, las exportaciones se guardan allí automáticamente.',

  'settings.exportDefaults': 'Ajustes de exportación predeterminados',
  'settings.format': 'Formato predeterminado',
  'settings.pngSize': 'Tamaño PNG predeterminado',
  'settings.color': 'Color predeterminado',

  'settings.backup': 'Copia de seguridad y restauración',
  'settings.backup.help':
    'Guarda en un único archivo sus favoritos, los ajustes de exportación y el espacio de trabajo SVG (categorías e iconos guardados). Los ajustes se conservan automáticamente entre actualizaciones de la aplicación, y un archivo de copia de seguridad le permite pasar a otro equipo o recuperar sus datos.',
  'settings.backup.export': 'Exportar copia de seguridad',
  'settings.backup.import': 'Restaurar copia de seguridad',
  'settings.backup.saveDialogTitle': 'Guardar la copia de seguridad de los ajustes',
  'settings.backup.openDialogTitle': 'Seleccione el archivo de copia de seguridad que desea restaurar',
  'settings.backup.saved': 'Copia de seguridad guardada. (incluye {count} iconos guardados)',
  'settings.backup.failed': 'Error en la copia de seguridad: {error}',
  'settings.backup.readFailed': 'No se ha podido leer el archivo de restauración: {error}',
  'settings.backup.restoreFailed': 'Error en la restauración: {error}',
  'settings.backup.restoreWarning':
    'Restaurar desde {fileName} sobrescribe todos sus ajustes actuales. La aplicación se recargará al finalizar la restauración.',
  'settings.backup.restoreApply': 'Aplicar restauración',

  // 라이선스 안내 (LicenseDialog)
  'license.button': 'Licencia',
  'license.title': 'Política de licencias de los iconos',
  'license.intro':
    'Los iconos de esta aplicación provienen de las colecciones de código abierto de Iconify. Las licencias varían de una colección a otra, así que revise los detalles siguientes antes de usarlos, especialmente para uso comercial.',
  'license.curated.title': 'Colecciones seleccionadas',
  'license.table.collection': 'Colección',
  'license.table.license': 'Licencia',
  'license.table.commercial': 'Uso comercial',
  'license.table.obligation': 'Obligación',
  'license.free': '✅ Libre',
  'license.conditional': '✅ Condicional',
  'license.note.copyright': 'Aviso de copyright',
  'license.note.notice': 'Aviso',
  'license.note.attribution': 'Atribución obligatoria',
  'license.note.shareAlike': 'Atribución + compartir igual',

  'license.types.title': 'Tipos de licencia',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    'En la práctica, libres para uso comercial. Solo debe conservar el texto de la licencia y el aviso de copyright.',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': 'De uso libre, pero es obligatorio atribuir la autoría.',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    'Atribución y, además, las obras derivadas deben publicarse con la misma licencia; tenga cuidado con los productos comerciales.',

  'license.unified.title': '⚠️ Nota sobre la búsqueda "All"',
  'license.unified.p1':
    'La búsqueda All predeterminada abarca todas las colecciones de Iconify (más de 275.000 iconos en unos 150 conjuntos), por lo que en los resultados pueden aparecer conjuntos distintos de los nueve anteriores.',
  'license.unified.p2':
    'En ese caso, las licencias son muy variadas y puede que no se muestren en la aplicación.',
  'license.unified.p3':
    'Los conjuntos de marcas y logotipos pueden no ser de uso libre incluso con una licencia abierta, porque los derechos de marca se aplican por separado.',

  'license.recommend.title': 'Recomendaciones',
  'license.recommend.item1': 'Los conjuntos seleccionados, sobre todo la familia MIT/Apache, suelen ser seguros.',
  'license.recommend.item2':
    'Cumpla el requisito de atribución de Game-icons y la condición de compartir igual de OpenMoji.',
  'license.recommend.item3':
    'Para uso comercial, confirme la licencia exacta en la página "Ver original" de cada tarjeta de icono.',
  'license.disclaimer':
    'Esta información no constituye asesoramiento jurídico. Confirme las condiciones exactas en la licencia original de cada colección.',

  // 자동 업데이트 (UpdateDialog)
  'update.title.available': 'Actualización disponible',
  'update.title.downloading': 'Descargando...',
  'update.title.installing': 'Instalando...',
  'update.title.error': 'Error en la actualización',
  'update.downloading.body': 'Descargando la actualización...',
  'update.installing.body': 'Instalando la actualización. Solo tardará un momento...',
  'update.changelog': 'Ver el registro de cambios en GitHub',
  'update.later': 'Más tarde',
  'update.now': 'Actualizar ahora',
  'update.checkFailed': 'No se han podido buscar actualizaciones',
  'update.failed': 'Error en la actualización',
} as const;
