/**
 * 아이콘 폰트(TTF) 변환 — fill 기반 호환 SVG만 처리
 * - stroke/gradient/filter 등은 비호환으로 제외
 * - viewBox → em(unitsPerEm 1000) 좌표, Y축 반전
 */

import { Font, Glyph, Path } from 'opentype.js';
import SvgPath from 'svgpath';

export const FONT_UNITS_PER_EM = 1000;
/** Private Use Area 시작 */
export const FONT_PUA_START = 0xe000;

export type FontSkipReason =
  | 'empty'
  | 'stroke'
  | 'gradient'
  | 'filter'
  | 'mask'
  | 'clipPath'
  | 'image'
  | 'text'
  | 'evenodd'
  | 'noShape'
  | 'parse'
  | 'convert';

export interface FontGlyphInput {
  name: string;
  /** 스타일 미적용 원본 SVG 권장 */
  svg: string;
}

export interface FontGlyphMapping {
  name: string;
  codepoint: number;
  char: string;
}

export interface FontExportSkipped {
  name: string;
  reason: FontSkipReason;
}

export interface FontExportResult {
  fontFamily: string;
  ttfBytes: ArrayBuffer;
  css: string;
  htmlPreview: string;
  mapping: FontGlyphMapping[];
  converted: FontGlyphMapping[];
  skipped: FontExportSkipped[];
}

const FORBIDDEN_TAGS = new Set([
  'lineargradient',
  'radialgradient',
  'filter',
  'mask',
  'clippath',
  'image',
  'text',
  'textpath',
  'tspan',
  'foreignobject',
  'use', // 외부 참조는 해석 비용이 커서 1차 제외
  'pattern',
  'symbol',
]);

const SHAPE_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline']);

function getAttr(el: Element, name: string): string | null {
  return el.getAttribute(name) ?? el.getAttribute(name.toLowerCase());
}

function hasMeaningfulStroke(el: Element): boolean {
  const stroke = (getAttr(el, 'stroke') ?? '').trim().toLowerCase();
  if (stroke && stroke !== 'none' && stroke !== 'transparent') return true;

  const style = (getAttr(el, 'style') ?? '').toLowerCase();
  if (/stroke\s*:\s*(?!none\b|transparent\b)[^;]+/.test(style)) return true;

  // stroke-width만 있고 stroke가 없으면 SVG 기본 stroke=none → 허용
  return false;
}

function hasEvenodd(el: Element): boolean {
  const fillRule = (getAttr(el, 'fill-rule') ?? getAttr(el, 'fillRule') ?? '').toLowerCase();
  const clipRule = (getAttr(el, 'clip-rule') ?? '').toLowerCase();
  const style = (getAttr(el, 'style') ?? '').toLowerCase();
  if (fillRule === 'evenodd' || clipRule === 'evenodd') return true;
  if (/fill-rule\s*:\s*evenodd/.test(style) || /clip-rule\s*:\s*evenodd/.test(style)) return true;
  return false;
}

function parseSvgRoot(svg: string): { doc: Document; root: SVGSVGElement } | null {
  const trimmed = svg.trim();
  if (!trimmed) return null;
  const doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== 'svg') return null;
  return { doc, root: root as unknown as SVGSVGElement };
}

/**
 * 폰트 변환 가능 여부 (fill 기반 path/도형만)
 */
export function isFontConvertible(svg: string): boolean {
  return getFontIncompatibilityReason(svg) === null;
}

