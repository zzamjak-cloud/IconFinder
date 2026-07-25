# IconMaker

[English](README.md) · **한국어**

Iconify 라이브러리를 활용해 아이콘 SVG/PNG를 검색·스타일링·내보내는 데스크톱 앱입니다.

## 주요 기능

### 🔍 아이콘 검색 (검색 탭)
- Iconify API 기반 275,000+ 아이콘 검색
- 즐겨찾기 및 캐싱
- SVG / PNG 내보내기, 일괄 내보내기
- 그리드 컬럼 수 조절 (이미지 비율 연동)

### 🎨 SVG 워크스페이스 (에디터 탭)
- 카테고리별 아이콘 수집·관리 (캐주얼 게임용 기본 카테고리 20종)
- 카테고리 선택 시 영어 추천 검색어 자동 입력
- **스타일링**: 색상 모드(원본/단색/투톤)·그레디언트·입체를 단일 스타일 셀렉터로 통합
- **효과**(SVG 필터, HTML·PNG 호환): 그림자 · 외부/내부 발광 · 베벨(양각/음각) · 외곽선
  - 각 효과 색상·강도 조절, 그림자는 외곽선 포함 / 내부 발광은 콘텐츠 기준
- **커스텀 색상 선택기**: 108색 팔레트 + 직접 선택 / HEX 입력
- 내보내기: 개별 SVG/PNG, 스프라이트, HTML 스니펫 / 복사: SVG·HTML·CSS

### ⚙️ 설정 · 백업
- 기본 저장 폴더, 자동 저장
- 전체 설정 백업/복원 (즐겨찾기·내보내기 설정·SVG 워크스페이스를 JSON으로)
- 데이터는 앱 업데이트 후에도 유지 (Tauri Store)

## 기술 스택

- **Frontend**: Tauri 2.0 + React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Lucide
- **State**: TanStack Query + Zustand
- **Backend**: Rust + resvg (SVG→PNG)
- **영속성**: Tauri Store Plugin

## 개발

```bash
npm install
npm run tauri dev      # 개발 실행
npm run tauri build    # 프로덕션 빌드
npx tsc --noEmit       # 타입체크
```

## 라이선스

각 아이콘의 라이선스는 해당 아이콘 세트(Iconify 컬렉션)의 정책을 따릅니다.
