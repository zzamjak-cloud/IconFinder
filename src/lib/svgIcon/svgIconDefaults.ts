import type { TranslationKey, Translator } from '@/i18n';
import {
  SvgIconCategory,
  SvgWorkspaceData,
  SvgIconStylePreset,
  SvgIconViewBox,
} from '../../types/svgIcon';

export interface SvgIconStylePresetInfo {
  id: SvgIconStylePreset;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export const SVG_ICON_STYLE_PRESETS: SvgIconStylePresetInfo[] = [
  {
    id: 'casual-bold',
    labelKey: 'preset.casual-bold.label',
    descriptionKey: 'preset.casual-bold.desc',
  },
  {
    id: 'flat-ui',
    labelKey: 'preset.flat-ui.label',
    descriptionKey: 'preset.flat-ui.desc',
  },
  {
    id: 'neon-arcade',
    labelKey: 'preset.neon-arcade.label',
    descriptionKey: 'preset.neon-arcade.desc',
  },
  {
    id: 'pixel-ish',
    labelKey: 'preset.pixel-ish.label',
    descriptionKey: 'preset.pixel-ish.desc',
  },
  {
    id: 'minimal-line',
    labelKey: 'preset.minimal-line.label',
    descriptionKey: 'preset.minimal-line.desc',
  },
];

// 기본 카테고리 템플릿의 안정 키. 표시 문구는 언어팩(categoryTemplate.<key>.name/desc)에서 온다.
export type SvgIconCategoryTemplateKey =
  | 'combat'
  | 'skillElement'
  | 'item'
  | 'statusEffect'
  | 'ui'
  | 'resource'
  | 'currency'
  | 'character'
  | 'petMount'
  | 'building'
  | 'food'
  | 'nature'
  | 'reward'
  | 'achievement'
  | 'social'
  | 'direction'
  | 'sound'
  | 'emotion'
  | 'tool'
  | 'exploration';

/**
 * 예약 카테고리 "미분류"의 템플릿 키.
 * 기본 게임 카테고리 20종에는 포함되지 않으며(자동 생성 대상 아님),
 * 검색 결과에서 빠르게 담은 아이콘이 들어갈 자리로만 필요할 때 생성된다.
 * 표시 문구는 다른 템플릿과 동일하게 언어팩(categoryTemplate.uncategorized.name/desc)에서 온다.
 */
export const UNCATEGORIZED_TEMPLATE_KEY = 'uncategorized';

// 미분류 카테고리의 색(중립 회색)
const UNCATEGORIZED_COLOR = '#94a3b8';

export interface SvgIconCategoryTemplate {
  key: SvgIconCategoryTemplateKey;
  color: string;
  recommendedQuery: string;
}

// 캐주얼 게임에 자주 쓰이는 기본 카테고리. recommendedQuery는 영어(검색 정확도가 더 높음).
// 표시용 이름/설명은 key로 번역해서 얻는다(getCategoryDisplayName/Description).
export const DEFAULT_CATEGORY_TEMPLATES: SvgIconCategoryTemplate[] = [
  { key: 'combat', color: '#ef4444', recommendedQuery: 'sword' },
  { key: 'skillElement', color: '#f59e0b', recommendedQuery: 'fire' },
  { key: 'item', color: '#10b981', recommendedQuery: 'potion' },
  { key: 'statusEffect', color: '#8b5cf6', recommendedQuery: 'shield' },
  { key: 'ui', color: '#0ea5e9', recommendedQuery: 'settings' },
  { key: 'resource', color: '#eab308', recommendedQuery: 'energy' },
  { key: 'currency', color: '#facc15', recommendedQuery: 'coin' },
  { key: 'character', color: '#f472b6', recommendedQuery: 'character' },
  { key: 'petMount', color: '#22c55e', recommendedQuery: 'pet' },
  { key: 'building', color: '#a855f7', recommendedQuery: 'castle' },
  { key: 'food', color: '#fb923c', recommendedQuery: 'food' },
  { key: 'nature', color: '#34d399', recommendedQuery: 'tree' },
  { key: 'reward', color: '#e879f9', recommendedQuery: 'chest' },
  { key: 'achievement', color: '#fbbf24', recommendedQuery: 'trophy' },
  { key: 'social', color: '#38bdf8', recommendedQuery: 'chat' },
  { key: 'direction', color: '#94a3b8', recommendedQuery: 'arrow' },
  { key: 'sound', color: '#60a5fa', recommendedQuery: 'sound' },
  { key: 'emotion', color: '#fda4af', recommendedQuery: 'emoji' },
  { key: 'tool', color: '#cbd5e1', recommendedQuery: 'hammer' },
  { key: 'exploration', color: '#2dd4bf', recommendedQuery: 'map' },
];

// 템플릿 키 → 추천 검색어(영어) 조회표.
const RECOMMENDED_QUERY_BY_TEMPLATE_KEY: Record<string, string> = DEFAULT_CATEGORY_TEMPLATES.reduce(
  (acc, template) => {
    acc[template.key] = template.recommendedQuery;
    return acc;
  },
  {} as Record<string, string>
);

// i18n 도입 전에 저장된 워크스페이스 호환용: 한국어 카테고리 이름 → 템플릿 키.
// 이 문자열들은 표시용이 아니라 과거 저장 데이터의 식별자이므로 절대 번역하지 않는다.
export const LEGACY_CATEGORY_NAME_TO_TEMPLATE_KEY: Record<string, SvgIconCategoryTemplateKey> = {
  전투: 'combat',
  '스킬 속성': 'skillElement',
  아이템: 'item',
  '상태 효과': 'statusEffect',
  UI: 'ui',
  자원: 'resource',
  재화: 'currency',
  캐릭터: 'character',
  '펫/탈것': 'petMount',
  '건물/시설': 'building',
  음식: 'food',
  '자연/환경': 'nature',
  '보상/상자': 'reward',
  '업적/랭킹': 'achievement',
  소셜: 'social',
  '방향/조작': 'direction',
  '사운드/설정': 'sound',
  '감정/이모지': 'emotion',
  도구: 'tool',
  '탐험/지도': 'exploration',
};

function isTemplateKey(value: string | undefined): value is SvgIconCategoryTemplateKey {
  return !!value && value in RECOMMENDED_QUERY_BY_TEMPLATE_KEY;
}

// 표시 문구를 언어팩에서 가져오는 키 집합(기본 템플릿 20종 + 예약 키 '미분류').
function isDisplayTemplateKey(value: string | undefined): value is string {
  return isTemplateKey(value) || value === UNCATEGORIZED_TEMPLATE_KEY;
}

// 카테고리의 템플릿 키를 구한다(저장된 templateKey 우선, 레거시 한국어 이름 폴백).
function resolveTemplateKey(
  category: SvgIconCategory | null | undefined
): SvgIconCategoryTemplateKey | undefined {
  if (!category) return undefined;
  if (isTemplateKey(category.templateKey)) return category.templateKey;
  return LEGACY_CATEGORY_NAME_TO_TEMPLATE_KEY[category.name];
}

// 카테고리 표시 이름: 기본 템플릿이면 번역문, 사용자가 만든/이름을 바꾼 카테고리는 저장값.
export function getCategoryDisplayName(category: SvgIconCategory, t: Translator): string {
  if (isDisplayTemplateKey(category.templateKey)) {
    return t(`categoryTemplate.${category.templateKey}.name` as TranslationKey);
  }
  return category.name;
}

// 카테고리 표시 설명: 규칙은 getCategoryDisplayName과 동일.
export function getCategoryDisplayDescription(category: SvgIconCategory, t: Translator): string {
  if (isDisplayTemplateKey(category.templateKey)) {
    return t(`categoryTemplate.${category.templateKey}.desc` as TranslationKey);
  }
  return category.description ?? '';
}

// 카테고리의 추천 검색어를 구한다(저장값 → templateKey → 레거시 이름 매칭).
export function getRecommendedQueryForCategory(category: SvgIconCategory | null | undefined): string {
  if (!category) return '';
  if (category.recommendedQuery) return category.recommendedQuery;
  const templateKey = resolveTemplateKey(category);
  return templateKey ? RECOMMENDED_QUERY_BY_TEMPLATE_KEY[templateKey] ?? '' : '';
}

/**
 * 기존 저장 데이터를 templateKey 기반으로 승격하고, 자동 생성됐던 빈 기본 카테고리를 정리한다.
 * - templateKey가 없고 이름이 레거시 한국어 기본 카테고리와 일치하면 키를 부여하고 name/description을 비운다.
 * - v1.1 정책: 기본 템플릿 카테고리는 더 이상 자동 생성하지 않으므로,
 *   아이콘이 하나도 없는 템플릿 카테고리는 제거한다(아이콘이 있으면 사용자 데이터로 보고 유지).
 * - 변경이 없으면 같은 참조를 반환해 호출부가 저장을 건너뛸 수 있게 한다.
 */
export function migrateSvgWorkspaceCategories(data: SvgWorkspaceData): SvgWorkspaceData {
  let changed = false;
  const usedCategoryIds = new Set(data.icons.map((icon) => icon.categoryId));
  const categories = data.categories
    .filter((category) => {
      const isEmptyTemplate =
        !!category.templateKey &&
        category.templateKey !== UNCATEGORIZED_TEMPLATE_KEY &&
        category.iconIds.length === 0 &&
        !usedCategoryIds.has(category.id);
      if (isEmptyTemplate) changed = true;
      return !isEmptyTemplate;
    })
    .map((category) => {
      if (isTemplateKey(category.templateKey)) return category;
      const templateKey = LEGACY_CATEGORY_NAME_TO_TEMPLATE_KEY[category.name];
      if (!templateKey) return category;
      changed = true;
      return { ...category, templateKey, name: '', description: '' };
    });

  if (!changed) return data;
  // 선택 중이던 카테고리가 제거됐으면 선택을 해제한다.
  const selectedCategoryId = categories.some((category) => category.id === data.selectedCategoryId)
    ? data.selectedCategoryId
    : undefined;
  return { ...data, categories, selectedCategoryId };
}

// 워크스페이스 첫 진입 시 검색 입력 기본값(영어)
export const DEFAULT_SVG_ICON_SEARCH_QUERY = DEFAULT_CATEGORY_TEMPLATES[0]?.recommendedQuery ?? 'sword';

export const SVG_ICON_VIEW_BOXES: SvgIconViewBox[] = [
  '0 0 64 64',
  '0 0 100 100',
  '0 0 128 128',
  '0 0 256 256',
  '0 0 512 512',
];

export function getSvgIconViewBoxLabel(viewBox: string): string {
  const [, , width, height] = viewBox.trim().split(/\s+/);
  return width && height ? `${width}x${height}` : viewBox;
}

export function createSvgIconId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 기본 SVG 워크스페이스 데이터 생성.
// v1.1 정책: 기본 카테고리를 자동 생성하지 않는다 — 사용자가 직접 만든 카테고리만 존재한다.
export function createDefaultSvgWorkspaceData(): SvgWorkspaceData {
  const now = new Date().toISOString();
  return {
    categories: [],
    icons: [],
    selectedCategoryId: undefined,
    stylePreset: 'casual-bold',
    defaultViewBox: '0 0 64 64',
    customColorPresets: [],
    updatedAt: now,
  };
}

/**
 * 워크스페이스에 "미분류" 카테고리를 보장한다.
 * - 이미 있으면(templateKey === UNCATEGORIZED_TEMPLATE_KEY) 그대로 반환하고 data 참조도 유지한다.
 * - 없으면 목록 끝에 새로 추가한 새 data를 반환한다.
 */
export function ensureUncategorizedCategory(
  data: SvgWorkspaceData
): { data: SvgWorkspaceData; category: SvgIconCategory } {
  const existing = data.categories.find(
    (category) => category.templateKey === UNCATEGORIZED_TEMPLATE_KEY
  );
  if (existing) return { data, category: existing };

  const now = new Date().toISOString();
  const category: SvgIconCategory = {
    id: createSvgIconId('svg-cat'),
    templateKey: UNCATEGORIZED_TEMPLATE_KEY,
    // 표시 문구는 templateKey 번역에서 오므로 저장값은 비워 둔다.
    name: '',
    description: '',
    color: UNCATEGORIZED_COLOR,
    recommendedQuery: '',
    iconIds: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    data: { ...data, categories: [...data.categories, category] },
    category,
  };
}

export function getSvgIconStylePresetInfo(stylePreset: SvgIconStylePreset): SvgIconStylePresetInfo {
  return SVG_ICON_STYLE_PRESETS.find((preset) => preset.id === stylePreset) ?? SVG_ICON_STYLE_PRESETS[0];
}
