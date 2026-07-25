export const deAppTranslations = {
  'app.tab.search': 'Suche',
  'app.tab.search.title': 'Icon-Suche',
  'app.tab.editor': 'Editor',
  'app.tab.editor.title': 'SVG-Editor',
  'app.editorLoading': 'Editor wird geladen...',
  'app.favorites': 'Favoriten',
  'app.favorites.showAll': 'Alle Icons anzeigen',
  'app.favorites.showOnly': 'Nur Favoriten anzeigen',
  'app.batchExport': 'Stapelexport',
  'app.batchExport.title': 'Favoriten als Stapel exportieren',

  // 아이콘 검색 결과 그리드 (IconGrid)
  'search.placeholder': 'Icons suchen... (z. B. home, user, settings)',
  'search.clear': 'Suchbegriff löschen',
  'search.searching': 'Icons werden gesucht...',
  'search.error.title': 'Bei der Suche ist ein Fehler aufgetreten',
  'search.minChars': 'Bitte mindestens 2 Zeichen eingeben',
  'search.empty.inCollection': 'Keine Ergebnisse für "{query}" in der ausgewählten Sammlung',
  'search.empty.all': 'Keine Ergebnisse für "{query}"',
  'search.empty.hint': 'Versuchen Sie einen anderen Suchbegriff',
  'search.initial.title': 'Suche nach Icons starten',
  'search.initial.subtitle': 'Mehr als 275.000 Open-Source-Icons durchsuchen',
  'search.initial.example': 'Beispiele: home, user, settings, arrow, check',
  'search.initial.orPick': 'Oder oben in den Kategorien einen Icon-Satz auswählen',
  'search.count.favorites': '{count} Favoriten',
  'search.count.collection': 'Ausgewählte Sammlung: {count} Icons',
  'search.count.results': '{shown} von {total} Ergebnissen',

  // 컬렉션 드롭다운 (CategoryDropdown)
  'collection.label': 'Kategorie',
  'collection.viewAll': 'Alle anzeigen',
  'collection.allSets': 'Alle Icon-Sätze',
  'collection.iconCount': '{prefix} • {count} Icons',

  // 아이콘 카드 · 즐겨찾기 패널
  'icon.loadFailed': 'Laden fehlgeschlagen',
  'favorites.add': 'Zu Favoriten hinzufügen',
  'favorites.remove': 'Aus Favoriten entfernen',
  'favorites.title': 'Favoriten',
  'favorites.gridEmpty': 'Sie haben noch keine Favoriten',
  'favorites.gridEmptyHint':
    'Klicken Sie auf den Stern einer Icon-Karte, um sie zu den Favoriten hinzuzufügen',
  'favorites.panelEmpty': 'Noch keine Favoriten-Icons',
  'favorites.panelEmptyHint': 'Klicken Sie auf den Stern eines Icons, um es hinzuzufügen',
  'favorites.total': 'Insgesamt {count} Favoriten',
} as const;
