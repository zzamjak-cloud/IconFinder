export const koSettingsTranslations = {
  'settings.title': '설정',
  'settings.button.aria': '설정',
  'settings.general': '일반',

  'settings.defaultFolder': '기본 저장 폴더',
  'settings.defaultFolder.placeholder': '선택되지 않음',
  'settings.defaultFolder.dialogTitle': '기본 저장 폴더 선택',
  'settings.defaultFolder.help':
    '아이콘을 저장할 기본 폴더를 지정합니다. 기본 폴더가 설정되면 내보내기 시 자동으로 저장됩니다.',

  'settings.exportDefaults': '기본 내보내기 설정',
  'settings.format': '기본 포맷',
  'settings.pngSize': '기본 PNG 크기',
  'settings.color': '기본 색상',

  'settings.backup': '백업 및 복원',
  'settings.backup.help':
    '즐겨찾기, 내보내기 설정, SVG 워크스페이스(카테고리·저장 아이콘)를 하나의 파일로 백업합니다. 설정은 앱 업데이트 후에도 자동 보관되며, 백업 파일로 다른 기기로 옮기거나 복구할 수 있습니다.',
  'settings.backup.export': '백업 내보내기',
  'settings.backup.import': '백업 복원',
  'settings.backup.saveDialogTitle': '설정 백업 저장',
  'settings.backup.openDialogTitle': '복원할 백업 파일 선택',
  'settings.backup.saved': '백업을 저장했습니다. (저장 아이콘 {count}개 포함)',
  'settings.backup.failed': '백업 실패: {error}',
  'settings.backup.readFailed': '복원 파일 읽기 실패: {error}',
  'settings.backup.restoreFailed': '복원 실패: {error}',
  'settings.backup.restoreWarning':
    '{fileName} 으로 복원하면 현재 설정이 모두 덮어쓰여집니다. 복원 후 앱이 새로고침됩니다.',
  'settings.backup.restoreApply': '복원 적용',

  'license.button': '라이선스',
  'license.title': '아이콘 라이선스 정책',
  'license.intro':
    '이 앱의 아이콘은 Iconify 오픈소스 컬렉션에서 제공됩니다. 라이선스는 컬렉션마다 다르므로, 사용(특히 상업적 사용) 전 아래 내용을 확인하세요.',
  'license.curated.title': '큐레이션 컬렉션',
  'license.table.collection': '컬렉션',
  'license.table.license': '라이선스',
  'license.table.commercial': '상업적 사용',
  'license.table.obligation': '의무',
  'license.free': '✅ 자유',
  'license.conditional': '✅ 조건부',
  'license.note.copyright': '저작권 고지',
  'license.note.notice': '고지',
  'license.note.attribution': '출처(제작자) 표기 필수',
  'license.note.shareAlike': '출처 표기 + 동일 라이선스 공유',

  'license.types.title': '라이선스 유형',
  'license.types.permissive.term': 'MIT / Apache 2.0 / ISC',
  'license.types.permissive.desc':
    '사실상 자유롭게 상업적 사용 가능. 라이선스 텍스트·저작권 고지만 지키면 됩니다.',
  'license.types.ccby.term': 'CC BY (Game-icons)',
  'license.types.ccby.desc': '자유롭게 사용하되 제작자 출처 표기가 필요합니다.',
  'license.types.ccbysa.term': 'CC BY-SA (OpenMoji)',
  'license.types.ccbysa.desc':
    '출처 표기 + 파생물도 동일 라이선스로 공개해야 합니다(상업 제품 주의).',

  'license.unified.title': '⚠️ "통합" 검색 주의',
  'license.unified.p1':
    '기본값인 통합 검색은 Iconify의 모든 컬렉션(275,000+ / 150여 세트)을 포함하므로, 위 9개 외 세트가 결과에 섞일 수 있습니다.',
  'license.unified.p2': '이 경우 라이선스가 제각각이며 앱 화면에 표시되지 않을 수 있습니다.',
  'license.unified.p3':
    '브랜드/로고 세트는 오픈 라이선스라도 상표권이 별도로 적용되어 자유 사용이 아닐 수 있습니다.',

  'license.recommend.title': '권장사항',
  'license.recommend.item1': '큐레이션 세트(특히 MIT/Apache 계열)는 대체로 안전합니다.',
  'license.recommend.item2':
    'Game-icons는 출처 표기, OpenMoji는 share-alike 조건을 지키세요.',
  'license.recommend.item3':
    '상업적 사용 시 각 아이콘 카드의 "원본 보기" 페이지에서 정확한 라이선스를 확인하세요.',
  'license.disclaimer':
    '본 안내는 법률 자문이 아니며, 정확한 조건은 각 컬렉션의 원문 라이선스를 확인하시기 바랍니다.',

  'update.title.available': '업데이트 사용 가능',
  'update.title.downloading': '다운로드 중...',
  'update.title.installing': '설치 중...',
  'update.title.error': '업데이트 실패',
  'update.downloading.body': '업데이트를 다운로드하고 있습니다...',
  'update.installing.body': '업데이트를 설치하고 있습니다. 잠시만 기다려주세요...',
  'update.changelog': 'GitHub에서 변경 내역 보기',
  'update.later': '나중에',
  'update.now': '지금 업데이트',
  'update.checkFailed': '업데이트 확인 실패',
  'update.failed': '업데이트 실패',
} as const;
