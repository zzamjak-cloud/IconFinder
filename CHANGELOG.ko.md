# Changelog

[English](CHANGELOG.md) · **한국어**

이 프로젝트의 주요 변경 사항을 이 파일에 기록합니다.

이 문서의 형식은 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 준수합니다.

> IconFinder는 [IconMaker](https://github.com/zzamjak-cloud/IconMaker)의 후속 프로젝트입니다.
> IconMaker에서 분리되어 있던 검색/에디터 두 탭을 하나의 아이콘 워크스페이스로 통합했습니다.
> 1.0 이전 이력은 IconMaker 저장소를 참고하세요 — git 히스토리는 이 저장소에 그대로 보존되어 있습니다.

## [Unreleased]

## [1.0.0] - 2026-07-26

첫 릴리스. 아래는 앱 전체에 대한 설명입니다.

### 통합 워크스페이스

IconMaker의 두 탭(검색/에디터) — 각자 따로였던 검색·보관·내보내기 — 를
하나의 3분할 워크스페이스로 통합:

- **보관함** (왼쪽): 카테고리 금고 + ☆ 즐겨찾기 스마트 뷰
- **검색** (가운데): Iconify 전체를 대상으로 한 단일 검색. 스코프 칩
  (전체/큐레이션 팩/컬렉션 선택), 한글 검색어 확장, 페이지네이션, 가상화 결과 그리드
- **디테일** (오른쪽): 미리보기 + 기본은 퀵 내보내기(SVG/PNG·크기·색),
  펼치면 스타일 섹션(색상 모드·그레디언트·외곽선·발광·베벨)

### 동작 방식

- 검색 결과에서 별(★)을 누르면 **미분류** 카테고리에 favorite 플래그와 함께 저장 —
  나중에 카테고리로 드래그해 분류
- 퀵 내보내기는 항목 상태를 따름: 검색 결과는 원본, 보관함 아이콘은 저장된 스타일로 내보냄
- 일괄 내보내기는 선택 항목/카테고리 단위로 동작(즐겨찾기 전용 아님),
  스프라이트 내보내기는 카테고리 단위 유지

### IconMaker(0.x)에서 계승

- Iconify API 기반 275,000+ 아이콘 검색, 컬렉션별 라이선스 안내
- SVG 스타일링 엔진: 색상 모드·그레디언트·외곽선·발광·베벨·스타일 프리셋
- 11개 언어 다국어 지원(i18n): OS 로케일 자동 감지, 설정에서 변경, Tauri Store 영속화
- 설정 백업/복원(단일 파일), 기본 저장 폴더 자동 저장
- GitHub Releases 자동 업데이트, 업데이트 팝업은 CHANGELOG 링크 제공

[unreleased]: https://github.com/zzamjak-cloud/IconFinder/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zzamjak-cloud/IconFinder/releases/tag/v1.0.0
