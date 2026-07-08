# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.3] - 2026-07-08

### Fixed
- 에디터 탭의 분할 드래그 핸들러를 클릭하는 순간 핸들러 위치가 위로 이동하던 문제 수정
- 상단 검색창 입력/삭제 시 전체 아이콘 그리드가 과도하게 다시 렌더링되던 문제 완화

### Changed
- 에디터 검색 결과와 저장된 아이콘을 상하 분할 화면으로 재배치
- 검색 결과와 저장된 아이콘 그리드를 가상화하고 검색 표시 개수를 48개로 조정
- 상단 검색창에 검색어 즉시 삭제 버튼 추가

## [0.3.2] - 2026-07-07

### Fixed
- 검색 그리드가 넓은 화면에서 카드 크기만 커지고 행 간격이 따라가지 않아 카드가 겹치던 문제 수정

### Changed
- 헤더 설명 문구를 제거하고 `package.json` 기준 현재 버전을 표시하도록 변경

## [0.3.1] - 2026-06-30

### Fixed
- 자동 업데이트로 재시작될 때 에디터 탭의 저장된 아이콘이 유실되던 문제 수정
  - 재시작 직전 대기 중인 워크스페이스 저장을 디스크에 강제 반영(flush)
  - 로드 실패 시 기존 데이터를 기본값으로 덮어쓰지 않도록 보호
  - 화면 숨김/종료/탭 전환 시 즉시 저장

## [0.3.0] - 2026-06-30

### Added
- 검색 결과 페이지네이션 (이름 풀 조회 + 페이지 단위 SVG 로드, 이전/번호/다음)
- 라이선스 안내 다이얼로그 및 헤더 "라이선스" 버튼 (컬렉션별 라이선스·통합 검색 주의)
- 커스텀 색상 선택기를 효과(그림자/발광)·외곽선 색상에도 적용

### Changed
- 검색 표시 개수를 100개로 고정 (24/48/72 드롭다운 제거)
- 검색 기본 소스를 "통합"으로 변경하고 목록 첫 항목으로 배치
- 커스텀 색상 선택기 팝업을 화면 안에 들어오도록 위치 보정 (가림 현상 해결)
- 내부 발광은 콘텐츠 기준(아웃라인 제외), 그림자/외부 발광은 아웃라인 포함

### Removed
- "저장 아이콘 필터" 입력 (불필요)
- 검색 완료 토스트 알림 (UX 흔들림 제거)

## [0.2.0] - 2026-06-30

### Added
- **SVG 워크스페이스(에디터 탭)**: StyleStudio의 SVG 세션 기능을 단일 패널로 이식
  - 카테고리별 아이콘 수집·관리, 캐주얼 게임용 기본 카테고리 20종
  - 카테고리 선택 시 영어 추천 검색어 자동 입력 (한글보다 정확)
  - SVG/PNG/스프라이트/HTML 스니펫 내보내기, SVG·HTML·CSS 복사
- **스타일 효과 시스템** (SVG 필터 기반, HTML·PNG 호환):
  - 그림자, 외부/내부 발광, 베벨(양각/음각) — 각 색상·강도 조절
  - 외곽선 효과 (색상·굵기), 그림자는 외곽선 포함·내부 발광은 콘텐츠 기준
  - 색상 모드(원본/단색/투톤)와 마감(그레디언트/입체)을 단일 스타일 셀렉터로 통합
- **커스텀 색상 선택기**: 108색 팔레트 팝업 + 직접 선택/HEX 입력
- **전체 설정 백업/복원**: 즐겨찾기·내보내기 설정·SVG 워크스페이스를 JSON으로 백업·복구
- 검색/에디터 뷰 전환 토글, 그리드 컬럼 비율에 맞춘 이미지 스케일

### Changed
- 그리드 슬라이더를 검색 결과 라인으로 이동, 헤더 탭 중앙 정렬
- 탭별 불필요한 컨트롤 비활성화 (에디터 탭에서 검색 전용 컨트롤 숨김)

## [0.1.2] - 2026-02-05

### Fixed
- PNG 내보내기 버그 수정

## [0.1.1] - 2026-02-05

### Added
- GitHub Actions CI/CD 파이프라인 구축
- Tauri Updater를 통한 자동 업데이트 시스템
- 버전 관리 자동화 스크립트 (`npm run version:bump`)
- 업데이트 다이얼로그 UI 컴포넌트

### Changed
- 앱 아이콘 디자인 변경 및 모든 플랫폼 아이콘 업데이트
- 개발 워크플로우 개선

## [0.1.0] - 2026-02-05

### Added
- 초기 프로젝트 설정
- Iconify API 기반 아이콘 검색 기능
- 즐겨찾기 기능
- SVG/PNG 내보내기 기능
- 일괄 내보내기 기능
- 설정 관리 (기본 폴더, 내보내기 옵션)
- 다크 모드 지원

[unreleased]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.3.3...HEAD
[0.3.3]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/zzamjak-cloud/IconMaker/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/zzamjak-cloud/IconMaker/releases/tag/v0.1.0