export function getFontIncompatibilityReason(svg: string): FontSkipReason | null {
  const parsed = parseSvgRoot(svg);
  if (!parsed) return svg.trim() ? 'parse' : 'empty';

  const { root } = parsed;
  let shapeCount = 0;

  const walk = (el: Element): FontSkipReason | null => {
    const tag = el.tagName.toLowerCase().replace(/^.*:/, '');

    if (FORBIDDEN_TAGS.has(tag)) {
      if (tag.includes('gradient') || tag === 'pattern') return 'gradient';
      if (tag === 'filter') return 'filter';
      if (tag === 'mask') return 'mask';
      if (tag === 'clippath') return 'clipPath';
      if (tag === 'image') return 'image';
      if (tag === 'text' || tag === 'textpath' || tag === 'tspan') return 'text';
      return 'parse';
    }

    if (tag !== 'svg' && tag !== 'g' && tag !== 'defs') {
      if (hasMeaningfulStroke(el)) return 'stroke';
      if (hasEvenodd(el)) return 'evenodd';
    }

    if (SHAPE_TAGS.has(tag)) {
      // fill=none 이고 stroke만 있는 도형은 stroke 검사에서 이미 걸러짐
      const fill = (getAttr(el, 'fill') ?? '').trim().toLowerCase();
      if (fill !== 'none') shapeCount += 1;
    }

    for (const child of Array.from(el.children)) {
      const reason = walk(child);
      if (reason) return reason;
    }
    return null;
  };

  const reason = walk(root);
  if (reason) return reason;
  if (shapeCount === 0) return 'noShape';
  return null;
}

function parseViewBox(root: Element): { x: number; y: number; w: number; h: number } {
  const vb = getAttr(root, 'viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { x: parts[0], y: parts[1], w: parts[2] || 1, h: parts[3] || 1 };
    }
  }
  const w = Number(getAttr(root, 'width')) || 24;
  const h = Number(getAttr(root, 'height')) || 24;
  return { x: 0, y: 0, w, h };
}

function polygonToPath(points: string, close: boolean): string {
  const nums = points
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (nums.length < 4) return '';
  let d = `M ${nums[0]} ${nums[1]}`;
  for (let i = 2; i + 1 < nums.length; i += 2) {
    d += ` L ${nums[i]} ${nums[i + 1]}`;
  }
  if (close) d += ' Z';
  return d;
}

function shapeToPathData(el: Element): string | null {
  const tag = el.tagName.toLowerCase().replace(/^.*:/, '');
  if (tag === 'path') {
    return getAttr(el, 'd')?.trim() || null;
  }
  if (tag === 'rect') {
    const x = Number(getAttr(el, 'x') ?? 0);
    const y = Number(getAttr(el, 'y') ?? 0);
    const w = Number(getAttr(el, 'width') ?? 0);
    const h = Number(getAttr(el, 'height') ?? 0);
    if (!(w > 0 && h > 0)) return null;
    const rx = Number(getAttr(el, 'rx') ?? 0);
    const ry = Number(getAttr(el, 'ry') ?? rx);
    if (rx > 0 || ry > 0) {
      // 둥근 사각형은 근사 path
      const rxx = Math.min(rx, w / 2);
      const ryy = Math.min(ry || rx, h / 2);
      return `M ${x + rxx} ${y} H ${x + w - rxx} A ${rxx} ${ryy} 0 0 1 ${x + w} ${y + ryy} V ${y + h - ryy} A ${rxx} ${ryy} 0 0 1 ${x + w - rxx} ${y + h} H ${x + rxx} A ${rxx} ${ryy} 0 0 1 ${x} ${y + h - ryy} V ${y + ryy} A ${rxx} ${ryy} 0 0 1 ${x + rxx} ${y} Z`;
    }
    return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  }
  if (tag === 'circle') {
    const cx = Number(getAttr(el, 'cx') ?? 0);
    const cy = Number(getAttr(el, 'cy') ?? 0);
    const r = Number(getAttr(el, 'r') ?? 0);
    if (!(r > 0)) return null;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }
  if (tag === 'ellipse') {
    const cx = Number(getAttr(el, 'cx') ?? 0);
    const cy = Number(getAttr(el, 'cy') ?? 0);
    const rx = Number(getAttr(el, 'rx') ?? 0);
    const ry = Number(getAttr(el, 'ry') ?? 0);
    if (!(rx > 0 && ry > 0)) return null;
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  }
  if (tag === 'polygon') {
    const pts = getAttr(el, 'points');
    return pts ? polygonToPath(pts, true) : null;
  }
  if (tag === 'polyline') {
    const pts = getAttr(el, 'points');
    return pts ? polygonToPath(pts, false) : null;
  }
  return null;
}

