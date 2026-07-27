# IconFinder

[English](README.md) · **한국어**

**웹사이트:** [zzamjak-cloud.github.io/IconFinder](https://zzamjak-cloud.github.io/IconFinder/) — 제품 소개, 설치 가이드, 기능 안내 (한/영).

데스크톱 아이콘 워크스페이스 — Iconify 아이콘 275,000+개를 검색하고, 보관함으로 정리하고, 스타일을 입혀 SVG/PNG로 내보내는 것까지 한 화면에서.

> IconFinder는 [IconMaker](https://github.com/zzamjak-cloud/IconMaker)의 후속 프로젝트로, 분리되어 있던 검색/에디터 두 탭을 하나의 통합 워크스페이스로 합쳤습니다.

## 워크스페이스

탭 대신 3분할 단일 화면:

### 📚 보관함 (왼쪽)
- 카테고리별 아이콘 정리 (캐주얼 게임용 기본 카테고리 20종 + 미분류)
- ☆ **즐겨찾기 스마트 뷰** — 모든 카테고리의 별표 아이콘을 한곳에서
- 카테고리 간 드래그 이동, 카테고리 단위 스프라이트 시트 내보내기
- 카테고리 선택 시 추천 검색어 자동 입력

### 🔍 검색 (가운데)
- Iconify API 전체(275,000+ 아이콘)를 대상으로 한 단일 검색
- **스코프 칩**: 전체 / 큐레이션 팩(게임·UI/HUD·픽셀·시스템·이모지) / 임의 컬렉션 1개
- 한글 검색어를 영어 Iconify 태그로 자동 확장
- 페이지네이션 + 가상화 결과 그리드, 컬럼 수 조절
- 결과에서 ★ 클릭 → 미분류에 즐겨찾기로 바로 담기, 저장 버튼 → 선택한 카테고리로

### 🎛️ 디테일 (오른쪽)
- 기본은 **퀵 내보내기**: SVG/PNG + 크기 조절 — 검색 결과는 원본, 보관함 아이콘은 저장된 스타일로
- 펼치면 **스타일** 섹션: 색상 모드(원본/단색/투톤/그레디언트/입체), 효과(그림자·외부/내부 발광·베벨·외곽선) 색·강도 조절, 108색 팔레트 + HEX 입력
- SVG / HTML / CSS 복사, 선택 항목·카테고리 단위 일괄 내보내기

### ⚙️ 설정 · 백업
- 11개 언어 UI — OS 로케일 자동 감지, 설정에서 변경
- 기본 저장 폴더 자동 저장
- 전체 설정을 JSON 파일 하나로 백업/복원 — IconMaker(v1) 백업도 즐겨찾기 포함 그대로 가져오기 가능
- 앱 업데이트 후에도 데이터 유지 (Tauri Store)

## 기술 스택

- **프론트엔드**: Tauri 2.0 + React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Lucide
- **상태 관리**: TanStack Query + Zustand
- **백엔드**: Rust + resvg (SVG→PNG)
- **영속성**: Tauri Store Plugin

## 다운로드

- **macOS / Windows:** [GitHub Releases](https://github.com/zzamjak-cloud/IconFinder/releases/latest)
- 설치 절차 (Gatekeeper / SmartScreen): [웹사이트 → 설치](https://zzamjak-cloud.github.io/IconFinder/#install)

## 개발

```bash
npm install
npm run tauri dev      # 개발 실행
npm run tauri build    # 프로덕션 빌드
npx tsc --noEmit       # 타입 체크
```

## GitHub Pages

공개 사이트는 [`docs/`](./docs/)에 있으며, `main` 브랜치의 `/docs` 폴더에서 게시됩니다.

## 라이선스

각 아이콘은 해당 아이콘 세트(Iconify 컬렉션)의 라이선스 정책을 따릅니다.
