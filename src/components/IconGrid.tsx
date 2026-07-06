import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Grid3x3 } from 'lucide-react';
import { useIconSearch } from '@/hooks/useIconSearch';
import { useSearchStore } from '@/stores/searchStore';
import { IconCard } from './IconCard';
import {
  getIconGridMetrics,
  getIconGridRowStyle,
  getIconGridTotalHeight,
  getIconGridVirtualizerKey,
} from './iconGridLayout';

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

  // 아이콘 검색
  const { data, isLoading, error } = useIconSearch(query, {
    prefix: selectedPrefix || undefined,
  });

  const parentRef = useRef<HTMLDivElement | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const setParentElement = useCallback((node: HTMLDivElement | null) => {
    parentRef.current = node;
    setScrollElement(node);
  }, []);

  // 컨테이너 폭 측정 (컬럼 수에 비례해 카드/행 높이를 계산하기 위함)
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = scrollElement;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollElement]);

  // 표시할 아이콘 목록 결정 (즐겨찾기 필터 적용)
  const displayIcons = showOnlyFavorites ? favorites : (data?.icons || []);

  // 그리드 설정
  const columnCount = Math.max(1, Math.floor(columns)); // 사용자 정의 컬럼 수
  const rowCount = Math.ceil(displayIcons.length / columnCount);

  // 셀 너비에 비례한 카드/행 높이 — 컬럼이 줄면 셀이 커지고 이미지도 함께 커진다
  const gridMetrics = getIconGridMetrics(containerWidth, columnCount);
  const rowPitch = gridMetrics.rowPitch; // 행 간격 포함 높이
  const gridGap = gridMetrics.gridGap;
  const getVirtualizerItemKey = useCallback(
    (index: number) => getIconGridVirtualizerKey(columnCount, rowPitch, index),
    [columnCount, rowPitch]
  );

  // 가상화 설정
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowPitch,
    getItemKey: getVirtualizerItemKey,
    overscan: 5, // 뷰포트 외부에 미리 렌더링할 행 수
  });

  // 컬럼 수/컨테이너 폭 변경 시 행 높이 재측정
  useEffect(() => {
    virtualizer.measure();
  }, [columnCount, rowPitch, virtualizer]);

  // 로딩 상태
  if (query.length >= 2 && isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">아이콘 검색 중...</p>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-2">검색 중 오류가 발생했습니다</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : '알 수 없는 오류'}
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
          최소 2글자 이상 입력해주세요
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
              ? `선택한 컬렉션에서 "${query}"에 대한 검색 결과가 없습니다`
              : `"${query}"에 대한 검색 결과가 없습니다`
            }
          </p>
          <p className="text-sm text-muted-foreground">
            다른 검색어로 시도해보세요
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
              즐겨찾기가 비어있습니다
            </h3>
            <p className="text-muted-foreground">
              아이콘 카드의 별 아이콘을 클릭하여 즐겨찾기에 추가하세요
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
            아이콘 검색을 시작하세요
          </h3>
          <p className="text-muted-foreground mb-4">
            275,000개 이상의 오픈소스 아이콘을 검색할 수 있습니다
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>예시: home, user, settings, arrow, check</p>
            <p className="mt-2">또는 상단의 카테고리에서 아이콘 세트를 선택하세요</p>
          </div>
        </div>
      </div>
    );
  }

  // 가상화된 그리드 렌더링
  return (
    <div
      ref={setParentElement}
      className="h-full overflow-auto"
    >
      {/* 검색 결과 정보 + 그리드 컬럼 슬라이더 (우측 상단) */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {showOnlyFavorites ? (
            `즐겨찾기 ${displayIcons.length}개`
          ) : selectedPrefix && !query ? (
            `선택한 컬렉션: ${displayIcons.length}개 아이콘`
          ) : (
            `${data?.total}개 결과 중 ${displayIcons.length}개 표시`
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
              title={`Grid 컬럼: ${columns}`}
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
          height: `${getIconGridTotalHeight(rowCount, rowPitch)}px`,
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
                ...getIconGridRowStyle({
                  columnCount,
                  gridGap,
                  rowPitch,
                  rowIndex: virtualRow.index,
                }),
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