function collectAncestorTransforms(el: Element, root: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== root) {
    const tr = getAttr(cur, 'transform');
    if (tr) parts.unshift(tr);
    cur = cur.parentElement;
  }
  const rootTr = getAttr(root, 'transform');
  if (rootTr) parts.unshift(rootTr);
  return parts.join(' ');
}

/**
 * SVG → 평탄화된 path d 목록 (뷰박스 좌표)
 */
export function extractFlatPathDataList(svg: string): string[] {
  const parsed = parseSvgRoot(svg);
  if (!parsed) return [];
  const { root } = parsed;
  const paths: string[] = [];

  const visit = (el: Element) => {
    const tag = el.tagName.toLowerCase().replace(/^.*:/, '');
    if (SHAPE_TAGS.has(tag)) {
      const fill = (getAttr(el, 'fill') ?? '').trim().toLowerCase();
      if (fill === 'none') {
        // skip
      } else {
        const d = shapeToPathData(el);
        if (d) {
          const transform = collectAncestorTransforms(el, root);
          let flat = SvgPath(d).abs().unshort().unarc();
          if (transform) flat = flat.transform(transform);
          paths.push(flat.toString());
        }
      }
    }
    for (const child of Array.from(el.children)) visit(child);
  };

  visit(root);
  return paths;
}

function pathDataToOpenTypePath(
  d: string,
  vb: { x: number; y: number; w: number; h: number },
  unitsPerEm: number
): Path {
  const path = new Path();
  const sx = unitsPerEm / vb.w;
  const sy = unitsPerEm / vb.h;
  const mapX = (x: number) => (x - vb.x) * sx;
  const mapY = (y: number) => (vb.h - (y - vb.y)) * sy; // Y 반전

  const segments: Array<[string, ...number[]]> = [];
  SvgPath(d)
    .abs()
    .unshort()
    .unarc()
    .iterate((segment) => {
      segments.push(segment as [string, ...number[]]);
    });

  let cx = 0;
  let cy = 0;

  for (const seg of segments) {
    const cmd = seg[0];
    const args = seg.slice(1) as number[];
    switch (cmd) {
      case 'M':
        cx = args[0];
        cy = args[1];
        path.moveTo(mapX(cx), mapY(cy));
        break;
      case 'L':
        cx = args[0];
        cy = args[1];
        path.lineTo(mapX(cx), mapY(cy));
        break;
      case 'H':
        cx = args[0];
        path.lineTo(mapX(cx), mapY(cy));
        break;
      case 'V':
        cy = args[0];
        path.lineTo(mapX(cx), mapY(cy));
        break;
      case 'C':
        path.curveTo(
          mapX(args[0]),
          mapY(args[1]),
          mapX(args[2]),
          mapY(args[3]),
          mapX(args[4]),
          mapY(args[5])
        );
        cx = args[4];
        cy = args[5];
        break;
      case 'Q':
        path.quadraticCurveTo(mapX(args[0]), mapY(args[1]), mapX(args[2]), mapY(args[3]));
        cx = args[2];
        cy = args[3];
        break;
      case 'Z':
      case 'z':
        path.closePath();
        break;
      default:
        break;
    }
  }

  return path;
}

function mergePaths(paths: Path[]): Path {
  const merged = new Path();
  for (const p of paths) {
    merged.extend(p);
  }
  return merged;
}

function sanitizeGlyphName(name: string, index: number): string {
  const base = name
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
  return base || `icon_${index + 1}`;
}

/**
 * 호환 아이콘들로 TTF + CSS/HTML 프리뷰 생성
 */
