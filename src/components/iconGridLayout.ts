export const ICON_GRID_GAP = 16;
export const ICON_GRID_LABEL_ALLOWANCE = 52;
export const ICON_GRID_FALLBACK_CARD_HEIGHT = 140;

export interface IconGridMetrics {
  columnCount: number;
  gridGap: number;
  cellWidth: number;
  cardHeight: number;
  rowPitch: number;
}

export interface IconGridRowStyleOptions {
  columnCount: number;
  gridGap: number;
  rowPitch: number;
  rowIndex: number;
}

export function getIconGridMetrics(containerWidth: number, columnCount: number): IconGridMetrics {
  const safeColumnCount = Math.max(1, Math.floor(columnCount));
  const cellWidth =
    containerWidth > 0
      ? Math.max(0, (containerWidth - ICON_GRID_GAP * (safeColumnCount - 1)) / safeColumnCount)
      : 0;
  const cardHeight = cellWidth > 0 ? cellWidth + ICON_GRID_LABEL_ALLOWANCE : ICON_GRID_FALLBACK_CARD_HEIGHT;

  return {
    columnCount: safeColumnCount,
    gridGap: ICON_GRID_GAP,
    cellWidth,
    cardHeight,
    rowPitch: cardHeight + ICON_GRID_GAP,
  };
}

export function getIconGridTotalHeight(rowCount: number, rowPitch: number): number {
  return Math.max(0, rowCount) * rowPitch;
}

export function getIconGridRowStyle({ columnCount, gridGap, rowPitch, rowIndex }: IconGridRowStyleOptions) {
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

export function getIconGridVirtualizerKey(columnCount: number, rowPitch: number, index: number): string {
  return `${columnCount}:${rowPitch.toFixed(3)}:${index}`;
}
