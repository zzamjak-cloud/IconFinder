import type { TranslationKey } from '@/i18n';
import { SvgIconSearchResult, SvgIconStylePreset } from '../../types/svgIcon';
import { sanitizeSvg } from './svgSanitizer';

interface IconifySearchResponse {
  icons?: string[];
}

const ICONIFY_API_BASE = 'https://api.iconify.design';
const ICONIFY_PAGE_BASE = 'https://icon-sets.iconify.design';
const ICONIFY_FETCH_CONCURRENCY = 8;

export type SvgIconSourcePackId = 'all' | 'game' | 'ui' | 'pixel' | 'material' | 'emoji';

/**
 * 검색 범위. 앱 전체가 이 한 가지 검색 경로를 쓴다.
 * - all: 전체 Iconify (prefix 제한 없음)
 * - pack: 큐레이션 소스팩 1종 (prefix 묶음)
 * - collection: 임의의 Iconify 컬렉션 1개
 */
export type SvgIconSearchScope =
  | { type: 'all' }
  | { type: 'pack'; packId: SvgIconSourcePackId }
  | { type: 'collection'; prefix: string };

export const DEFAULT_SVG_ICON_SEARCH_SCOPE: SvgIconSearchScope = { type: 'all' };

export interface SearchSvgIconNamesOptions {
  stylePreset: SvgIconStylePreset;
  scope?: SvgIconSearchScope;
  poolLimit?: number;
}

// Iconify /search 호출 1건의 범위 파라미터. prefixes(복수) 또는 prefix(단일 컬렉션).
interface IconifySearchScopeGroup {
  prefixes?: string[];
  prefix?: string;
}

export interface SvgIconSourcePack {
  id: SvgIconSourcePackId;
  labelKey: TranslationKey;
  prefixes?: string[];
}

export const SVG_ICON_SOURCE_PACKS: SvgIconSourcePack[] = [
  { id: 'all', labelKey: 'sourcePack.all', prefixes: undefined },
  { id: 'game', labelKey: 'sourcePack.game', prefixes: ['game-icons'] },
  { id: 'ui', labelKey: 'sourcePack.ui', prefixes: ['lucide', 'tabler', 'iconoir'] },
  { id: 'pixel', labelKey: 'sourcePack.pixel', prefixes: ['pixelarticons'] },
  { id: 'material', labelKey: 'sourcePack.material', prefixes: ['mdi', 'material-symbols'] },
  { id: 'emoji', labelKey: 'sourcePack.emoji', prefixes: ['openmoji', 'noto'] },
];

// 아래 한국어 문자열은 화면 표시 문구가 아니라 "입력 매칭"용이다.
// 사용자가 한국어로 검색해도 Iconify의 영어 태그를 찾도록 확장하는 규칙이므로 번역·삭제하지 말 것.
const QUERY_EXPANSIONS: Array<{ pattern: RegExp; terms: string[] }> = [
  { pattern: /검|칼|sword|blade/i, terms: ['sword', 'blade', 'weapon'] },
  { pattern: /방패|shield|guard|armor/i, terms: ['shield', 'guard', 'armor'] },
  { pattern: /물약|포션|potion|elixir|flask|vial/i, terms: ['potion', 'flask', 'vial', 'elixir'] },
  { pattern: /하트|생명|체력|heart|life|health|hp/i, terms: ['heart', 'health', 'life'] },
  { pattern: /열쇠|키|key|unlock/i, terms: ['key', 'unlock'] },
  { pattern: /보석|젬|크리스탈|gem|jewel|crystal|diamond/i, terms: ['gem', 'jewel', 'crystal', 'diamond'] },
  { pattern: /상자|보물|chest|box|crate/i, terms: ['chest', 'treasure', 'crate', 'box'] },
  { pattern: /동전|골드|coin|gold|money/i, terms: ['coin', 'gold', 'money'] },
  { pattern: /불|화염|fire|flame/i, terms: ['fire', 'flame'] },
  { pattern: /얼음|ice|frost|snow/i, terms: ['ice', 'frost', 'snowflake'] },
  { pattern: /번개|전기|lightning|thunder/i, terms: ['lightning', 'thunder', 'bolt'] },
  { pattern: /독|poison|venom|toxic/i, terms: ['poison', 'venom', 'toxic'] },
  { pattern: /지도|map|quest/i, terms: ['map', 'quest', 'scroll'] },
  { pattern: /설정|옵션|setting|gear|cog/i, terms: ['settings', 'gear', 'cog'] },
  { pattern: /상점|shop|store|market/i, terms: ['shop', 'store', 'market'] },
];