export function buildIconFont(
  items: FontGlyphInput[],
  options?: { fontFamily?: string; unitsPerEm?: number }
): FontExportResult {
  const fontFamily = options?.fontFamily?.trim() || 'IconFinderIcons';
  const unitsPerEm = options?.unitsPerEm ?? FONT_UNITS_PER_EM;

  const converted: FontGlyphMapping[] = [];
  const skipped: FontExportSkipped[] = [];
  const glyphPaths: Array<{ name: string; unicode: number; path: Path }> = [];

  items.forEach((item, index) => {
    const reason = getFontIncompatibilityReason(item.svg);
    if (reason) {
      skipped.push({ name: item.name, reason });
      return;
    }

    try {
      const parsed = parseSvgRoot(item.svg);
      if (!parsed) {
        skipped.push({ name: item.name, reason: 'parse' });
        return;
      }
      const vb = parseViewBox(parsed.root);
      const dList = extractFlatPathDataList(item.svg);
      if (dList.length === 0) {
        skipped.push({ name: item.name, reason: 'noShape' });
        return;
      }
      const otPaths = dList.map((d) => pathDataToOpenTypePath(d, vb, unitsPerEm));
      const path = mergePaths(otPaths);
      const codepoint = FONT_PUA_START + converted.length;
      const glyphName = sanitizeGlyphName(item.name, index);
      glyphPaths.push({ name: glyphName, unicode: codepoint, path });
      const mapping: FontGlyphMapping = {
        name: item.name,
        codepoint,
        char: String.fromCodePoint(codepoint),
      };
      converted.push(mapping);
    } catch {
      skipped.push({ name: item.name, reason: 'convert' });
    }
  });

  const notdef = new Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: unitsPerEm,
    path: new Path(),
  });
  const space = new Glyph({
    name: 'space',
    unicode: 32,
    advanceWidth: unitsPerEm / 2,
    path: new Path(),
  });

  const glyphs: Glyph[] = [
    notdef,
    space,
    ...glyphPaths.map(
      (g) =>
        new Glyph({
          name: g.name,
          unicode: g.unicode,
          advanceWidth: unitsPerEm,
          path: g.path,
        })
    ),
  ];

  const font = new Font({
    familyName: fontFamily,
    styleName: 'Regular',
    unitsPerEm,
    ascender: unitsPerEm,
    descender: 0,
    glyphs,
  });

  const ttfBytes = font.toArrayBuffer();
  const css = buildFontFaceCss(fontFamily, converted);
  const htmlPreview = buildHtmlPreview(fontFamily, converted);

  return {
    fontFamily,
    ttfBytes,
    css,
    htmlPreview,
    mapping: converted,
    converted,
    skipped,
  };
}

function buildFontFaceCss(fontFamily: string, mapping: FontGlyphMapping[]): string {
  const rows = mapping
    .map(
      (m) =>
        `/* ${m.name} */ .icon-${sanitizeGlyphName(m.name, 0)}:before { content: "\\${m.codepoint.toString(16)}"; }`
    )
    .join('\n');

  return `@font-face {
  font-family: "${fontFamily}";
  src: url("${fontFamily}.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.icon {
  font-family: "${fontFamily}";
  font-style: normal;
  font-weight: normal;
  line-height: 1;
  speak: never;
  -webkit-font-smoothing: antialiased;
}

${rows}
`;
}

function buildHtmlPreview(fontFamily: string, mapping: FontGlyphMapping[]): string {
  const cells = mapping
    .map(
      (m) =>
        `<div class="cell"><span class="glyph">${m.char}</span><code>${m.name}</code><small>U+${m.codepoint.toString(16).toUpperCase()}</small></div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${fontFamily} preview</title>
  <style>
    @font-face {
      font-family: "${fontFamily}";
      src: url("${fontFamily}.ttf") format("truetype");
    }
    body { font-family: system-ui, sans-serif; margin: 24px; color: #0f172a; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
    .cell { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .glyph { font-family: "${fontFamily}"; font-size: 40px; display: block; line-height: 1.2; }
    code { font-size: 11px; word-break: break-all; }
    small { display: block; color: #64748b; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>${fontFamily}</h1>
  <p>${mapping.length} glyphs · Private Use Area</p>
  <div class="grid">
${cells}
  </div>
</body>
</html>
`;
}
