import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect } from 'react';
import { Grid3x3 } from 'lucide-react';
import { useIconSearch } from '@/hooks/useIconSearch';
import { useSearchStore } from '@/stores/searchStore';
import { useI18n } from '@/i18n/I18nProvider';
import { resolveErrorMessage } from '@/i18n/errorMessage';
import { IconCard } from './IconCard';

interface IconGridProps {
  onIconClick?: (iconName: string) => void;
  showOnlyFavorites?: boolean;
  favorites?: string[];
  columns?: number; // 그리드 컬럼 수 (기본값: 5)
  onColumnsChange?: (columns: number) => void; // 컬럼 수 변경 콜백 (결과 라인 슬라이더용)
}

/**
 * 가상화된 아이콘 그리드 컴포넌트
 * - TanStack Virtual을 사용하여 대량의 아이콘을 효율적으로 렌더링
 * - 뷰포트에 보이는 항목만 렌더링하여 성능 최적화
 * - 사용자 정의 가능한 그리드 레이아웃 (5~10열)
 * - 즐겨찾기 필터 지원
 */
export function IconGrid({ onIconClick, showOnlyFavorites = false, favorites = [], columns = 5, onColumnsChange }: IconGridProps) {
  const { query, selectedPrefix } = useSearchStore();
  const { t } = useI18n();

  // 아이콘 검색
  const { data, isLoading, error } = useIconSearch(query, {
    prefix: selectedPrefix || undefined,
  });

  const parentRef = useRef<HTMLDivElement>(null);

  // 컨테이너 폭 측정 (컬럼 수에 비례해 카드/행 높이를 계산하기 위함)
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 표시할 아이콘 목록 결정 (즐겨찾기 필터 적용)
  const displayIcons = showOnlyFavorites ? favorites : (data?.icons || []);

  // 그리드 설정
  const columnCount = columns; // 사용자 정의 컬럼 수
  const rowCount = Math.ceil(displayIcons.length / columnCount);

  // 셀 너비에 비례한 카드/행 높이 — 컬럼이 줄면 셀이 커지고 이미지도 함께 커진다
  const GRID_GAP = 16; // 1rem
  const LABEL_ALLOWANCE = 52; // 아이콘 이름/prefix 영역
  const cellWidth =
    containerWidth > 0 ? (containerWidth - GRID_GAP * (columnCount - 1)) / columnCount : 0;
  const cardHeight = cellWidth > 0 ? cellWidth + LABEL_ALLOWANCE : 140;
  const rowPitch = cardHeight + GRID_GAP; // 행 간격 포함 높이

  // 가상화 설정
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowPitch,
    overscan: 5, // 뷰포트 외부에 미리 렌더링할 행 수
  });

  // 컬럼 수/컨테이너 폭 변경 시 행 높이 재측정
  useEffect(() => {
    virtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowPitch]);

  // 로딩 상태
  if (query.length >= 2 && isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">{t('search.searching')}</p>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-2">{t('search.error.title')}</p>
          <p className="text-sm text-muted-foreground">
            {resolveErrorMessage(t, error)}
          </p>
        </div>
      </div>
    );
  }

  // 검색어가 너무 짧음 (컬렉션이 선택되지 않은 경우에만)
  if (query.length > 0 && query.length < 2 && !selectedPrefix) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          {t('search.minChars')}
        </p>
      </div>
    );
  }

  // 검색 결과 없음
  if (data && data.icons.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            {selectedPrefix
              ? t('search.empty.inCollection', { query })
              : t('search.empty.all', { query })
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {t('search.empty.hint')}
          </p>
        </div>
      </div>
    );
  }

  // 즐겨찾기 모드
  if (showOnlyFavorites) {
    if (favorites.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              {t('favorites.gridEmpty')}
            </h3>
            <p className="text-muted-foreground">
              {t('favorites.gridEmptyHint')}
            </p>
          </div>
        </div>
      );
    }
    // 즐겨찾기 목록을 표시 (아래 가상화된 그리드 렌더링 섹션에서 처리)
  }
  // 초기 상태 (검색 전이고 컬렉션도 선택되지 않음)
  else if (!query && !selectedPrefix) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            {t('search.initial.title')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('search.initial.subtitle')}
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{t('search.initial.example')}</p>
            <p className="mt-2">{t('search.initial.orPick')}</p>
          </div>
        </div>
      </div>
    );
  }

  // 가상화된 그리드 렌더링
  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
    >
      {/* 검색 결과 정보 + 그리드 컬럼 슬라이더 (우측 상단) */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {showOnlyFavorites ? (
            t('search.count.favorites', { count: displayIcons.length })
          ) : selectedPrefix && !query ? (
            t('search.count.collection', { count: displayIcons.length })
          ) : (
            t('search.count.results', { shown: displayIcons.length, total: data?.total ?? 0 })
          )}
        </div>
        {onColumnsChange && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 shrink-0">
            <Grid3x3 className="w-4 h-4 text-muted-foreground" />
            <input
              type="range"
              min="5"
              max="10"
              value={columns}
              onChange={(e) => onColumnsChange(Number(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              title={t('common.gridColumns', { count: columns })}
            />
            <span className="text-sm font-medium text-muted-foreground min-w-[2ch]">
              {columns}
            </span>
          </div>
        )}
      </div>

      {/* 가상화된 그리드 */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIdx = virtualRow.index * columnCount;
          const rowIcons = displayIcons.slice(startIdx, startIdx + columnCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                columnGap: `${GRID_GAP}px`,
                // 행 간격(GRID_GAP)을 아래 여백으로 두어 카드 자체는 cardHeight를 채운다
                paddingBottom: `${GRID_GAP}px`,
                boxSizing: 'border-box',
                alignItems: 'stretch',
              }}
            >
              {rowIcons.map((iconName) => (
                <IconCard
                  key={iconName}
                  iconName={iconName}
                  onClick={() => onIconClick?.(iconName)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
