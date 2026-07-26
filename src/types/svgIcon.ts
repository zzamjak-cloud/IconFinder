export type SvgIconStylePreset =
  | 'casual-bold'
  | 'flat-ui'
  | 'neon-arcade'
  | 'pixel-ish'
  | 'minimal-line';

export type SvgIconViewBox =
  | '0 0 64 64'
  | '0 0 100 100'
  | '0 0 128 128'
  | '0 0 256 256'
  | '0 0 512 512';
export type SvgIconSource = 'iconify';
export type SvgIconColorMode = 'original' | 'monochrome' | 'duotone';
export type SvgIconFinishMode = 'flat' | 'outlined' | 'gradient' | 'raised';

// 베벨 모드: 없음 / 양각 / 음각
export type SvgIconBevelMode = 'none' | 'raised' | 'engraved';

// 색상 + 강도를 가진 발광/그림자 효과
export interface SvgIconGlowEffect {
  enabled: boolean;
  color: string;
  intensity: number; // 강도 0~100
}

// 베벨 효과(색상 없음)
export interface SvgIconBevelEffect {
  mode: SvgIconBevelMode;
  intensity: number; // 강도 0~100
}

// 합성 가능한 스타일 효과 묶음
export interface SvgIconEffects {
  dropShadow: SvgIconGlowEffect;
  outerGlow: SvgIconGlowEffect;
  innerGlow: SvgIconGlowEffect;
  bevel: SvgIconBevelEffect;
}

export interface SvgIconStyleSnapshot {
  colorMode: SvgIconColorMode;
  finishMode: SvgIconFinishMode;
  primaryColor: string;
  accentColor: string;
  outlineColor: string;
  outlineWidth: number;
  // 외곽선 효과 토글(옵셔널: 기존 스냅샷 호환). 미지정 시 finishMode==='outlined'로 마이그레이션.
  outlineEnabled?: boolean;
  stylePreset: SvgIconStylePreset;
  viewBox: SvgIconViewBox;
  // 옵셔널: 기존 스냅샷과의 호환을 위해 선택적
  effects?: SvgIconEffects;
}

export interface SvgIconSearchResult {
  id: string;
  name: string;
  collection: string;
  icon: string;
  source: SvgIconSource;
  sourceName: string;
  sourceUrl: string;
  license?: string;
  svg: string;
  tags: string[];
}

export interface SvgIconCategory {
  id: string;
  // 기본 카테고리 템플릿 키. 있으면 표시 문구를 언어팩에서 가져온다(사용자 생성 카테고리는 없음).
  templateKey?: string;
  name: string;
  description?: string;
  color: string;
  // 카테고리 선택 시 검색 입력에 자동 채워지는 추천 검색어(영어)
  recommendedQuery?: string;
  iconIds: string[];
  createdAt: string;
  updatedAt: string;
}

// 컬러 프리셋(내장 + 사용자 지정 공통 형태)
export interface SvgIconColorPreset {
  id: string;
  label: string;
  primary: string;
  accent: string;
}

export interface SvgIconCandidate {
  id: string;
  name: string;
  prompt: string;
  tags: string[];
}

export interface SvgGameIcon {
  id: string;
  categoryId: string;
  name: string;
  prompt: string;
  /**
   * 스타일이 적용된 SVG 원문.
   * 빈 문자열('')이면 **라이트 항목**이다 — 이름만 저장된 상태(예: v1 백업 가져오기로 이관된 구 즐겨찾기).
   * 최초 표시 시 sourceId로 SVG를 받아와 채운 뒤(하이드레이션) 워크스페이스에 저장한다.
   */
  svg: string;
  originalSvg?: string;
  tags: string[];
  stylePreset: SvgIconStylePreset;
  viewBox: string;
  source?: SvgIconSource;
  /** Iconify 전체 이름 "prefix:name". 지연 로드(하이드레이션)와 원본 보기 링크의 기준. */
  sourceId?: string;
  sourceName?: string;
  sourceUrl?: string;
  license?: string;
  styleSnapshot?: SvgIconStyleSnapshot;
  /** 즐겨찾기 플래그. 앱 전체에서 유일한 즐겨찾기 수단. */
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

// SVG 워크스페이스 데이터 (StyleStudio의 SvgIconSessionData를 세션 색채 제거 후 개명)
export interface SvgWorkspaceData {
  categories: SvgIconCategory[];
  icons: SvgGameIcon[];
  selectedCategoryId?: string;
  stylePreset: SvgIconStylePreset;
  defaultViewBox: SvgIconViewBox;
  // 사용자가 저장한 커스텀 컬러 프리셋
  customColorPresets?: SvgIconColorPreset[];
  updatedAt: string;
}
