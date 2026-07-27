export const koErrorTranslations = {
  'error.unknown': '알 수 없는 오류',

  'error.iconSearchFailed': '아이콘 검색 실패',
  'error.svgDownloadFailed': 'SVG 다운로드 실패',
  'error.collectionsFailed': '컬렉션 목록 가져오기 실패',
  'error.noFilePath': '파일 경로를 선택하지 않았습니다',
  'error.invalidBackup': '유효하지 않은 백업 파일입니다.',
  'error.backupInvalidFormat': '형식이 올바르지 않습니다.',

  'error.svg.noRoot': 'SVG 루트 태그를 찾을 수 없습니다.',
  'error.svg.notSvg': '루트 요소가 svg가 아닙니다.',

  'error.rust.testSvgParse': '테스트 SVG 파싱 실패: {detail}',
  'error.rust.svgParse': 'SVG 파싱 실패: {detail}',
  'error.rust.zeroSize': 'SVG 크기가 0입니다',
  'error.rust.pixmap': 'Pixmap 생성 실패',
  'error.rust.noPixels': '렌더링된 이미지에 픽셀이 없습니다',
  'error.rust.pngEncode': 'PNG 인코딩 실패: {detail}',
  'error.rust.fileSave': '파일 저장 실패: {detail}',
  'error.rust.fileRead': '파일 읽기 실패: {detail}',
  'error.rust.noDownloadDir': '다운로드 폴더를 찾을 수 없습니다',
  'error.rust.createDir': '폴더 생성 실패: {detail}',
  'error.rust.pathConvert': '경로를 문자열로 변환할 수 없습니다',
  'error.rust.icoSize': 'ICO 크기는 16~256이어야 합니다',
  'error.rust.icoEncode': 'ICO 파일 생성에 실패했습니다: {detail}',
  'error.rust.icnsSize': 'ICNS 크기는 16~1024이어야 합니다',
  'error.rust.icnsEncode': 'ICNS 파일 생성에 실패했습니다: {detail}',
} as const;
