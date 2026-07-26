import { SvgGameIcon } from '../../types/svgIcon';

function safeFileName(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'svg-icon';
}

export function buildHtmlIconSnippet(icon: SvgGameIcon): string {
  return `<button class="game-icon" aria-label="${icon.name}">
  ${buildStandaloneSvg(icon)}
</button>`;
}

interface ParsedViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function parseViewBox(viewBox: string): ParsedViewBox | null {
  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map((value) => Number(value));
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;
  return { x: values[0], y: values[1], width: values[2], height: values[3] };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, '');
}

function getOutlineInset(svg: Element): number {
  const outlineWidth = Number(svg.getAttribute('data-svg-icon-outline-width'));
  if (!Number.isFinite(outlineWidth) || outlineWidth <= 0) return 0;
  const normalizePadding = Number(svg.getAttribute('data-svg-icon-normalize-padding'));
  const existingPadding = Number.isFinite(normalizePadding) && normalizePadding > 0 ? normalizePadding : 0;
  return Math.max(0, outlineWidth + 2 - existingPadding);
}

function expandViewBoxForOutline(viewBox: string, svg: Element): { viewBox: string; width: number; height: number } | null {
  const parsed = parseViewBox(viewBox);
  if (!parsed) return null;

  const inset = getOutlineInset(svg);
  if (inset <= 0) {
    return { viewBox, width: parsed.width, height: parsed.height };
  }

  const nextX = parsed.x - inset;
  const nextY = parsed.y - inset;
  const nextWidth = parsed.width + inset * 2;
  const nextHeight = parsed.height + inset * 2;
  return {
    viewBox: [nextX, nextY, nextWidth, nextHeight].map(formatNumber).join(' '),
    width: parsed.width,
    height: parsed.height,
  };
}

export function buildStandaloneSvg(icon: SvgGameIcon): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(icon.svg, 'image/svg+xml');
  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() !== 'svg') return icon.svg;

  const viewBox = svg.getAttribute('viewBox') ?? icon.viewBox;
  const exportBox = expandViewBoxForOutline(viewBox, svg);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', exportBox?.viewBox ?? viewBox);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  if (exportBox) {
    svg.setAttribute('width', String(exportBox.width));
    svg.setAttribute('height', String(exportBox.height));
  }
  svg.removeAttribute('overflow');
  if (svg.getAttribute('style') === 'overflow:visible') svg.removeAttribute('style');
  return new XMLSerializer().serializeToString(svg);
}

export function buildSvgSprite(icons: SvgGameIcon[]): string {
  const parser = new DOMParser();
  const usedIds = new Set<string>();
  const symbols = icons.map((icon) => {
    const doc = parser.parseFromString(icon.svg, 'image/svg+xml');
    const svg = doc.documentElement;
    const viewBox = svg.getAttribute('viewBox') ?? icon.viewBox;
    const exportBox = expandViewBoxForOutline(viewBox, svg);
    // 동명 아이콘의 symbol id 충돌 방지: -2, -3… 접미사
    const baseId = `icon-${safeFileName(icon.name).toLowerCase()}`;
    let symbolId = baseId;
    let suffix = 2;
    while (usedIds.has(symbolId)) symbolId = `${baseId}-${suffix++}`;
    usedIds.add(symbolId);
    return `<symbol id="${symbolId}" viewBox="${exportBox?.viewBox ?? viewBox}">
${svg.innerHTML}
</symbol>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
${symbols.join('\n')}
</svg>`;
}

export function buildSvgDataUri(icon: SvgGameIcon): string {
  return `background-image: url("data:image/svg+xml,${encodeURIComponent(buildStandaloneSvg(icon))}");`;
}

export function downloadTextFile(fileName: string, text: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeFileName(fileName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