const COLLECTION_LABELS: Record<string, string> = {
  'game-icons': 'Game-icons.net',
  lucide: 'Lucide',
  tabler: 'Tabler Icons',
  mdi: 'Material Design Icons',
  iconoir: 'Iconoir',
  pixelarticons: 'Pixelarticons',
  'material-symbols': 'Material Symbols',
  openmoji: 'OpenMoji',
  noto: 'Noto Emoji',
};

const COLLECTION_LICENSES: Record<string, string> = {
  'game-icons': 'CC BY 3.0',
  lucide: 'ISC',
  tabler: 'MIT',
  mdi: 'Apache 2.0',
  iconoir: 'MIT',
  pixelarticons: 'MIT',
  'material-symbols': 'Apache 2.0',
  openmoji: 'CC BY-SA 4.0',
  noto: 'Apache 2.0',
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function expandSvgIconSearchQuery(query: string): string[] {
  const normalized = query.trim();
  const terms = [normalized];
  for (const expansion of QUERY_EXPANSIONS) {
    if (expansion.pattern.test(normalized)) {
      terms.push(...expansion.terms);
    }
  }
  terms.push(...normalized.split(/[\s,/_-]+/));
  return unique(terms).slice(0, 6);
}

function collectionPriority(prefix: string, stylePreset: SvgIconStylePreset): number {
  const pixelPriority = ['pixelarticons', 'game-icons', 'lucide', 'tabler', 'iconoir', 'mdi', 'material-symbols', 'openmoji', 'noto'];
  const gamePriority = ['game-icons', 'iconoir', 'lucide', 'tabler', 'mdi', 'pixelarticons', 'material-symbols', 'openmoji', 'noto'];
  const list = stylePreset === 'pixel-ish' ? pixelPriority : gamePriority;
  const index = list.indexOf(prefix);
  return index === -1 ? 99 : index;
}

async function fetchIconifySearch(
  term: string,
  limit: number,
  group: IconifySearchScopeGroup
): Promise<string[]> {
  const params = new URLSearchParams({ query: term, limit: String(limit) });
  if (group.prefix) {
    params.set('prefix', group.prefix);
  } else if (group.prefixes && group.prefixes.length > 0) {
    params.set('prefixes', group.prefixes.join(','));
  }
  const response = await fetch(`${ICONIFY_API_BASE}/search?${params.toString()}`);
  if (!response.ok) return [];
  const data = (await response.json()) as IconifySearchResponse;
  return data.icons ?? [];
}

function parseIconName(iconName: string): { prefix: string; name: string } | null {
  const [prefix, ...rest] = iconName.split(':');
  const name = rest.join(':');
  if (!prefix || !name) return null;
  return { prefix, name };
}

async function fetchIconSvg(iconName: string): Promise<SvgIconSearchResult | null> {
  const parsed = parseIconName(iconName);
  if (!parsed) return null;

  const response = await fetch(`${ICONIFY_API_BASE}/${parsed.prefix}/${parsed.name}.svg`);
  if (!response.ok) return null;

  const rawSvg = await response.text();
  const sanitized = sanitizeSvg(rawSvg);
  if (!sanitized.ok) return null;

  const label = COLLECTION_LABELS[parsed.prefix] ?? parsed.prefix;
  return {
    id: iconName,
    name: parsed.name.replace(/-/g, ' '),
    collection: parsed.prefix,
    icon: parsed.name,
    source: 'iconify',
    sourceName: label,
    sourceUrl: `${ICONIFY_PAGE_BASE}/${parsed.prefix}/${parsed.name}/`,
    license: COLLECTION_LICENSES[parsed.prefix],
    svg: sanitized.svg,
    tags: unique([parsed.prefix, ...parsed.name.split('-')]).slice(0, 8),
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await mapper(items[index]);
      }
    })
  );

  return results;
}

