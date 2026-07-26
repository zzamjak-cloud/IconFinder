export const SVG_ICON_SEARCH_PAGE_SIZE = 48;
export const SVG_ICON_GRID_GAP = 12;
export const SVG_ICON_SAVED_PANE_DEFAULT_HEIGHT = 300;
export const SVG_ICON_SAVED_PANE_MIN_HEIGHT = 180;
export const SVG_ICON_SEARCH_PANE_MIN_HEIGHT = 220;

export type SvgIconGridKind = 'search' | 'saved';

export interface SvgIconGridMetrics {
  columnCount: number;
  gridGap: number;
  cellWidth: number;
  cardHeight: number;
  rowPitch: number;
}

export interface SvgIconGridRowStyleOptions {
  columnCount: number;
  gridGap: number;
  rowPitch: number;
  rowIndex: number;
}

export interface SvgIconPaneRect {
  top: number;
  bottom: number;
}

export interface SvgIconPaneDragOptions {
  initialHeight: number;
  startY: number;
  currentY: number;
  containerHeight: number;
  minSavedHeight?: number;
  minSearchHeight?: number;
}

export function getSvgIconSearchPageSlice<T>(
  items: T[],
  page: number,
  pageSize = SVG_ICON_SEARCH_PAGE_SIZE
): T[] {
  const safePage = Math.max(0, Math.floor(page));
  const safePageSize = Math.max(1, Math.floor(pageSize));
  return items.slice(safePage * safePageSize, (safePage + 1) * safePageSize);
}

export function clampSvgIconSavedPaneHeight(
  nextHeight: number,
  containerHeight: number,
  minSavedHeight = SVG_ICON_SAVED_PANE_MIN_HEIGHT,
  minSearchHeight = SVG_ICON_SEARCH_PANE_MIN_HEIGHT
): number {
  const safeContainerHeight = Math.max(0, containerHeight);
  const minHeight = Math.min(minSavedHeight, safeContainerHeight);
  const maxHeight = Math.max(minHeight, safeContainerHeight - minSearchHeight);
  return Math.min(Math.max(nextHeight, minHeight), maxHeight);
}

export function getSvgIconSavedPaneHeightFromPointer(
  rect: SvgIconPaneRect,
  pointerY: number,
  minSavedHeight = SVG_ICON_SAVED_PANE_MIN_HEIGHT,
  minSearchHeight = SVG_ICON_SEARCH_PANE_MIN_HEIGHT
): number {
  const containerHeight = Math.max(0, rect.bottom - rect.top);
  const nextHeight = rect.bottom - pointerY;
  return clampSvgIconSavedPaneHeight(nextHeight, containerHeight, minSavedHeight, minSearchHeight);
}

export function getSvgIconSavedPaneHeightFromDrag({
  initialHeight,
  startY,
  currentY,
  containerHeight,
  minSavedHeight = SVG_ICON_SAVED_PANE_MIN_HEIGHT,
  minSearchHeight = SVG_ICON_SEARCH_PANE_MIN_HEIGHT,
}: SvgIconPaneDragOptions): number {
  const deltaY = startY - currentY;
  return clampSvgIconSavedPaneHeight(initialHeight + deltaY, containerHeight, minSavedHeight, minSearchHeight);
}

export function getSvgIconGridMetrics(
  containerWidth: number,
  columnCount: number,
  _kind: SvgIconGridKind
): SvgIconGridMetrics {
  const safeColumnCount = Math.max(1, Math.floor(columnCount));
  const cellWidth =
    containerWidth > 0
      ? Math.max(0, (containerWidth - SVG_ICON_GRID_GAP * (safeColumnCount - 1)) / safeColumnCount)
      : 0;
  // 검색/저장 카드 동일 골격(미리보기·이름·액션) — 상단 출처 행 제거 반영
  const verticalAllowance = 90;
  const cardHeight = cellWidth > 0 ? cellWidth + verticalAllowance : 180 + verticalAllowance;

  return {
    columnCount: safeColumnCount,
    gridGap: SVG_ICON_GRID_GAP,
    cellWidth,
    cardHeight,
    rowPitch: cardHeight + SVG_ICON_GRID_GAP,
  };
}

export function getSvgIconGridTotalHeight(rowCount: number, rowPitch: number): number {
  return Math.max(0, rowCount) * rowPitch;
}

export function getSvgIconGridRowStyle({ columnCount, gridGap, rowPitch, rowIndex }: SvgIconGridRowStyleOptions) {
  const rowStart = Math.max(0, rowIndex) * rowPitch;

  return {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: `${rowPitch}px`,
    transform: `translateY(${rowStart}px)`,
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    columnGap: `${gridGap}px`,
    paddingBottom: `${gridGap}px`,
    boxSizing: 'border-box' as const,
    alignItems: 'stretch' as const,
  };
}
