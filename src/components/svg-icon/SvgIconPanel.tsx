import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FolderPlus,
  Grid3x3,
  ImageOff,
  Loader2,
  Palette,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useI18n, type TranslationKey } from '@/i18n';
import { resolveErrorMessage } from '@/i18n/errorMessage';
import {
  SvgGameIcon,
  SvgIconCategory,
  SvgIconColorMode,
  SvgIconColorPreset,
  SvgIconEffects,
  SvgIconFinishMode,
  SvgIconSearchResult,
  SvgIconStyleSnapshot,
  SvgIconViewBox,
} from '@/types/svgIcon';
import {
  DEFAULT_SVG_ICON_SEARCH_QUERY,
  SVG_ICON_VIEW_BOXES,
  UNCATEGORIZED_TEMPLATE_KEY,
  createSvgIconId,
  ensureUncategorizedCategory,
  getCategoryDisplayName,
  getRecommendedQueryForCategory,
  getSvgIconViewBoxLabel,
} from '@/lib/svgIcon/svgIconDefaults';
import {
  DEFAULT_SVG_ICON_EFFECTS,
  SVG_ICON_COLOR_PRESETS,
  applySvgIconStyle,
  normalizeSvgIconEffects,
} from '@/lib/svgIcon/svgIconStyle';
import {
  DEFAULT_SVG_ICON_SEARCH_SCOPE,
  SVG_ICON_SOURCE_PACKS,
  type SvgIconSearchScope,
  expandSvgIconSearchQuery,
  getIconifyCollectionLabel,
  searchSvgIconNames,
  fetchSvgIconsByNames,
} from '@/lib/svgIcon/svgIconSearch';
import {
  buildHtmlIconSnippet,
  buildStandaloneSvg,
  buildSvgDataUri,
  buildSvgSprite,
} from '@/lib/svgIcon/svgIconExport';
import { useSvgWorkspace } from '@/hooks/useSvgWorkspace';
import { useSettings } from '@/hooks/useSettings';
import { useUiPreferences } from '@/hooks/useUiPreferences';
import { WORKSPACE_SEARCH_INPUT_ID, useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { type BatchExportItem } from '@/hooks/useBatchExport';
import { BatchExportDialog } from '@/components/BatchExportDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { exportService } from '@/services/exportService';
import { storageService } from '@/services/storageService';
import { iconifyApi } from '@/services/iconifyApi';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import {
  SVG_ICON_SEARCH_PAGE_SIZE,
  getSvgIconGridMetrics,
  getSvgIconGridRowStyle,
  getSvgIconGridTotalHeight,
  getSvgIconSearchPageSlice,
  type SvgIconGridKind,
} from './svgIconPanelLayout';

/** 헤더 워크스페이스 탭 — 검색(사이드바 없음) / 즐겨찾기(라이브러리) */
export type WorkspaceTab = 'search' | 'favorites';

// 좌·우 사이드바 너비(px) — 기본값은 min, 접힘 너비는 폴딩 아이콘만 보이게
const LEFT_SIDEBAR_MIN = 200;
const LEFT_SIDEBAR_DEFAULT = LEFT_SIDEBAR_MIN;
const LEFT_SIDEBAR_MAX = 420;
const LEFT_SIDEBAR_COLLAPSED = 48;
const RIGHT_SIDEBAR_MIN = 280;
const RIGHT_SIDEBAR_DEFAULT = RIGHT_SIDEBAR_MIN;
const RIGHT_SIDEBAR_MAX = 520;
const RIGHT_SIDEBAR_COLLAPSED = 48;

const CATEGORY_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#eab308', '#ec4899'];
const OUTLINE_WIDTH_MAX = 64;
// 색상 모드(원본/단색/투톤)와 마감(그레디언트/입체)을 하나로 통합한 스타일 종류.
// 그레디언트/입체는 색상 모드를 무시하므로 별도 컨트롤로 둘 필요가 없다.
type SvgIconStyleKind = 'original' | 'monochrome' | 'duotone' | 'gradient' | 'raised';
const STYLE_OPTIONS: Array<{ id: SvgIconStyleKind; labelKey: TranslationKey }> = [
  { id: 'original', labelKey: 'style.original' },
  { id: 'monochrome', labelKey: 'style.monochrome' },
  { id: 'duotone', labelKey: 'style.duotone' },
  { id: 'gradient', labelKey: 'style.gradient' },
  { id: 'raised', labelKey: 'style.raised' },
];

// 스타일 종류 → (colorMode, finishMode). 그레디언트/입체는 colorMode를 무시하므로 단색으로 둔다.
function styleKindToModes(kind: SvgIconStyleKind): { colorMode: SvgIconColorMode; finishMode: SvgIconFinishMode } {
  switch (kind) {
    case 'monochrome':
      return { colorMode: 'monochrome', finishMode: 'flat' };
    case 'duotone':
      return { colorMode: 'duotone', finishMode: 'flat' };
    case 'gradient':
      return { colorMode: 'monochrome', finishMode: 'gradient' };
    case 'raised':
      return { colorMode: 'monochrome', finishMode: 'raised' };
    case 'original':
    default:
      return { colorMode: 'original', finishMode: 'flat' };
  }
}

// (colorMode, finishMode) → 스타일 종류. 마감(그레디언트/입체) 우선.
function modesToStyleKind(colorMode: SvgIconColorMode, finishMode: SvgIconFinishMode): SvgIconStyleKind {
  if (finishMode === 'gradient') return 'gradient';
  if (finishMode === 'raised') return 'raised';
  if (colorMode === 'monochrome') return 'monochrome';
  if (colorMode === 'duotone') return 'duotone';
  return 'original';
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

// Iconify /collections 응답의 컬렉션 1건(필요한 필드만).
interface IconifyCollectionInfo {
  name?: string;
  total?: number;
}

// 스코프 피커에 표시할 컬렉션 목록 항목.
interface CollectionListItem {
  prefix: string;
  name: string;
  total: number;
}

interface EditorSearchToolbarProps {
  initialQuery: string;
  isSearching: boolean;
  scope: SvgIconSearchScope;
  onSearch: (query: string) => void;
  onChangeScope: (scope: SvgIconSearchScope) => void;
}

const EditorSearchToolbar = memo(function EditorSearchToolbar({
  initialQuery,
  isSearching,
  scope,
  onSearch,
  onChangeScope,
}: EditorSearchToolbarProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const expandedSearchTerms = useMemo(() => expandSvgIconSearchQuery(draftQuery), [draftQuery]);
  // 최근 검색어: 입력 포커스 시 드롭다운으로 노출 (기록은 패널의 handleSearchIcons가 담당)
  const { data: recentSearches = [] } = useQuery({
    queryKey: ['recentSearches'],
    queryFn: () => storageService.getRecentSearches(),
    staleTime: Infinity,
  });
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  // 컬렉션 드롭다운: 첫 오픈 시 lazy 로드(실패하면 null 유지 → 다음 오픈에 재시도)
  const [isCollectionListOpen, setIsCollectionListOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionListItem[] | null>(null);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  useEffect(() => {
    setDraftQuery(initialQuery);
  }, [initialQuery]);

  const submitSearch = () => {
    setIsRecentOpen(false);
    onSearch(draftQuery);
  };

  const selectRecentSearch = (term: string) => {
    setDraftQuery(term);
    setIsRecentOpen(false);
    onSearch(term);
  };

  const clearRecentSearches = () => {
    setIsRecentOpen(false);
    void storageService.clearRecentSearches().then(() => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    });
  };

  const toggleCollectionList = async () => {
    const willOpen = !isCollectionListOpen;
    setIsCollectionListOpen(willOpen);
    if (!willOpen || collections || isLoadingCollections) return;
    setIsLoadingCollections(true);
    try {
      const data = (await iconifyApi.getCollections()) as Record<string, IconifyCollectionInfo>;
      setCollections(
        Object.entries(data).map(([prefix, info]) => ({
          prefix,
          name: info.name ?? getIconifyCollectionLabel(prefix),
          total: info.total ?? 0,
        }))
      );
    } catch {
      // 로드 실패: 목록을 비워두지 않고 null 유지 → 다음 오픈 시 재시도
      setCollections(null);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const selectScope = (nextScope: SvgIconSearchScope) => {
    onChangeScope(nextScope);
    setIsCollectionListOpen(false);
  };

  // 컬렉션 칩 라벨: 컬렉션 스코프면 컬렉션 이름, 아니면 "컬렉션…" 문구
  const collectionChipLabel =
    scope.type === 'collection'
      ? collections?.find((item) => item.prefix === scope.prefix)?.name ?? getIconifyCollectionLabel(scope.prefix)
      : t('workspace.scope.collection');

  return (
    <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-72 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id={WORKSPACE_SEARCH_INPUT_ID}
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            onFocus={() => setIsRecentOpen(true)}
            onBlur={() => setIsRecentOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitSearch();
              if (event.key === 'Escape') setIsRecentOpen(false);
            }}
            placeholder="sword, potion, shield, heart..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-10 text-sm outline-none focus:border-lime-500 dark:border-slate-800 dark:bg-slate-900"
          />
          {draftQuery && (
            <button
              type="button"
              onClick={() => setDraftQuery('')}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label={t('search.clear')}
              title={t('search.clear')}
            >
              <X size={15} />
            </button>
          )}
          {/* 최근 검색어 드롭다운: mousedown preventDefault로 입력 blur를 막고 click을 살린다 */}
          {isRecentOpen && recentSearches.length > 0 && (
            <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{t('editor.search.recentTitle')}</span>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearRecentSearches}
                  className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  {t('editor.search.recentClear')}
                </button>
              </div>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectRecentSearch(term)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Search size={12} className="shrink-0 text-slate-400 dark:text-slate-500" />
                  <span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={submitSearch}
          disabled={isSearching}
          className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-lime-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {t('editor.search.searching')}
            </span>
          ) : (
            t('editor.search.button')
          )}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {SVG_ICON_SOURCE_PACKS.map((pack) => {
          // 'all' 팩 칩은 전체 검색 스코프, 나머지는 팩 스코프(단일 선택)
          const isSelected =
            pack.id === 'all' ? scope.type === 'all' : scope.type === 'pack' && scope.packId === pack.id;
          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => selectScope(pack.id === 'all' ? { type: 'all' } : { type: 'pack', packId: pack.id })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isSelected
                  ? 'border-lime-500 bg-lime-100 text-lime-900 dark:bg-lime-900/40 dark:text-lime-200'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t(pack.labelKey)}
            </button>
          );
        })}
        <div className="relative">
          <button
            type="button"
            onClick={() => void toggleCollectionList()}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              scope.type === 'collection'
                ? 'border-lime-500 bg-lime-100 text-lime-900 dark:bg-lime-900/40 dark:text-lime-200'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="max-w-40 truncate">{collectionChipLabel}</span>
            <ChevronDown size={12} className={`transition-transform ${isCollectionListOpen ? 'rotate-180' : ''}`} />
          </button>
          {isCollectionListOpen && (
            <>
              {/* 바깥 클릭으로 드롭다운 닫기 */}
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                onClick={() => setIsCollectionListOpen(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute left-0 top-full z-30 mt-1 max-h-80 w-72 overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {isLoadingCollections ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-500 dark:text-slate-400">
                    <Loader2 size={14} className="animate-spin" />
                    {t('editor.results.loading')}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => selectScope({ type: 'all' })}
                      className="w-full rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {t('collection.viewAll')}
                    </button>
                    {(collections ?? []).map((item) => {
                      const isActive = scope.type === 'collection' && scope.prefix === item.prefix;
                      return (
                        <button
                          key={item.prefix}
                          type="button"
                          onClick={() => selectScope({ type: 'collection', prefix: item.prefix })}
                          className={`w-full rounded-md px-3 py-2 text-left ${
                            isActive ? 'bg-lime-100 text-lime-950 dark:bg-lime-900/40 dark:text-lime-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="block truncate text-xs font-semibold">{item.name}</span>
                          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {t('collection.iconCount', { prefix: item.prefix, count: item.total })}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck size={14} className="text-lime-600 dark:text-lime-400" />
        <span>{t('editor.search.sources')}</span>
        {expandedSearchTerms.map((term) => (
          <span key={term} className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
            {term}
          </span>
        ))}
      </div>
    </div>
  );
});

interface VirtualizedSvgIconGridProps<T> {
  items: T[];
  columns: number;
  kind: SvgIconGridKind;
  empty: ReactNode;
  getItemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

function VirtualizedSvgIconGrid<T>({
  items,
  columns,
  kind,
  empty,
  getItemKey,
  renderItem,
}: VirtualizedSvgIconGridProps<T>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const columnCount = Math.max(1, Math.floor(columns));
  const metrics = useMemo(
    () => getSvgIconGridMetrics(containerWidth, columnCount, kind),
    [columnCount, containerWidth, kind]
  );
  const rowCount = Math.ceil(items.length / columnCount);
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => metrics.rowPitch,
    getItemKey: (index) => `${kind}:${columnCount}:${metrics.rowPitch.toFixed(3)}:${index}`,
    overscan: 3,
  });

  const setParentElement = useCallback((node: HTMLDivElement | null) => {
    parentRef.current = node;
    setScrollElement(node);
  }, []);

  useEffect(() => {
    const el = scrollElement;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollElement]);

  useEffect(() => {
    virtualizer.measure();
  }, [columnCount, metrics.rowPitch, virtualizer]);

  if (items.length === 0) return <>{empty}</>;

  return (
    <div ref={setParentElement} className="h-full overflow-auto pr-1">
      <div
        style={{
          height: `${getSvgIconGridTotalHeight(rowCount, metrics.rowPitch)}px`,
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowItems = items.slice(startIndex, startIndex + columnCount);
          return (
            <div
              key={virtualRow.key}
              style={getSvgIconGridRowStyle({
                columnCount,
                gridGap: metrics.gridGap,
                rowPitch: metrics.rowPitch,
                rowIndex: virtualRow.index,
              })}
            >
              {rowItems.map((item) => (
                <div key={getItemKey(item)} className="min-h-0">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface IconCardShellProps {
  title: string;
  subtitle: string;
  preview: ReactNode;
  isHighlighted?: boolean;
  showCheck?: boolean;
  checked?: boolean;
  isFavorite: boolean;
  sourceUrl?: string | null;
  isDragging?: boolean;
  className?: string;
  onToggleCheck?: () => void;
  onSelect?: (event: ReactMouseEvent) => void;
  onToggleFavorite: () => void;
  onMouseDown?: (event: ReactMouseEvent) => void;
}

/** 검색 카드 골격 — 정사각 미리보기 / 이름·부제 / ★·원본링크·우하단 체크 */
const IconCardShell = memo(function IconCardShell({
  title,
  subtitle,
  preview,
  isHighlighted = false,
  showCheck = true,
  checked = false,
  isFavorite,
  sourceUrl,
  isDragging = false,
  className,
  onToggleCheck,
  onSelect,
  onToggleFavorite,
  onMouseDown,
}: IconCardShellProps) {
  const { t } = useI18n();

  return (
    <div
      onMouseDown={onMouseDown}
      className={`rounded-lg border bg-white p-3 dark:bg-slate-900 ${
        isHighlighted ? 'border-lime-500 ring-2 ring-lime-100 dark:ring-lime-900/40' : 'border-slate-200 dark:border-slate-800'
      } ${isDragging ? 'opacity-40' : ''} ${className ?? 'h-full'}`}
    >
      <button
        type="button"
        onClick={(event) => onSelect?.(event)}
        className="block w-full text-left"
      >
        {/* 프리뷰 타일: 항상 라이트 + 글자색 고정 — currentColor 아이콘이 다크 모드의 밝은 상속색을 물려받아 흰 타일 위에서 사라지는 것 방지 */}
        <div className="flex aspect-square w-full items-center justify-center rounded-md bg-slate-50 text-slate-900">
          {preview}
        </div>
        <div className="mt-2 min-h-10 text-left">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </button>
      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          className={`rounded-md border p-1.5 ${
            isFavorite
              ? 'border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-900/30'
              : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-amber-500 dark:border-slate-800 dark:text-slate-500 dark:hover:bg-slate-800'
          }`}
          title={isFavorite ? t('favorites.remove') : t('favorites.add')}
          aria-label={isFavorite ? t('favorites.remove') : t('favorites.add')}
        >
          <Star size={14} className={isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
        </button>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            title={t('common.viewOriginal')}
          >
            <ExternalLink size={14} />
          </a>
        ) : null}
        {showCheck && (
          <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onToggleCheck?.();
            }}
            className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
              checked ? 'border-lime-500 bg-lime-500 text-white' : 'border-slate-300 dark:border-slate-700'
            }`}
            title={checked ? t('common.clearSelection') : t('common.select')}
            aria-label={checked ? t('common.clearSelection') : t('common.select')}
          >
            {checked && <Check size={13} />}
          </button>
        )}
      </div>
    </div>
  );
});

interface SearchResultCardProps {
  result: SvgIconSearchResult;
  isSelected: boolean;
  isActive: boolean;
  isFavorite: boolean;
  buildPreviewSvg: (result: SvgIconSearchResult) => string;
  onToggleSelection: (resultId: string) => void;
  onToggleFavorite: (result: SvgIconSearchResult) => void;
  onSelectResult: (result: SvgIconSearchResult) => void;
}

const SearchResultCard = memo(function SearchResultCard({
  result,
  isSelected,
  isActive,
  isFavorite,
  buildPreviewSvg,
  onToggleSelection,
  onToggleFavorite,
  onSelectResult,
}: SearchResultCardProps) {
  const previewSvg = useMemo(() => buildPreviewSvg(result), [buildPreviewSvg, result]);

  return (
    <IconCardShell
      title={result.name}
      subtitle={result.collection}
      isHighlighted={isSelected || isActive}
      checked={isSelected}
      isFavorite={isFavorite}
      sourceUrl={result.sourceUrl}
      onToggleCheck={() => onToggleSelection(result.id)}
      onSelect={() => onSelectResult(result)}
      onToggleFavorite={() => onToggleFavorite(result)}
      preview={
        <div
          className="h-3/4 w-3/4 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      }
    />
  );
});

interface SavedIconCardProps {
  icon: SvgGameIcon;
  isChecked: boolean;
  isDragging: boolean;
  isSelected: boolean;
  isHydrationFailed: boolean;
  buildPreviewSvg: (icon: SvgGameIcon) => string;
  onMouseDown: (event: ReactMouseEvent, icon: SvgGameIcon) => void;
  onToggleSelection: (iconId: string) => void;
  onToggleFavorite: (icon: SvgGameIcon) => void;
  onSelectIcon: (event: ReactMouseEvent, icon: SvgGameIcon) => void;
}

const SavedIconCard = memo(function SavedIconCard({
  icon,
  isChecked,
  isDragging,
  isSelected,
  isHydrationFailed,
  buildPreviewSvg,
  onMouseDown,
  onToggleSelection,
  onToggleFavorite,
  onSelectIcon,
}: SavedIconCardProps) {
  const { t } = useI18n();
  // 라이트 항목(svg='')은 하이드레이션 전이므로 미리보기를 만들지 않는다.
  const previewSvg = useMemo(
    () => (icon.svg === '' ? '' : buildPreviewSvg(icon)),
    [buildPreviewSvg, icon]
  );

  return (
    <IconCardShell
      title={icon.name}
      subtitle={icon.sourceName ?? 'SVG'}
      isHighlighted={isChecked || isSelected}
      checked={isChecked}
      isFavorite={Boolean(icon.favorite)}
      sourceUrl={icon.sourceUrl}
      isDragging={isDragging}
      className="h-full cursor-grab select-none active:cursor-grabbing hover:border-lime-400"
      onMouseDown={(event) => onMouseDown(event, icon)}
      onToggleCheck={() => onToggleSelection(icon.id)}
      onSelect={(event) => onSelectIcon(event, icon)}
      onToggleFavorite={() => onToggleFavorite(icon)}
      preview={
        icon.svg === '' ? (
          <div
            className="flex h-3/4 w-3/4 items-center justify-center text-slate-300"
            title={isHydrationFailed ? t('icon.loadFailed') : undefined}
          >
            {isHydrationFailed ? <ImageOff size={28} /> : <Loader2 size={28} className="animate-spin" />}
          </div>
        ) : (
          <div
            className="h-3/4 w-3/4 [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          />
        )
      }
    />
  );
});

export function SvgIconPanel({ mode }: { mode: WorkspaceTab }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // SVG 워크스페이스 영속성 훅 (자기완결형: App.tsx 결합 최소화)
  const { workspace, updateWorkspace } = useSvgWorkspace();
  // 내보내기 설정 (PNG 크기 등은 설정값을 따른다)
  const { settings: exportSettings } = useSettings();

  const showToast = useCallback(
    (title: string, type: 'success' | 'error' | 'info' = 'success') => {
      toast({ title, type });
    },
    [toast]
  );

  const [newCategoryName, setNewCategoryName] = useState('');
  // 인라인 이름 변경 상태 (카테고리: 더블클릭, 아이콘: Detail 연필 버튼)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingIconId, setEditingIconId] = useState<string | null>(null);
  const [searchInputSeed, setSearchInputSeed] = useState(DEFAULT_SVG_ICON_SEARCH_QUERY);
  const [searchResults, setSearchResults] = useState<SvgIconSearchResult[]>([]);
  const [resultNames, setResultNames] = useState<string[]>([]); // 전체 검색 이름 풀(페이지네이션용)
  const [searchPage, setSearchPage] = useState(0); // 0-based 현재 페이지
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());
  // 그리드 컬럼 수 — IconFinder 검색 뷰와 독립적으로 동작하는 패널 전용 상태
  const [gridColumns, setGridColumns] = useState(5);
  // 검색 스코프(전체/팩/컬렉션) — 단일 선택
  const [searchScope, setSearchScope] = useState<SvgIconSearchScope>(DEFAULT_SVG_ICON_SEARCH_SCOPE);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  // 디테일 패널이 따라가는 검색 결과(보관함 아이콘 선택과 상호 배타)
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  // 스타일 섹션 아코디언
  const [isStyleOpen, setIsStyleOpen] = useState(true);
  // 일괄 내보내기 대상(null이면 다이얼로그 닫힘)
  const [batchItems, setBatchItems] = useState<BatchExportItem[] | null>(null);
  // 하이드레이션 실패 아이콘 id(재시도 방지 + 플레이스홀더 표시)
  const [hydrationFailedIds, setHydrationFailedIds] = useState<Set<string>>(new Set());
  const hydrationInFlightRef = useRef<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [pendingDeleteCategoryId, setPendingDeleteCategoryId] = useState<string | null>(null);
  // 즐겨찾기 해제 확인 대상(우측 디테일 별 버튼)
  const [unfavoriteConfirmIcon, setUnfavoriteConfirmIcon] = useState<SvgGameIcon | null>(null);
  const [colorMode, setColorMode] = useState<SvgIconColorMode>('original');
  const [finishMode, setFinishMode] = useState<SvgIconFinishMode>('flat');
  const [primaryColor, setPrimaryColor] = useState(SVG_ICON_COLOR_PRESETS[0].primary);
  const [accentColor, setAccentColor] = useState(SVG_ICON_COLOR_PRESETS[0].accent);
  const [outlineColor, setOutlineColor] = useState('#0f172a');
  const [outlineWidth, setOutlineWidth] = useState(3);
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [effects, setEffects] = useState<SvgIconEffects>(DEFAULT_SVG_ICON_EFFECTS);
  const [error, setError] = useState<string | null>(null);
  const [iconSelection, setIconSelection] = useState<Set<string>>(new Set());
  const [draggingIconIds, setDraggingIconIds] = useState<string[]>([]);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  // 좌·우 사이드바 너비 / 접힘
  const [leftWidth, setLeftWidth] = useState(LEFT_SIDEBAR_DEFAULT);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState(RIGHT_SIDEBAR_DEFAULT);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const leftWidthBeforeCollapseRef = useRef(LEFT_SIDEBAR_DEFAULT);
  const rightWidthBeforeCollapseRef = useRef(RIGHT_SIDEBAR_DEFAULT);

  // UI 상태 영속화: 로드 완료 시 1회 하이드레이션(클램프) 후, 변경분을 디바운스 저장
  const { preferences: uiPreferences, isLoaded: uiPrefsLoaded, save: saveUiPreferences } = useUiPreferences();
  const uiPrefsHydratedRef = useRef(false);

  useEffect(() => {
    if (!uiPrefsLoaded || uiPrefsHydratedRef.current) return;
    uiPrefsHydratedRef.current = true;
    if (!uiPreferences) return;
    if (typeof uiPreferences.gridColumns === 'number') {
      setGridColumns(Math.min(10, Math.max(2, Math.round(uiPreferences.gridColumns))));
    }
    if (typeof uiPreferences.leftWidth === 'number') {
      const width = Math.min(LEFT_SIDEBAR_MAX, Math.max(LEFT_SIDEBAR_MIN, uiPreferences.leftWidth));
      setLeftWidth(width);
      leftWidthBeforeCollapseRef.current = width;
    }
    if (typeof uiPreferences.rightWidth === 'number') {
      const width = Math.min(RIGHT_SIDEBAR_MAX, Math.max(RIGHT_SIDEBAR_MIN, uiPreferences.rightWidth));
      setRightWidth(width);
      rightWidthBeforeCollapseRef.current = width;
    }
    if (typeof uiPreferences.leftCollapsed === 'boolean') setLeftCollapsed(uiPreferences.leftCollapsed);
    if (typeof uiPreferences.rightCollapsed === 'boolean') setRightCollapsed(uiPreferences.rightCollapsed);
  }, [uiPrefsLoaded, uiPreferences]);

  useEffect(() => {
    if (!uiPrefsHydratedRef.current) return;
    saveUiPreferences({ gridColumns, leftWidth, leftCollapsed, rightWidth, rightCollapsed });
  }, [gridColumns, leftWidth, leftCollapsed, rightWidth, rightCollapsed, saveUiPreferences]);
  const selectionAnchorRef = useRef<string | null>(null);
  // 마우스 기반 드래그 상태(WKWebView에서 HTML5 DnD가 불안정해 기존 사이드바와 동일한 방식 사용).
  const iconDragRef = useRef<{
    ids: string[];
    startX: number;
    startY: number;
    active: boolean;
    targetCategoryId: string | null;
  }>({ ids: [], startX: 0, startY: 0, active: false, targetCategoryId: null });
  const moveIconsToCategoryRef = useRef<(iconIds: string[], targetCategoryId: string) => void>(() => {});
  const suppressIconClickRef = useRef(false);

  // selectedCategoryId가 없으면 "전체보기"(삭제 불가 스마트 뷰)
  const isViewAll = !workspace.selectedCategoryId;
  const selectedCategoryId = workspace.selectedCategoryId;
  const selectedCategory = workspace.categories.find((category) => category.id === selectedCategoryId) ?? null;
  const selectedIcon = workspace.icons.find((icon) => icon.id === selectedIconId) ?? null;

  // 통합 스타일 셀렉터: 현재 (colorMode, finishMode)로부터 종류를 파생하고, 선택 시 둘을 함께 설정.
  const currentStyleKind = modesToStyleKind(colorMode, finishMode);
  const handleSelectStyle = (kind: SvgIconStyleKind) => {
    const modes = styleKindToModes(kind);
    setColorMode(modes.colorMode);
    setFinishMode(modes.finishMode);
  };

  const selectedCategoryIcons = useMemo(() => {
    return workspace.icons
      .filter((icon) => icon.categoryId === selectedCategoryId)
      .sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)));
  }, [selectedCategoryId, workspace.icons]);

  // 전체보기: 즐겨찾기(favorite) 아이콘 전체 / 카테고리: 해당 카테고리의 즐겨찾기만
  const visibleSavedIcons = useMemo(() => {
    const base = isViewAll
      ? workspace.icons.filter((icon) => icon.favorite)
      : selectedCategoryIcons.filter((icon) => icon.favorite);
    return [...base].sort(
      (a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite))
    );
  }, [isViewAll, selectedCategoryIcons, workspace.icons]);

  // 미분류는 항상 상단 고정, 나머지 사용자 카테고리만 순서 변경 가능
  const uncategorizedCategory = useMemo(
    () => workspace.categories.find((category) => category.templateKey === UNCATEGORIZED_TEMPLATE_KEY) ?? null,
    [workspace.categories]
  );
  const userCategories = useMemo(
    () => workspace.categories.filter((category) => category.templateKey !== UNCATEGORIZED_TEMPLATE_KEY),
    [workspace.categories]
  );

  // 검색 ↔ 즐겨찾기 탭 전환 시 우측 디테일·선택 상태 초기화(스타일 섹션은 펼침 유지)
  useEffect(() => {
    setSelectedIconId(null);
    setSelectedResultId(null);
    setSelectedResultIds(new Set());
    setIconSelection(new Set());
    selectionAnchorRef.current = null;
    setPendingDeleteCategoryId(null);
    setIsStyleOpen(true);
  }, [mode]);

  // 즐겨찾기 탭 진입 시 미분류를 보장하고 목록 맨 앞으로 둔다
  useEffect(() => {
    if (mode !== 'favorites') return;
    const { data, category } = ensureUncategorizedCategory(workspace);
    const rest = data.categories.filter((item) => item.templateKey !== UNCATEGORIZED_TEMPLATE_KEY);
    const ordered = [category, ...rest];
    const alreadyOrdered =
      data.categories.length === ordered.length &&
      data.categories.every((item, index) => item.id === ordered[index]?.id);
    if (data === workspace && alreadyOrdered) return;
    updateWorkspace({ ...data, categories: ordered });
  }, [mode, updateWorkspace, workspace]);

  // 디테일 패널이 따라가는 검색 결과 항목
  const selectedResult = useMemo(
    () => searchResults.find((result) => result.id === selectedResultId) ?? null,
    [searchResults, selectedResultId]
  );

  // 즐겨찾기 상태인 sourceId 집합(검색 결과 카드 별 버튼 활성 표시용)
  const favoriteSourceIds = useMemo(() => {
    const set = new Set<string>();
    for (const icon of workspace.icons) {
      if (icon.favorite && icon.sourceId) set.add(icon.sourceId);
    }
    return set;
  }, [workspace.icons]);

  const styleSvg = useCallback(
    (svg: string) =>
      applySvgIconStyle(svg, {
        colorMode,
        finishMode,
        primaryColor,
        accentColor,
        outlineColor,
        outlineWidth,
        outlineEnabled,
        stylePreset: workspace.stylePreset,
        viewBox: workspace.defaultViewBox,
        effects,
      }),
    [accentColor, colorMode, effects, finishMode, outlineColor, outlineEnabled, outlineWidth, primaryColor, workspace.defaultViewBox, workspace.stylePreset]
  );

  const getCurrentStyleSnapshot = useCallback(
    (): SvgIconStyleSnapshot => ({
      colorMode,
      finishMode,
      primaryColor,
      accentColor,
      outlineColor,
      outlineWidth,
      outlineEnabled,
      stylePreset: workspace.stylePreset,
      viewBox: workspace.defaultViewBox,
      effects,
    }),
    [accentColor, colorMode, effects, finishMode, outlineColor, outlineEnabled, outlineWidth, primaryColor, workspace.defaultViewBox, workspace.stylePreset]
  );

  const selectedIconPreviewSvg = useMemo(
    () => (selectedIcon ? styleSvg(selectedIcon.originalSvg ?? selectedIcon.svg) : ''),
    [selectedIcon, styleSvg]
  );

  const selectedIconForExport = useMemo(
    () =>
      selectedIcon
        ? {
            ...selectedIcon,
            svg: selectedIconPreviewSvg,
            stylePreset: workspace.stylePreset,
            viewBox: workspace.defaultViewBox,
            styleSnapshot: getCurrentStyleSnapshot(),
          }
        : null,
    [getCurrentStyleSnapshot, selectedIcon, selectedIconPreviewSvg, workspace.defaultViewBox, workspace.stylePreset]
  );

  const selectedIconExportSvg = useMemo(
    () => (selectedIconForExport ? buildStandaloneSvg(selectedIconForExport) : ''),
    [selectedIconForExport]
  );

  const buildIconForExport = useCallback(
    (icon: SvgGameIcon): SvgGameIcon => {
      if (selectedIconForExport && icon.id === selectedIconForExport.id) {
        return selectedIconForExport;
      }
      if (icon.originalSvg && icon.styleSnapshot) {
        return {
          ...icon,
          svg: applySvgIconStyle(icon.originalSvg, icon.styleSnapshot),
          stylePreset: icon.styleSnapshot.stylePreset,
          viewBox: icon.styleSnapshot.viewBox,
        };
      }
      return icon;
    },
    [selectedIconForExport]
  );

  const buildIconPreviewSvg = useCallback(
    (icon: SvgGameIcon) => buildStandaloneSvg(buildIconForExport(icon)),
    [buildIconForExport]
  );

  const buildSearchResultPreviewSvg = useCallback(
    (result: SvgIconSearchResult) =>
      buildStandaloneSvg({
        id: result.id,
        categoryId: selectedCategoryId ?? 'preview',
        name: result.name,
        prompt: '',
        svg: styleSvg(result.svg),
        originalSvg: result.svg,
        tags: result.tags,
        stylePreset: workspace.stylePreset,
        viewBox: workspace.defaultViewBox,
        source: result.source,
        sourceId: result.id,
        sourceName: result.sourceName,
        sourceUrl: result.sourceUrl,
        license: result.license,
        createdAt: '',
        updatedAt: '',
      }),
    [selectedCategoryId, workspace.defaultViewBox, workspace.stylePreset, styleSvg]
  );

  // 검색 결과 디테일 프리뷰: 스타일 컨트롤이 기본값이면 정규화 원본과 같고, 조작하면 프리뷰를 따른다.
  const selectedResultPreviewSvg = useMemo(
    () => (selectedResult ? buildSearchResultPreviewSvg(selectedResult) : ''),
    [buildSearchResultPreviewSvg, selectedResult]
  );

  // 빠른 내보내기 대상(항목 상태를 따름): 보관함 아이콘=저장/현재 스타일, 검색 결과=위 프리뷰
  const activeDetailName = selectedIcon?.name ?? selectedResult?.name ?? null;
  const activeDetailSvg = selectedIcon ? selectedIconExportSvg || selectedIcon.svg : selectedResultPreviewSvg;

  const applyStyleSnapshotToControls = (snapshot?: SvgIconStyleSnapshot) => {
    if (!snapshot) return;
    setColorMode(snapshot.colorMode);
    // 구버전 'outlined' finishMode는 외곽선 토글로 마이그레이션하고 finishMode는 기본으로 정리
    setFinishMode(snapshot.finishMode === 'outlined' ? 'flat' : snapshot.finishMode);
    setOutlineEnabled(snapshot.outlineEnabled ?? snapshot.finishMode === 'outlined');
    setPrimaryColor(snapshot.primaryColor);
    setAccentColor(snapshot.accentColor);
    setOutlineColor(snapshot.outlineColor);
    setOutlineWidth(Math.min(Math.max(snapshot.outlineWidth, 1), OUTLINE_WIDTH_MAX));
    setEffects(normalizeSvgIconEffects(snapshot.effects));
    handleSettingChange(snapshot.viewBox);
  };

  const handleSelectSavedIcon = (icon: SvgGameIcon) => {
    setSelectedIconId(icon.id);
    setSelectedResultId(null);
    setIsStyleOpen(true);
    applyStyleSnapshotToControls(icon.styleSnapshot);
  };

  // 검색 결과 카드 클릭 → 디테일 패널 대상 지정(스타일 섹션도 표시)
  const handleSelectSearchResult = (result: SvgIconSearchResult) => {
    setSelectedResultId(result.id);
    setSelectedIconId(null);
    setIsStyleOpen(true);
  };

  const toggleIconSelection = (iconId: string) => {
    setIconSelection((prev) => {
      const next = new Set(prev);
      if (next.has(iconId)) next.delete(iconId);
      else next.add(iconId);
      return next;
    });
  };

  // Shift+클릭: 직전 클릭(앵커)부터 클릭한 아이콘까지 범위를 선택에 추가한다.
  const handleShiftSelectIcon = (icon: SvgGameIcon) => {
    const list = visibleSavedIcons;
    const clickedIndex = list.findIndex((item) => item.id === icon.id);
    if (clickedIndex === -1) return;
    const anchorId = selectionAnchorRef.current;
    const anchorIndex = anchorId ? list.findIndex((item) => item.id === anchorId) : -1;
    setIconSelection((prev) => {
      const next = new Set(prev);
      if (anchorIndex === -1) {
        next.add(icon.id);
      } else {
        const [start, end] = anchorIndex <= clickedIndex ? [anchorIndex, clickedIndex] : [clickedIndex, anchorIndex];
        for (let i = start; i <= end; i += 1) next.add(list[i].id);
      }
      return next;
    });
  };

  // 마우스 누름: 옮길 대상을 기록한다(선택 포함 시 선택 전체, 아니면 해당 아이콘). 임계값을 넘어야 드래그 시작.
  const handleIconMouseDown = (event: ReactMouseEvent, icon: SvgGameIcon) => {
    if (event.button !== 0) return;
    suppressIconClickRef.current = false;
    const ids = iconSelection.has(icon.id) && iconSelection.size > 0 ? Array.from(iconSelection) : [icon.id];
    iconDragRef.current = { ids, startX: event.clientX, startY: event.clientY, active: false, targetCategoryId: null };
  };

  const moveIconsToCategory = (iconIds: string[], targetCategoryId: string) => {
    const idSet = new Set(iconIds);
    const movedIcons = workspace.icons.filter((icon) => idSet.has(icon.id) && icon.categoryId !== targetCategoryId);
    if (movedIcons.length === 0) {
      setIconSelection(new Set());
      return;
    }

    const movedIds = movedIcons.map((icon) => icon.id);
    const movedIdSet = new Set(movedIds);
    const now = new Date().toISOString();
    const targetCategory = workspace.categories.find((category) => category.id === targetCategoryId);
    const targetName = targetCategory ? getCategoryDisplayName(targetCategory, t) : '';

    updateWorkspace({
      ...workspace,
      icons: workspace.icons.map((icon) =>
        movedIdSet.has(icon.id) ? { ...icon, categoryId: targetCategoryId, updatedAt: now } : icon
      ),
      categories: workspace.categories.map((category) => {
        if (category.id === targetCategoryId) {
          const remaining = category.iconIds.filter((id) => !movedIdSet.has(id));
          return { ...category, iconIds: [...movedIds, ...remaining], updatedAt: now };
        }
        if (category.iconIds.some((id) => movedIdSet.has(id))) {
          return { ...category, iconIds: category.iconIds.filter((id) => !movedIdSet.has(id)), updatedAt: now };
        }
        return category;
      }),
    });

    setIconSelection(new Set());
    showToast(t('editor.icon.moved', { count: movedIcons.length, target: targetName }));
  };

  moveIconsToCategoryRef.current = moveIconsToCategory;

  const displayLeftWidth = leftCollapsed ? LEFT_SIDEBAR_COLLAPSED : leftWidth;
  const displayRightWidth = rightCollapsed ? RIGHT_SIDEBAR_COLLAPSED : rightWidth;

  const toggleLeftCollapsed = () => {
    if (leftCollapsed) {
      setLeftWidth(leftWidthBeforeCollapseRef.current);
      setLeftCollapsed(false);
    } else {
      leftWidthBeforeCollapseRef.current = leftWidth;
      setLeftCollapsed(true);
    }
  };

  const toggleRightCollapsed = () => {
    if (rightCollapsed) {
      setRightWidth(rightWidthBeforeCollapseRef.current);
      setRightCollapsed(false);
    } else {
      rightWidthBeforeCollapseRef.current = rightWidth;
      setRightCollapsed(true);
    }
  };

  const handleLeftResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (leftCollapsed) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = leftWidth;
    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.min(
        LEFT_SIDEBAR_MAX,
        Math.max(LEFT_SIDEBAR_MIN, startWidth + (moveEvent.clientX - startX))
      );
      setLeftWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleRightResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (rightCollapsed) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = rightWidth;
    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.min(
        RIGHT_SIDEBAR_MAX,
        Math.max(RIGHT_SIDEBAR_MIN, startWidth - (moveEvent.clientX - startX))
      );
      setRightWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  // 전역 마우스 이동/해제로 드래그를 처리한다(사이드바와 동일한 패턴).
  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const drag = iconDragRef.current;
      if (drag.ids.length === 0) return;

      if (!drag.active) {
        const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
        if (distance <= 6) return;
        drag.active = true;
        setDraggingIconIds(drag.ids);
      }

      setDragPosition({ x: event.clientX, y: event.clientY });
      const element = document.elementFromPoint(event.clientX, event.clientY) as Element | null;
      const target = element?.closest('[data-category-drop-id]') ?? null;
      const targetId = target ? target.getAttribute('data-category-drop-id') : null;
      drag.targetCategoryId = targetId;
      setDragOverCategoryId((prev) => (prev === targetId ? prev : targetId));
    };

    const handleUp = () => {
      const drag = iconDragRef.current;
      const wasActive = drag.active;
      const ids = drag.ids;
      const targetId = drag.targetCategoryId;
      iconDragRef.current = { ids: [], startX: 0, startY: 0, active: false, targetCategoryId: null };
      if (!wasActive) return; // 단순 클릭은 무시

      suppressIconClickRef.current = true; // 드래그 직후의 click 이벤트 무시
      setDraggingIconIds([]);
      setDragOverCategoryId(null);
      setDragPosition(null);
      if (ids.length > 0 && targetId) moveIconsToCategoryRef.current(ids, targetId);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    updateWorkspace({ ...workspace, selectedCategoryId: categoryId });
    setSelectedIconId(null);
    setPendingDeleteCategoryId(null);
    setIconSelection(new Set());
    selectionAnchorRef.current = null;
    // 카테고리 추천 검색어(영어)를 검색 입력에 자동 채움
    const nextCategory = workspace.categories.find((category) => category.id === categoryId) ?? null;
    const recommended = getRecommendedQueryForCategory(nextCategory);
    if (recommended) setSearchInputSeed(recommended);
  };

  // 전체보기 스마트 뷰 — 삭제 불가, 저장 데이터에 카테고리 id를 쓰지 않는다
  const handleSelectViewAll = () => {
    updateWorkspace({ ...workspace, selectedCategoryId: undefined });
    setSelectedIconId(null);
    setPendingDeleteCategoryId(null);
    setIconSelection(new Set());
    selectionAnchorRef.current = null;
  };

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const now = new Date().toISOString();
    const category: SvgIconCategory = {
      id: createSvgIconId('svg-cat'),
      name,
      color: CATEGORY_COLORS[workspace.categories.length % CATEGORY_COLORS.length],
      iconIds: [],
      createdAt: now,
      updatedAt: now,
    };

    const { data, category: unc } = ensureUncategorizedCategory(workspace);
    const rest = data.categories.filter((item) => item.templateKey !== UNCATEGORIZED_TEMPLATE_KEY);
    updateWorkspace({
      ...data,
      categories: [unc, ...rest, category],
      selectedCategoryId: category.id,
    });
    setNewCategoryName('');
    setSelectedIconId(null);
  };

  const handleReorderUserCategory = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const unc = workspace.categories.filter((item) => item.templateKey === UNCATEGORIZED_TEMPLATE_KEY);
    const users = workspace.categories.filter((item) => item.templateKey !== UNCATEGORIZED_TEMPLATE_KEY);
    const fromIndex = users.findIndex((item) => item.id === sourceId);
    const toIndex = users.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const nextUsers = [...users];
    const [moved] = nextUsers.splice(fromIndex, 1);
    nextUsers.splice(toIndex, 0, moved);
    updateWorkspace({ ...workspace, categories: [...unc, ...nextUsers] });
  };

  const handleDeleteCategory = (category: SvgIconCategory) => {
    // 미분류는 삭제 불가
    if (category.templateKey === UNCATEGORIZED_TEMPLATE_KEY) return;

    if (pendingDeleteCategoryId !== category.id) {
      setPendingDeleteCategoryId(category.id);
      return;
    }

    const nextCategories = workspace.categories.filter((item) => item.id !== category.id);
    const deletedIconIds = new Set(category.iconIds);
    const nextSelectedId =
      workspace.selectedCategoryId === category.id
        ? undefined
        : workspace.selectedCategoryId && nextCategories.some((item) => item.id === workspace.selectedCategoryId)
          ? workspace.selectedCategoryId
          : undefined;
    updateWorkspace({
      ...workspace,
      categories: nextCategories,
      icons: workspace.icons.filter((icon) => !deletedIconIds.has(icon.id)),
      selectedCategoryId: nextSelectedId,
    });
    setPendingDeleteCategoryId(null);
    setSelectedIconId(null);
    showToast(t('editor.category.deleted', { name: getCategoryDisplayName(category, t) }));
  };

  const handleSettingChange = (defaultViewBox: SvgIconViewBox) => {
    updateWorkspace({ ...workspace, stylePreset: 'casual-bold', defaultViewBox });
  };

  // 현재 메인/보조 색상을 커스텀 프리셋으로 저장
  const handleSaveColorPreset = () => {
    const existing = workspace.customColorPresets ?? [];
    const isDuplicate = existing.some(
      (preset) =>
        preset.primary.toLowerCase() === primaryColor.toLowerCase() &&
        preset.accent.toLowerCase() === accentColor.toLowerCase()
    );
    if (isDuplicate) {
      showToast(t('editor.color.duplicate'));
      return;
    }
    const preset: SvgIconColorPreset = {
      id: createSvgIconId('svg-color'),
      label: `${primaryColor} / ${accentColor}`,
      primary: primaryColor,
      accent: accentColor,
    };
    updateWorkspace({ ...workspace, customColorPresets: [...existing, preset] });
    showToast(t('editor.color.presetSaved'));
  };

  // 커스텀 프리셋 삭제
  const handleDeleteColorPreset = (presetId: string) => {
    updateWorkspace({
      ...workspace,
      customColorPresets: (workspace.customColorPresets ?? []).filter((preset) => preset.id !== presetId),
    });
  };

  // 페이지네이션: 전체 페이지 수
  const totalPages = Math.max(1, Math.ceil(resultNames.length / SVG_ICON_SEARCH_PAGE_SIZE));

  // 특정 페이지의 SVG를 로드해 표시
  const loadSearchPage = async (names: string[], page: number, pageSize: number) => {
    const slice = getSvgIconSearchPageSlice(names, page, pageSize);
    const results = await fetchSvgIconsByNames(slice);
    setSearchResults(results);
    setSearchPage(page);
    setSelectedResultIds(new Set());
  };

  const handleSearchIcons = async (nextQuery: string) => {
    const query = nextQuery.trim();
    if (!query) {
      setError(t('editor.search.emptyQuery'));
      return;
    }

    setError(null);
    setIsSearching(true);
    // 최근 검색어 기록 (실패해도 검색은 계속)
    void storageService.addRecentSearch(query).then(() => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    });
    try {
      // 1) 이름 풀 조회(가벼움) → 2) 첫 페이지 SVG 로드
      const names = await searchSvgIconNames(query, {
        stylePreset: workspace.stylePreset,
        scope: searchScope,
        poolLimit: 600,
      });
      setResultNames(names);
      if (names.length === 0) {
        setSearchResults([]);
        setSearchPage(0);
        setSelectedResultIds(new Set());
        showToast(t('editor.search.noResults'));
        return;
      }
      await loadSearchPage(names, 0, SVG_ICON_SEARCH_PAGE_SIZE);
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? resolveErrorMessage(t, searchError)
          : t('editor.search.failed')
      );
    } finally {
      setIsSearching(false);
    }
  };

  // 페이지 이동
  const handleGoToPage = async (page: number) => {
    if (page < 0 || page >= totalPages || page === searchPage) return;
    setError(null);
    setIsSearching(true);
    try {
      await loadSearchPage(resultNames, page, SVG_ICON_SEARCH_PAGE_SIZE);
    } catch (pageError) {
      setError(
        pageError instanceof Error ? resolveErrorMessage(t, pageError) : t('editor.search.pageFailed')
      );
    } finally {
      setIsSearching(false);
    }
  };

  const toggleResultSelection = (resultId: string) => {
    setSelectedResultIds((prev) => {
      const next = new Set(prev);
      if (next.has(resultId)) next.delete(resultId);
      else next.add(resultId);
      return next;
    });
  };

  const handleDeleteIcon = (icon: SvgGameIcon) => {
    updateWorkspace({
      ...workspace,
      icons: workspace.icons.filter((item) => item.id !== icon.id),
      categories: workspace.categories.map((category) =>
        category.id === icon.categoryId
          ? { ...category, iconIds: category.iconIds.filter((iconId) => iconId !== icon.id) }
          : category
      ),
    });
    setSelectedIconId(null);
    showToast(t('editor.icon.deleted', { name: icon.name }));
  };

  // 아이콘 이름 변경 (빈 이름/동일 이름은 무시)
  const handleRenameIcon = (iconId: string, rawName: string) => {
    const name = rawName.trim();
    const icon = workspace.icons.find((item) => item.id === iconId);
    if (!icon || !name || name === icon.name) return;
    const now = new Date().toISOString();
    updateWorkspace({
      ...workspace,
      icons: workspace.icons.map((item) => (item.id === iconId ? { ...item, name, updatedAt: now } : item)),
    });
  };

  // 카테고리 이름 변경 — templateKey 카테고리(미분류 등)는 표시명이 언어팩에서 오므로 대상 아님
  const handleRenameCategory = (categoryId: string, rawName: string) => {
    const name = rawName.trim();
    const category = workspace.categories.find((item) => item.id === categoryId);
    if (!category || category.templateKey || !name || name === category.name) return;
    updateWorkspace({
      ...workspace,
      categories: workspace.categories.map((item) => (item.id === categoryId ? { ...item, name } : item)),
    });
  };

  // 즐겨찾기 해제 = 보관함에서 제거(즐겨찾기 탭 본문에서 사라짐)
  const handleUnfavoriteIcon = (icon: SvgGameIcon) => {
    updateWorkspace({
      ...workspace,
      icons: workspace.icons.filter((item) => item.id !== icon.id),
      categories: workspace.categories.map((category) =>
        category.id === icon.categoryId
          ? { ...category, iconIds: category.iconIds.filter((iconId) => iconId !== icon.id) }
          : category
      ),
    });
    if (selectedIconId === icon.id) setSelectedIconId(null);
    setIconSelection((prev) => {
      if (!prev.has(icon.id)) return prev;
      const next = new Set(prev);
      next.delete(icon.id);
      return next;
    });
    showToast(t('editor.icon.favoriteRemoved', { name: icon.name }));
  };

  const handleToggleFavorite = (icon: SvgGameIcon) => {
    if (icon.favorite) {
      handleUnfavoriteIcon(icon);
      return;
    }
    updateWorkspace({
      ...workspace,
      icons: workspace.icons.map((item) =>
        item.id === icon.id ? { ...item, favorite: true, updatedAt: new Date().toISOString() } : item
      ),
    });
    showToast(t('editor.icon.favoriteAdded', { name: icon.name }));
  };

  const confirmUnfavorite = () => {
    if (!unfavoriteConfirmIcon) return;
    handleUnfavoriteIcon(unfavoriteConfirmIcon);
    setUnfavoriteConfirmIcon(null);
  };

  // 검색 결과 카드의 별 버튼: 보관함에 같은 sourceId가 있으면 favorite 토글,
  // 없으면 "미분류" 카테고리를 보장한 뒤 즐겨찾기 상태로 저장한다.
  const handleToggleResultFavorite = (result: SvgIconSearchResult) => {
    const existing = workspace.icons.find((icon) => icon.sourceId === result.id);
    if (existing) {
      handleToggleFavorite(existing);
      return;
    }

    const now = new Date().toISOString();
    const { data, category } = ensureUncategorizedCategory(workspace);
    const icon: SvgGameIcon = {
      id: createSvgIconId('svg-icon'),
      categoryId: category.id,
      name: result.name,
      prompt: '',
      svg: result.svg,
      originalSvg: result.svg,
      tags: result.tags,
      stylePreset: workspace.stylePreset,
      viewBox: workspace.defaultViewBox,
      source: result.source,
      sourceId: result.id,
      sourceName: result.sourceName,
      sourceUrl: result.sourceUrl,
      license: result.license,
      favorite: true,
      createdAt: now,
      updatedAt: now,
    };

    updateWorkspace({
      ...data,
      icons: [icon, ...data.icons],
      categories: data.categories.map((item) =>
        item.id === category.id ? { ...item, iconIds: [icon.id, ...item.iconIds], updatedAt: now } : item
      ),
    });
    showToast(t('editor.icon.favoriteAdded', { name: result.name }));
  };

  // 라이트 항목(svg='') 하이드레이션: 표시 목록에 들어온 항목만 sourceId로 원본을 받아 채운다.
  // 상태 패치는 useSvgWorkspace의 디바운스 저장이 영속화한다. in-flight/실패 가드로 중복 요청 방지.
  useEffect(() => {
    const pending = visibleSavedIcons.filter(
      (icon) =>
        icon.svg === '' &&
        icon.sourceId &&
        !hydrationInFlightRef.current.has(icon.id) &&
        !hydrationFailedIds.has(icon.id)
    );
    if (pending.length === 0) return;
    pending.forEach((icon) => hydrationInFlightRef.current.add(icon.id));

    void (async () => {
      for (const icon of pending) {
        try {
          // fetchSvgIconsByNames가 sanitize까지 수행한다(실패/위험 SVG는 빈 배열).
          const [result] = await fetchSvgIconsByNames([icon.sourceId as string]);
          if (result) {
            const now = new Date().toISOString();
            updateWorkspace((prev) => ({
              ...prev,
              icons: prev.icons.map((item) =>
                item.id === icon.id && item.svg === ''
                  ? { ...item, svg: result.svg, originalSvg: result.svg, updatedAt: now }
                  : item
              ),
            }));
          } else {
            setHydrationFailedIds((prev) => new Set(prev).add(icon.id));
          }
        } catch {
          setHydrationFailedIds((prev) => new Set(prev).add(icon.id));
        } finally {
          hydrationInFlightRef.current.delete(icon.id);
        }
      }
    })();
  }, [visibleSavedIcons, hydrationFailedIds, updateWorkspace]);

  // 일괄 내보내기: 스타일 적용본은 svg 원문으로, 라이트 항목은 sourceId로 fetch하도록 넘긴다.
  const openBatchExport = (icons: SvgGameIcon[]) => {
    if (icons.length === 0) return;
    setBatchItems(
      icons.map((icon) =>
        icon.svg === '' && icon.sourceId
          ? { name: icon.sourceId }
          : { name: icon.name, svg: buildStandaloneSvg(buildIconForExport(icon)) }
      )
    );
  };

  // SVG 스프라이트 내보내기(원본 기준). 라이트 항목(svg='')은 제외하고 개수 안내.
  const handleExportSprite = async (icons: SvgGameIcon[]) => {
    const ready = icons.filter((icon) => icon.svg !== '');
    const skipped = icons.length - ready.length;
    if (ready.length === 0) {
      if (skipped > 0) showToast(t('editor.sprite.skipped', { count: skipped }), 'info');
      return;
    }
    const baseName = selectedCategory ? getCategoryDisplayName(selectedCategory, t) : 'icons';
    await handleSaveTextFile(t('editor.label.svgFile'), `${baseName}-sprite.svg`, buildSvgSprite(ready), 'svg');
    if (skipped > 0) showToast(t('editor.sprite.skipped', { count: skipped }), 'info');
  };

  const handleApplyStyleToIcon = (icon: SvgGameIcon) => {
    const now = new Date().toISOString();
    const styleSnapshot = getCurrentStyleSnapshot();
    updateWorkspace({
      ...workspace,
      icons: workspace.icons.map((item) =>
        item.id === icon.id
          ? {
              ...item,
              svg: item.originalSvg ?? item.svg,
              originalSvg: item.originalSvg ?? item.svg,
              stylePreset: workspace.stylePreset,
              viewBox: workspace.defaultViewBox,
              styleSnapshot,
              updatedAt: now,
            }
          : item
      ),
    });
    showToast(t('editor.icon.styleApplied', { name: icon.name }));
  };

  const handleCopy = async (label: string, text: string) => {
    await copyText(text);
    showToast(t('editor.copied', { label }));
  };

  // 텍스트 파일 저장(IconFinder 저장 정책: 자동저장 폴더 또는 저장 대화상자). 취소 시 토스트 없음.
  const handleSaveTextFile = async (label: string, fileName: string, text: string, extension: string) => {
    try {
      const savedPath = await exportService.saveTextFile(fileName, text, extension);
      if (savedPath) {
        showToast(t('editor.saveOk', { label }));
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? resolveErrorMessage(t, saveError)
          : t('editor.saveFail', { label })
      );
    }
  };

  // PNG 저장: Canvas 래스터화로 효과(필터) 포함. 크기는 설정값 기본. 취소 시 토스트 없음.
  const handleSavePng = async (label: string, fileName: string, svgContent: string, size?: number) => {
    try {
      const savedPath = await exportService.saveSvgAsPng(fileName, svgContent, size ?? exportSettings.size);
      if (savedPath) showToast(t('editor.saveOk', { label }));
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? resolveErrorMessage(t, saveError)
          : t('editor.saveFail', { label })
      );
    }
  };

  // 키보드 단축키: Cmd/Ctrl+S = 현재 Detail 아이콘 빠른 내보내기(설정 포맷), Cmd/Ctrl+F = 즐겨찾기 토글
  useKeyboardShortcuts({
    onQuickExport: () => {
      if (!activeDetailName || !activeDetailSvg) {
        showToast(t('editor.emptyPreview'), 'info');
        return;
      }
      if (exportSettings.format === 'svg') {
        void handleSaveTextFile(t('editor.label.svgFile'), `${activeDetailName}.svg`, activeDetailSvg, 'svg');
      } else {
        void handleSavePng(t('editor.label.pngFile'), `${activeDetailName}.png`, activeDetailSvg);
      }
    },
    onToggleFavorite: () => {
      if (selectedIcon) {
        handleToggleFavorite(selectedIcon);
      } else if (selectedResult) {
        handleToggleResultFavorite(selectedResult);
      }
    },
  });

  const draggingPreviewIcon =
    draggingIconIds.length > 0 ? workspace.icons.find((icon) => icon.id === draggingIconIds[0]) ?? null : null;

  return (
    <div className="flex h-full min-h-0 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {draggingPreviewIcon && dragPosition && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: dragPosition.x + 14, top: dragPosition.y - 14 }}
        >
          <div className="flex items-center gap-2 rounded-lg border border-lime-400 bg-white px-2 py-1.5 shadow-xl">
            <div
              className="h-8 w-8 text-slate-900 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: buildIconPreviewSvg(draggingPreviewIcon) }}
            />
            <span className="text-xs font-bold text-slate-700">
              {draggingIconIds.length > 1
                ? t('editor.dragCount', { count: draggingIconIds.length })
                : draggingPreviewIcon.name}
            </span>
          </div>
        </div>
      )}
      {mode === 'favorites' && (
      <>
      <aside
        style={{ width: displayLeftWidth }}
        className="shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden transition-[width] duration-200 ease-out dark:border-slate-800 dark:bg-slate-900"
      >
        {leftCollapsed ? (
          <div className="flex flex-1 flex-col items-center py-3">
            <button
              type="button"
              onClick={toggleLeftCollapsed}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={t('editor.sidebar.expand')}
              aria-label={t('editor.sidebar.expand')}
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        ) : (
          <>
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <FolderPlus size={14} className="shrink-0 text-lime-600 dark:text-lime-400" />
            <h2 className="min-w-0 flex-1 truncate text-xs font-semibold">{t('editor.vault.title')}</h2>
            <button
              type="button"
              onClick={toggleLeftCollapsed}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title={t('editor.sidebar.collapse')}
              aria-label={t('editor.sidebar.collapse')}
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
          <div className="mt-2 flex gap-1.5">
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleCreateCategory();
              }}
              placeholder={t('editor.category.new')}
              className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-lime-500 dark:border-slate-800 dark:bg-slate-900"
            />
            <button
              onClick={handleCreateCategory}
              className="rounded-md bg-slate-900 px-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t('common.add')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          {/* 전체보기 — 삭제·순서변경 불가 */}
          <button
            onClick={handleSelectViewAll}
            className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
              isViewAll ? 'bg-lime-100 text-lime-950 dark:bg-lime-900/40 dark:text-lime-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Grid3x3 size={12} className={isViewAll ? 'text-lime-700 dark:text-lime-400' : 'text-slate-400 dark:text-slate-500'} />
              <span className="min-w-0 flex-1 font-medium">{t('editor.category.viewAll')}</span>
              <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">
                {workspace.icons.filter((icon) => icon.favorite).length}
              </span>
            </span>
          </button>
          {/* 미분류 — 상단 고정, 삭제 불가 */}
          {uncategorizedCategory && (() => {
            const category = uncategorizedCategory;
            const isActive = !isViewAll && category.id === selectedCategoryId;
            const iconCount = workspace.icons.filter(
              (icon) => icon.categoryId === category.id && icon.favorite
            ).length;
            const isDropTarget = dragOverCategoryId === category.id;
            return (
              <div
                key={category.id}
                data-category-drop-id={category.id}
                className={`rounded-md ${isDropTarget ? 'ring-2 ring-lime-400 ring-offset-1' : ''}`}
              >
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                    isDropTarget ? 'bg-lime-50 dark:bg-lime-900/30' : isActive ? 'bg-lime-100 text-lime-950 dark:bg-lime-900/40 dark:text-lime-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="min-w-0 flex-1 font-medium">{getCategoryDisplayName(category, t)}</span>
                    <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">{iconCount}</span>
                  </span>
                </button>
              </div>
            );
          })()}
          {/* 사용자 카테고리 — 호버 시 삭제, DnD로 순서 변경 */}
          {userCategories.map((category) => {
            const isActive = !isViewAll && category.id === selectedCategoryId;
            const iconCount = workspace.icons.filter(
              (icon) => icon.categoryId === category.id && icon.favorite
            ).length;
            const isDropTarget = dragOverCategoryId === category.id;
            return (
              <div
                key={category.id}
                data-category-drop-id={category.id}
                draggable={editingCategoryId !== category.id}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/category-reorder', category.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(event) => {
                  if (!event.dataTransfer.types.includes('text/category-reorder')) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  const sourceId = event.dataTransfer.getData('text/category-reorder');
                  if (!sourceId) return;
                  event.preventDefault();
                  event.stopPropagation();
                  handleReorderUserCategory(sourceId, category.id);
                }}
                className={`group relative rounded-md ${
                  isDropTarget ? 'ring-2 ring-lime-400 ring-offset-1' : ''
                }`}
              >
                {editingCategoryId === category.id ? (
                  // 인라인 이름 편집: Enter/blur 확정, Escape 취소
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <input
                      autoFocus
                      defaultValue={category.name}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleRenameCategory(category.id, event.currentTarget.value);
                          setEditingCategoryId(null);
                        }
                        if (event.key === 'Escape') setEditingCategoryId(null);
                      }}
                      onBlur={(event) => {
                        handleRenameCategory(category.id, event.currentTarget.value);
                        setEditingCategoryId(null);
                      }}
                      className="min-w-0 flex-1 rounded border border-lime-500 px-1 py-0.5 text-xs font-medium outline-none dark:bg-slate-900"
                    />
                  </div>
                ) : (
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  onDoubleClick={() => {
                    if (!category.templateKey) setEditingCategoryId(category.id);
                  }}
                  title={category.templateKey ? undefined : t('editor.rename')}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                    isDropTarget ? 'bg-lime-50 dark:bg-lime-900/30' : isActive ? 'bg-lime-100 text-lime-950 dark:bg-lime-900/40 dark:text-lime-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 group-hover:pr-5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap group-hover:truncate font-medium">
                      {getCategoryDisplayName(category, t)}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">{iconCount}</span>
                  </span>
                </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category)}
                  className={`absolute right-0.5 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                    pendingDeleteCategoryId === category.id
                      ? 'bg-red-100 text-red-700 opacity-100 dark:bg-red-900/40 dark:text-red-300'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-400'
                  }`}
                  title={
                    pendingDeleteCategoryId === category.id
                      ? t('editor.category.deleteConfirm')
                      : t('editor.category.delete')
                  }
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
          </>
        )}
      </aside>
      {!leftCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('editor.sidebar.resize')}
          onPointerDown={handleLeftResizePointerDown}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-lime-300 active:bg-lime-400"
        />
      )}
      </>
      )}

      <section className="flex-1 min-w-0 flex flex-col">
        {mode === 'search' && (
          <EditorSearchToolbar
            initialQuery={searchInputSeed}
            isSearching={isSearching}
            scope={searchScope}
            onSearch={(query) => void handleSearchIcons(query)}
            onChangeScope={setSearchScope}
          />
        )}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden p-4">
          {mode === 'search' ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{t('editor.results.title')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('editor.results.meta', {
                      page: searchPage + 1,
                      totalPages,
                      shown: searchResults.length,
                      total: resultNames.length || searchResults.length,
                    })}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedResultIds(new Set())}
                    disabled={selectedResultIds.size === 0}
                    className="rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {t('common.clearSelection')}
                  </button>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    <Grid3x3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={gridColumns}
                      onChange={(event) => setGridColumns(Number(event.target.value))}
                      className="h-2 w-20 cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700"
                      title={t('common.gridColumns', { count: gridColumns })}
                    />
                    <span className="min-w-[2ch] text-xs font-semibold text-slate-500 dark:text-slate-400">{gridColumns}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <VirtualizedSvgIconGrid
                items={searchResults}
                columns={gridColumns}
                kind="search"
                getItemKey={(result) => result.id}
                empty={
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                    {isSearching ? t('editor.results.loading') : t('editor.results.emptyHint')}
                  </div>
                }
                renderItem={(result) => (
                  <SearchResultCard
                    result={result}
                    isSelected={selectedResultIds.has(result.id)}
                    isActive={selectedResultId === result.id}
                    isFavorite={favoriteSourceIds.has(result.id)}
                    buildPreviewSvg={buildSearchResultPreviewSvg}
                    onToggleSelection={toggleResultSelection}
                    onToggleFavorite={handleToggleResultFavorite}
                    onSelectResult={handleSelectSearchResult}
                  />
                )}
              />
            </div>
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleGoToPage(searchPage - 1)}
                    disabled={searchPage === 0 || isSearching}
                    className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400"
                  >
                    {t('common.previous')}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - searchPage) <= 2)
                    .reduce<number[]>((acc, i) => {
                      if (acc.length && i - acc[acc.length - 1] > 1) acc.push(-1);
                      acc.push(i);
                      return acc;
                    }, [])
                    .map((i, idx) =>
                      i === -1 ? (
                        <span key={`gap-${idx}`} className="px-1 text-slate-400 dark:text-slate-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleGoToPage(i)}
                          disabled={isSearching}
                          className={`min-w-[28px] rounded-md border px-2 py-1 font-semibold ${
                            i === searchPage
                              ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          {i + 1}
                        </button>
                      )
                    )}
                  <button
                    type="button"
                    onClick={() => handleGoToPage(searchPage + 1)}
                    disabled={searchPage >= totalPages - 1 || isSearching}
                    className="rounded-md border border-slate-200 px-2 py-1 font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </div>
          ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isViewAll
                      ? t('editor.category.viewAll')
                      : selectedCategory
                        ? getCategoryDisplayName(selectedCategory, t)
                        : t('editor.saved.title')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('editor.saved.counts', {
                      count: visibleSavedIcons.length,
                      selected: iconSelection.size,
                    })}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
                  {iconSelection.size > 0 ? (
                    <>
                      <span className="font-semibold text-lime-700 dark:text-lime-400">{t('editor.saved.dragToCategory')}</span>
                      <button
                        type="button"
                        onClick={() => setIconSelection(new Set())}
                        className="font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        {t('common.clearSelection')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openBatchExport(visibleSavedIcons.filter((icon) => iconSelection.has(icon.id)))
                        }
                        className="rounded-md bg-slate-900 px-2 py-1.5 font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        {t('batch.exportSelected', { count: iconSelection.size })}
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">{t('editor.saved.dragHint')}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => openBatchExport(visibleSavedIcons)}
                    disabled={visibleSavedIcons.length === 0}
                    className="rounded-md border border-slate-200 px-2 py-1.5 font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    {t('batch.exportCategory')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void handleExportSprite(
                        iconSelection.size > 0
                          ? visibleSavedIcons.filter((icon) => iconSelection.has(icon.id))
                          : visibleSavedIcons
                      )
                    }
                    disabled={visibleSavedIcons.length === 0}
                    className="rounded-md border border-slate-200 px-2 py-1.5 font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    {t('editor.sprite.button')}
                  </button>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    <Grid3x3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={gridColumns}
                      onChange={(event) => setGridColumns(Number(event.target.value))}
                      className="h-2 w-20 cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700"
                      title={t('common.gridColumns', { count: gridColumns })}
                    />
                    <span className="min-w-[2ch] text-xs font-semibold text-slate-500 dark:text-slate-400">{gridColumns}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <VirtualizedSvgIconGrid
                items={visibleSavedIcons}
                columns={gridColumns}
                kind="saved"
                getItemKey={(icon) => icon.id}
                empty={
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                    {t('editor.saved.empty')}
                  </div>
                }
                renderItem={(icon) => (
                  <SavedIconCard
                    icon={icon}
                    isChecked={iconSelection.has(icon.id)}
                    isDragging={draggingIconIds.includes(icon.id)}
                    isSelected={selectedIconId === icon.id}
                    isHydrationFailed={hydrationFailedIds.has(icon.id)}
                    buildPreviewSvg={buildIconPreviewSvg}
                    onMouseDown={handleIconMouseDown}
                    onToggleSelection={toggleIconSelection}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectIcon={(event, item) => {
                      if (suppressIconClickRef.current) {
                        suppressIconClickRef.current = false;
                        return;
                      }
                      if (event.shiftKey) {
                        handleShiftSelectIcon(item);
                        return;
                      }
                      if (event.metaKey || event.ctrlKey) {
                        toggleIconSelection(item.id);
                        selectionAnchorRef.current = item.id;
                        return;
                      }
                      selectionAnchorRef.current = item.id;
                      handleSelectSavedIcon(item);
                    }}
                  />
                )}
              />
            </div>
          </div>
          )}
        </div>

      </section>

      {!rightCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('editor.sidebar.resize')}
          onPointerDown={handleRightResizePointerDown}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-lime-300 active:bg-lime-400"
        />
      )}
      <aside
        style={{ width: displayRightWidth }}
        className="shrink-0 border-l border-slate-200 bg-white flex flex-col min-h-0 overflow-hidden transition-[width] duration-200 ease-out dark:border-slate-800 dark:bg-slate-900"
      >
        {rightCollapsed ? (
          <div className="flex flex-1 flex-col items-center py-3">
            <button
              type="button"
              onClick={toggleRightCollapsed}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={t('editor.sidebar.expand')}
              aria-label={t('editor.sidebar.expand')}
            >
              <PanelRightOpen size={18} />
            </button>
          </div>
        ) : (
          <>
        {/* 사이드바 전체를 하나의 스크롤 영역으로 — 빠른 내보내기 + 스타일 + 상세가 함께 스크롤되어 잘리지 않음 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 빠른 내보내기 — 항목 상태를 따른다(검색 결과=정규화 원본, 보관함 아이콘=저장된 스타일) */}
        <div className="border-b border-slate-200 p-4 space-y-3 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Download size={16} className="text-lime-600 dark:text-lime-400" />
              {t('export.quick')}
            </div>
            <div className="flex items-center gap-1">
            {activeDetailName && (
              <button
                onClick={() => {
                  setSelectedIconId(null);
                  setSelectedResultId(null);
                }}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                title={t('common.clearSelection')}
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={toggleRightCollapsed}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title={t('editor.sidebar.collapse')}
              aria-label={t('editor.sidebar.collapse')}
            >
              <PanelRightClose size={16} />
            </button>
            </div>
          </div>
          {activeDetailName ? (
            <>
              <div className="flex items-center gap-2">
                <label className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{t('editor.exportSize')}</label>
                <select
                  value={workspace.defaultViewBox}
                  onChange={(event) => handleSettingChange(event.target.value as SvgIconViewBox)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-lime-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  {SVG_ICON_VIEW_BOXES.map((viewBox) => (
                    <option key={viewBox} value={viewBox}>
                      {getSvgIconViewBoxLabel(viewBox)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    void handleSaveTextFile(
                      t('editor.label.svgFile'),
                      `${activeDetailName}.svg`,
                      activeDetailSvg,
                      'svg'
                    )
                  }
                  disabled={!activeDetailSvg}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Download size={14} />
                    SVG
                  </span>
                </button>
                <button
                  onClick={() =>
                    void handleSavePng(
                      t('editor.label.pngFile'),
                      `${activeDetailName}.png`,
                      activeDetailSvg
                    )
                  }
                  disabled={!activeDetailSvg}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Download size={14} />
                    PNG
                  </span>
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('editor.emptyPreview')}</p>
          )}
        </div>

        {/* 스타일 섹션 — 검색 탭은 항상, 즐겨찾기는 아이콘 선택 시에만 */}
        {(mode === 'search' || selectedIcon) && (
        <div className="border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsStyleOpen((prev) => !prev)}
            className="flex w-full items-center justify-between p-4 text-sm font-bold"
          >
            <span className="flex items-center gap-2">
              <Palette size={16} className="text-lime-600 dark:text-lime-400" />
              {t('editor.style.section')}
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 dark:text-slate-500 transition-transform ${isStyleOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isStyleOpen && (
          <div className="space-y-3 px-4 pb-4">
          {/* 색상 모드 + 마감을 통합한 단일 스타일 셀렉터 */}
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectStyle(opt.id)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  currentStyleKind === opt.id
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SVG_ICON_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setPrimaryColor(preset.primary);
                  setAccentColor(preset.accent);
                }}
                className="h-8 rounded-md border border-slate-200 dark:border-slate-800"
                style={{ background: `linear-gradient(135deg, ${preset.primary} 0 50%, ${preset.accent} 50% 100%)` }}
              />
            ))}
            {(workspace.customColorPresets ?? []).map((preset) => (
              <div key={preset.id} className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setAccentColor(preset.accent);
                  }}
                  className="h-8 w-full rounded-md border border-slate-200 dark:border-slate-800"
                  style={{ background: `linear-gradient(135deg, ${preset.primary} 0 50%, ${preset.accent} 50% 100%)` }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteColorPreset(preset.id)}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white shadow group-hover:flex dark:bg-slate-100 dark:text-slate-900"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          {/* 메인 · 보조 색상 + 프리셋 저장 — 프리셋 칩(h-8)과 높이 맞춤 */}
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <ColorSwatchPicker
                value={primaryColor}
                onChange={setPrimaryColor}
                label={t('editor.color.main.label')}
                overlayLabel={t('editor.color.main')}
                className="h-8 w-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <ColorSwatchPicker
                value={accentColor}
                onChange={setAccentColor}
                label={t('editor.color.sub.label')}
                overlayLabel={t('editor.color.sub')}
                className="h-8 w-full"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveColorPreset}
              className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-dashed border-slate-300 px-3 text-xs font-semibold text-slate-500 hover:border-lime-400 hover:text-lime-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-lime-400"
            >
              <Plus size={12} /> {t('common.save')}
            </button>
          </div>

          {/* 합성 가능한 스타일 효과 — 항목별 1행(토글/색상/강도) */}
          <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('editor.effect.group')}</div>
            {/* 외곽선: 토글 + 색상 + 굵기 슬라이더 (다른 효과와 동일한 1행 UX) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOutlineEnabled((v) => !v)}
                className={`w-20 shrink-0 rounded-md px-2 py-1.5 text-xs font-semibold ${
                  outlineEnabled ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {t('editor.outline')}
              </button>
              <ColorSwatchPicker
                value={outlineColor}
                onChange={setOutlineColor}
                disabled={!outlineEnabled}
                label={t('editor.outline.color')}
                className="h-8 w-9 shrink-0"
              />
              <input
                type="range"
                min={1}
                max={OUTLINE_WIDTH_MAX}
                value={outlineWidth}
                disabled={!outlineEnabled}
                onChange={(event) => setOutlineWidth(Number(event.target.value))}
                className={`h-8 flex-1 accent-lime-500 ${outlineEnabled ? '' : 'opacity-50'}`}
              />
            </div>
            {([
              { key: 'dropShadow', labelKey: 'effect.dropShadow' },
              { key: 'outerGlow', labelKey: 'effect.outerGlow' },
              { key: 'innerGlow', labelKey: 'effect.innerGlow' },
            ] as Array<{ key: 'dropShadow' | 'outerGlow' | 'innerGlow'; labelKey: TranslationKey }>).map((item) => {
              const effect = effects[item.key];
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEffects((p) => ({ ...p, [item.key]: { ...p[item.key], enabled: !p[item.key].enabled } }))
                    }
                    className={`w-20 shrink-0 rounded-md px-2 py-1.5 text-xs font-semibold ${
                      effect.enabled ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {t(item.labelKey)}
                  </button>
                  <ColorSwatchPicker
                    value={effect.color}
                    onChange={(color) =>
                      setEffects((p) => ({ ...p, [item.key]: { ...p[item.key], color } }))
                    }
                    disabled={!effect.enabled}
                    label={t('editor.effect.color', { effect: t(item.labelKey) })}
                    className="h-8 w-9 shrink-0"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={effect.intensity}
                    disabled={!effect.enabled}
                    onChange={(event) =>
                      setEffects((p) => ({ ...p, [item.key]: { ...p[item.key], intensity: Number(event.target.value) } }))
                    }
                    className={`h-8 flex-1 accent-lime-500 ${effect.enabled ? '' : 'opacity-50'}`}
                  />
                </div>
              );
            })}
            {/* 베벨: 모드 3분할 + 강도 */}
            <div className="flex items-center gap-2">
              <div className="grid w-44 shrink-0 grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                {([
                  { value: 'none', labelKey: 'bevel.none' },
                  { value: 'raised', labelKey: 'bevel.raised' },
                  { value: 'engraved', labelKey: 'bevel.engraved' },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setEffects((p) => ({ ...p, bevel: { ...p.bevel, mode: item.value } }))}
                    className={`rounded-md px-1 py-1 text-xs font-semibold ${
                      effects.bevel.mode === item.value
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {t(item.labelKey)}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={effects.bevel.intensity}
                disabled={effects.bevel.mode === 'none'}
                onChange={(event) =>
                  setEffects((p) => ({ ...p, bevel: { ...p.bevel, intensity: Number(event.target.value) } }))
                }
                className={`h-8 flex-1 accent-lime-500 ${effects.bevel.mode === 'none' ? 'opacity-50' : ''}`}
              />
            </div>
          </div>
          </div>
          )}
        </div>
        )}

        {selectedIcon ? (
          <div className="p-4 space-y-4">
            {/* 이름 (연필 버튼으로 인라인 편집) */}
            <div className="flex items-center gap-1.5">
              {editingIconId === selectedIcon.id ? (
                <input
                  autoFocus
                  defaultValue={selectedIcon.name}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleRenameIcon(selectedIcon.id, event.currentTarget.value);
                      setEditingIconId(null);
                    }
                    if (event.key === 'Escape') setEditingIconId(null);
                  }}
                  onBlur={(event) => {
                    handleRenameIcon(selectedIcon.id, event.currentTarget.value);
                    setEditingIconId(null);
                  }}
                  className="min-w-0 flex-1 rounded-md border border-lime-500 px-2 py-1 text-sm font-semibold outline-none dark:bg-slate-900"
                />
              ) : (
                <>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold" title={selectedIcon.name}>
                    {selectedIcon.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingIconId(selectedIcon.id)}
                    className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    title={t('editor.rename')}
                    aria-label={t('editor.rename')}
                  >
                    <Pencil size={13} />
                  </button>
                </>
              )}
            </div>
            {/* 복사: 아이콘 + SVG/HTML/CSS */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCopy('SVG', selectedIconExportSvg || selectedIcon.svg)}
                className="rounded-lg bg-slate-900 px-2 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <Copy size={12} />
                  SVG
                </span>
              </button>
              <button
                onClick={() =>
                  handleCopy(t('editor.label.html'), buildHtmlIconSnippet(selectedIconForExport ?? selectedIcon))
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <Copy size={12} />
                  HTML
                </span>
              </button>
              <button
                onClick={() =>
                  handleCopy(t('editor.label.css'), buildSvgDataUri(selectedIconForExport ?? selectedIcon))
                }
                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <Copy size={12} />
                  CSS
                </span>
              </button>
            </div>
            {/* 재적용 | 삭제 — 아웃라인으로 대비 확보 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApplyStyleToIcon(selectedIcon)}
                className="flex-1 rounded-lg border border-lime-400 bg-lime-100 px-3 py-2 text-sm font-semibold text-lime-900 hover:bg-lime-200 dark:bg-lime-900/40 dark:text-lime-200 dark:hover:bg-lime-900/60"
              >
                {t('editor.reapplyStyle')}
              </button>
              <button
                onClick={() => handleDeleteIcon(selectedIcon)}
                className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Trash2 size={14} />
                  {t('common.delete')}
                </span>
              </button>
            </div>
          </div>
        ) : selectedResult ? (
          <div className="p-4 space-y-4">
            <button
              onClick={() => handleCopy('SVG', selectedResultPreviewSvg)}
              className="w-full rounded-lg bg-slate-900 px-2 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <span className="inline-flex items-center justify-center gap-1">
                <Copy size={12} />
                SVG
              </span>
            </button>

            {selectedResult.license && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <p>{t('editor.license', { license: selectedResult.license })}</p>
              </div>
            )}
          </div>
        ) : null}
        </div>
          </>
        )}
      </aside>

      {/* 일괄 내보내기 다이얼로그 — 워크스페이스 내부 배치 */}
      <BatchExportDialog
        items={batchItems ?? []}
        isOpen={batchItems !== null}
        onClose={() => setBatchItems(null)}
      />

      {/* 즐겨찾기 해제 확인 — window.confirm 대신 커스텀 다이얼로그 */}
      <Dialog
        open={unfavoriteConfirmIcon !== null}
        onOpenChange={(open) => {
          if (!open) setUnfavoriteConfirmIcon(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('favorites.remove')}</DialogTitle>
            <DialogDescription>{t('favorites.removeConfirm')}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUnfavoriteConfirmIcon(null)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={confirmUnfavorite}
              className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              {t('common.confirm')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