/**
 * 검색 범위를 Iconify /search 호출 그룹 목록으로 변환한다.
 * 그룹 1개당 (확장 검색어 × 1)회 호출한다.
 */
function resolveScopeGroups(scope: SvgIconSearchScope): IconifySearchScopeGroup[] {
  if (scope.type === 'collection') {
    return [{ prefix: scope.prefix }];
  }
  if (scope.type === 'pack') {
    const pack = SVG_ICON_SOURCE_PACKS.find((item) => item.id === scope.packId);
    return [{ prefixes: pack?.prefixes }];
  }
  return [{ prefixes: undefined }];
}

// scope가 없으면 기본 스코프(전체)를 사용한다.
function resolveSearchGroups(options: { scope?: SvgIconSearchScope }): IconifySearchScopeGroup[] {
  return resolveScopeGroups(options.scope ?? DEFAULT_SVG_ICON_SEARCH_SCOPE);
}

// "prefix:name" 형태의 Iconify 전체 이름을 분해한다. 형식이 아니면 null.
export function parseIconifyIconName(iconName: string): { prefix: string; name: string } | null {
  return parseIconName(iconName);
}

// 아이콘 원본 페이지(Iconify) 주소. sourceId가 "prefix:name" 형식일 때만 반환.
export function buildIconifyPageUrl(sourceId: string): string | undefined {
  const parsed = parseIconName(sourceId);
  return parsed ? `${ICONIFY_PAGE_BASE}/${parsed.prefix}/${parsed.name}/` : undefined;
}

// 컬렉션 prefix의 표시 이름(모르는 컬렉션은 prefix 그대로).
export function getIconifyCollectionLabel(prefix: string): string {
  return COLLECTION_LABELS[prefix] ?? prefix;
}

// 컬렉션 prefix의 라이선스 표기(모르면 undefined).
export function getIconifyCollectionLicense(prefix: string): string | undefined {
  return COLLECTION_LICENSES[prefix];
}

function interleaveByCollection(iconNames: string[], stylePreset: SvgIconStylePreset): string[] {
  const buckets = new Map<string, string[]>();
  for (const iconName of unique(iconNames)) {
    const prefix = parseIconName(iconName)?.prefix ?? '';
    if (!buckets.has(prefix)) buckets.set(prefix, []);
    buckets.get(prefix)?.push(iconName);
  }

  const orderedPrefixes = Array.from(buckets.keys()).sort(
    (a, b) => collectionPriority(a, stylePreset) - collectionPriority(b, stylePreset)
  );
  const interleaved: string[] = [];
  let hasItems = true;
  while (hasItems) {
    hasItems = false;
    for (const prefix of orderedPrefixes) {
      const bucket = buckets.get(prefix);
      const next = bucket?.shift();
      if (next) {
        interleaved.push(next);
        hasItems = true;
      }
    }
  }
  return interleaved;
}

// 아이콘 "이름" 풀만 조회한다(SVG는 받지 않음 → 가볍다). 페이지네이션용.
export async function searchSvgIconNames(
  query: string,
  options: SearchSvgIconNamesOptions
): Promise<string[]> {
  const poolLimit = options.poolLimit ?? 400;
  const terms = expandSvgIconSearchQuery(query);
  const groups = resolveSearchGroups(options);
  const perSearchLimit = Math.max(32, Math.ceil(poolLimit / Math.max(groups.length, 1)));
  const rawIconNames = (
    await Promise.all(
      groups.flatMap((group) => terms.map((term) => fetchIconifySearch(term, perSearchLimit, group)))
    )
  ).flat();
  return interleaveByCollection(rawIconNames, options.stylePreset).slice(0, poolLimit);
}

// 주어진 아이콘 이름들의 SVG를 가져온다(한 페이지 분량). 실패/위험 SVG는 제외.
export async function fetchSvgIconsByNames(names: string[]): Promise<SvgIconSearchResult[]> {
  const fetched = await mapWithConcurrency(names, ICONIFY_FETCH_CONCURRENCY, fetchIconSvg);
  return fetched.filter((item): item is SvgIconSearchResult => Boolean(item));
}
