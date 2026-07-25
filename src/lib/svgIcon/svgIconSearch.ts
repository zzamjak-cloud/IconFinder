import type { TranslationKey } from '@/i18n';
import { SvgIconSearchResult, SvgIconStylePreset } from '../../types/svgIcon';
import { sanitizeSvg } from './svgSanitizer';

interface IconifySearchResponse {
  icons?: string[];
}

interface SearchSvgIconsOptions {
  limit: number;
  stylePreset: SvgIconStylePreset;
  sourcePackIds: SvgIconSourcePackId[];
}

const ICONIFY_API_BASE = 'https://api.iconify.design';
const ICONIFY_PAGE_BASE = 'https://icon-sets.iconify.design';
const ICONIFY_FETCH_CONCURRENCY = 8;

export type SvgIconSourcePackId = 'all' | 'game' | 'ui' | 'pixel' | 'material' | 'emoji';

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

async function fetchIconifySearch(term: string, limit: number, prefixes?: string[]): Promise<string[]> {
  const params = new URLSearchParams({ query: term, limit: String(limit) });
  if (prefixes && prefixes.length > 0) {
    params.set('prefixes', prefixes.join(','));
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

function getSelectedSourcePacks(sourcePackIds: SvgIconSourcePackId[]): SvgIconSourcePack[] {
  const selectedIds = sourcePackIds.length > 0 ? sourcePackIds : ['game', 'ui', 'pixel'];
  return SVG_ICON_SOURCE_PACKS.filter((pack) => selectedIds.includes(pack.id));
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
  options: { stylePreset: SvgIconStylePreset; sourcePackIds: SvgIconSourcePackId[]; poolLimit?: number }
): Promise<string[]> {
  const poolLimit = options.poolLimit ?? 400;
  const terms = expandSvgIconSearchQuery(query);
  const sourcePacks = getSelectedSourcePacks(options.sourcePackIds);
  const perSearchLimit = Math.max(32, Math.ceil(poolLimit / Math.max(sourcePacks.length, 1)));
  const rawIconNames = (
    await Promise.all(
      sourcePacks.flatMap((pack) => terms.map((term) => fetchIconifySearch(term, perSearchLimit, pack.prefixes)))
    )
  ).flat();
  return interleaveByCollection(rawIconNames, options.stylePreset).slice(0, poolLimit);
}

// 주어진 아이콘 이름들의 SVG를 가져온다(한 페이지 분량). 실패/위험 SVG는 제외.
export async function fetchSvgIconsByNames(names: string[]): Promise<SvgIconSearchResult[]> {
  const fetched = await mapWithConcurrency(names, ICONIFY_FETCH_CONCURRENCY, fetchIconSvg);
  return fetched.filter((item): item is SvgIconSearchResult => Boolean(item));
}

export async function searchSvgIcons(
  query: string,
  options: SearchSvgIconsOptions
): Promise<SvgIconSearchResult[]> {
  const terms = expandSvgIconSearchQuery(query);
  const sourcePacks = getSelectedSourcePacks(options.sourcePackIds);
  const perSearchLimit = Math.max(16, Math.ceil(options.limit / Math.max(sourcePacks.length, 1)));
  const rawIconNames = (
    await Promise.all(
      sourcePacks.flatMap((pack) =>
        terms.map((term) => fetchIconifySearch(term, perSearchLimit, pack.prefixes))
      )
    )
  ).flat();

  const sortedIconNames = interleaveByCollection(rawIconNames, options.stylePreset);

  const fetched = await mapWithConcurrency(
    sortedIconNames.slice(0, options.limit * 2),
    ICONIFY_FETCH_CONCURRENCY,
    fetchIconSvg
  );

  return fetched.filter((item): item is SvgIconSearchResult => Boolean(item)).slice(0, options.limit);
}
