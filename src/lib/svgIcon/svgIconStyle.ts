import type { TranslationKey } from '@/i18n';
import {
  SvgIconBevelMode,
  SvgIconColorMode,
  SvgIconEffects,
  SvgIconFinishMode,
  SvgIconGlowEffect,
  SvgIconStylePreset,
  SvgIconViewBox,
} from '../../types/svgIcon';

export interface SvgIconStyleOptions {
  colorMode: SvgIconColorMode;
  finishMode: SvgIconFinishMode;
  primaryColor: string;
  accentColor: string;
  outlineColor: string;
  outlineWidth: number;
  outlineEnabled?: boolean;
  stylePreset: SvgIconStylePreset;
  viewBox: SvgIconViewBox;
  effects?: SvgIconEffects;
}

// 효과 기본값(모두 비활성)
export const DEFAULT_SVG_ICON_EFFECTS: SvgIconEffects = {
  dropShadow: { enabled: false, color: '#0f172a', intensity: 50 },
  outerGlow: { enabled: false, color: '#38bdf8', intensity: 50 },
  innerGlow: { enabled: false, color: '#ffffff', intensity: 50 },
  bevel: { mode: 'none', intensity: 50 },
};

// 구버전/누락 스냅샷을 안전한 형태로 보정 (필드 타입 검사 후 기본값 병합)
export function normalizeSvgIconEffects(raw: unknown): SvgIconEffects {
  const d = DEFAULT_SVG_ICON_EFFECTS;
  const r = (raw && typeof raw === 'object') ? (raw as any) : {};
  const glow = (v: any, dd: SvgIconGlowEffect): SvgIconGlowEffect => ({
    enabled: typeof v?.enabled === 'boolean' ? v.enabled : dd.enabled,
    color: typeof v?.color === 'string' ? v.color : dd.color,
    intensity: typeof v?.intensity === 'number' ? Math.max(0, Math.min(100, v.intensity)) : dd.intensity,
  });
  const mode = (v: any): SvgIconBevelMode => (v === 'raised' || v === 'engraved' || v === 'none') ? v : 'none';
  return {
    dropShadow: glow(r.dropShadow, d.dropShadow),
    outerGlow: glow(r.outerGlow, d.outerGlow),
    innerGlow: glow(r.innerGlow, d.innerGlow),
    bevel: {
      mode: mode(r.bevel?.mode),
      intensity: typeof r.bevel?.intensity === 'number' ? Math.max(0, Math.min(100, r.bevel.intensity)) : d.bevel.intensity,
    },
  };
}

// 활성화된 효과가 하나라도 있는지 판별
function hasAnyEffect(e: SvgIconEffects): boolean {
  return e.dropShadow.enabled || e.outerGlow.enabled || e.innerGlow.enabled || e.bevel.mode !== 'none';
}

// 내장 컬러 프리셋. 표시 이름은 labelKey로 번역한다(id는 저장/식별용이므로 고정).
export interface SvgIconColorPresetInfo {
  id: string;
  labelKey: TranslationKey;
  primary: string;
  accent: string;
}

export const SVG_ICON_COLOR_PRESETS: SvgIconColorPresetInfo[] = [
  { id: 'emerald', labelKey: 'color.emerald', primary: '#10b981', accent: '#fbbf24' },
  { id: 'crimson', labelKey: 'color.crimson', primary: '#ef4444', accent: '#f97316' },
  { id: 'arcane', labelKey: 'color.arcane', primary: '#8b5cf6', accent: '#38bdf8' },
  { id: 'gold', labelKey: 'color.gold', primary: '#f59e0b', accent: '#fde68a' },
  { id: 'slate', labelKey: 'color.slate', primary: '#334155', accent: '#94a3b8' },
  { id: 'ocean', labelKey: 'color.ocean', primary: '#0ea5e9', accent: '#67e8f9' },
  { id: 'violet', labelKey: 'color.violet', primary: '#7c3aed', accent: '#f0abfc' },
  { id: 'poison', labelKey: 'color.poison', primary: '#65a30d', accent: '#bef264' },
  { id: 'ice', labelKey: 'color.ice', primary: '#38bdf8', accent: '#e0f2fe' },
  { id: 'shadow', labelKey: 'color.shadow', primary: '#111827', accent: '#a78bfa' },
];

const GRAPHIC_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line']);
const SVG_NS = 'http://www.w3.org/2000/svg';

function parseSvg(svg: string): SVGElement | null {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return null;
  const root = doc.documentElement;
  return root?.tagName.toLowerCase() === 'svg' ? (root as unknown as SVGElement) : null;
}

function shouldReplacePaint(value: string | null): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized !== 'none' && !normalized.startsWith('url(');
}

function parseViewBox(viewBox: string | null): [number, number, number, number] | null {
  if (!viewBox) return null;
  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map((value) => Number(value));
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;
  return values as [number, number, number, number];
}

function parseFiniteNumber(value: string | null): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeViewBox(root: SVGElement, targetViewBox: SvgIconViewBox, padding = 0): void {
  const source = parseViewBox(root.getAttribute('viewBox'));
  const target = parseViewBox(targetViewBox);
  if (!source || !target) {
    root.setAttribute('viewBox', targetViewBox);
    return;
  }

  const [sourceX, sourceY, sourceWidth, sourceHeight] = source;
  const [targetX, targetY, targetWidth, targetHeight] = target;
  const normalizedBefore = root.getAttribute('data-svg-icon-normalized') === 'true';
  const existingPadding = parseFiniteNumber(root.getAttribute('data-svg-icon-normalize-padding'));
  const safePadding = Math.min(Math.max(padding, 0), Math.min(targetWidth, targetHeight) * 0.34);
  const sameViewBox =
    sourceX === targetX &&
    sourceY === targetY &&
    sourceWidth === targetWidth &&
    sourceHeight === targetHeight;

  if (
    !normalizedBefore &&
    padding <= 0 &&
    sameViewBox
  ) {
    root.setAttribute('viewBox', targetViewBox);
    return;
  }

  if (
    normalizedBefore &&
    sameViewBox &&
    existingPadding !== null &&
    Math.abs(existingPadding - safePadding) < 0.001
  ) {
    root.setAttribute('viewBox', targetViewBox);
    return;
  }

  const availableWidth = Math.max(1, targetWidth - safePadding * 2);
  const availableHeight = Math.max(1, targetHeight - safePadding * 2);
  const doc = root.ownerDocument;
  const group = doc.createElementNS(SVG_NS, 'g');
  const previousScale = parseFiniteNumber(root.getAttribute('data-svg-icon-normalize-scale')) ?? 1;
  let nextScale = previousScale;
  let translateX: number;
  let translateY: number;
  let scale: number;

  if (normalizedBefore && sameViewBox && existingPadding !== null) {
    const previousWidth = Math.max(1, targetWidth - existingPadding * 2);
    const previousHeight = Math.max(1, targetHeight - existingPadding * 2);
    scale = Math.min(availableWidth / previousWidth, availableHeight / previousHeight);
    translateX =
      targetX + safePadding + (availableWidth - previousWidth * scale) / 2 - (targetX + existingPadding) * scale;
    translateY =
      targetY + safePadding + (availableHeight - previousHeight * scale) / 2 - (targetY + existingPadding) * scale;
    nextScale = previousScale * scale;
  } else {
    scale = Math.min(availableWidth / sourceWidth, availableHeight / sourceHeight);
    translateX = targetX + safePadding + (availableWidth - sourceWidth * scale) / 2 - sourceX * scale;
    translateY = targetY + safePadding + (availableHeight - sourceHeight * scale) / 2 - sourceY * scale;
    nextScale = normalizedBefore ? previousScale * scale : scale;
  }

  group.setAttribute('transform', `translate(${translateX.toFixed(3)} ${translateY.toFixed(3)}) scale(${scale.toFixed(3)})`);
  // 재적용 시 baseline 복원을 위해 정규화 그룹을 표시하고 정규화 직전의 viewBox를 그룹에 보관한다.
  // (root 속성은 innerHTML/clone 라운드트립으로 유실될 수 있으나 그룹 속성은 살아남는다.)
  group.setAttribute('data-svg-icon-transform', 'true');
  group.setAttribute('data-svg-icon-base-viewbox', root.getAttribute('viewBox') ?? targetViewBox);

  for (const node of Array.from(root.childNodes)) {
    if (node instanceof Element && node.tagName.toLowerCase() === 'defs') continue;
    group.appendChild(node);
  }
  root.appendChild(group);
  root.setAttribute('viewBox', targetViewBox);
  root.setAttribute('data-svg-icon-normalized', 'true');
  root.setAttribute('data-svg-icon-normalize-scale', nextScale.toFixed(6));
  root.setAttribute('data-svg-icon-normalize-padding', String(safePadding));
}

function isDefs(element: Element): boolean {
  return element.tagName.toLowerCase() === 'defs';
}

function removeDuplicateIds(element: Element): void {
  element.removeAttribute('id');
  for (const child of Array.from(element.querySelectorAll('[id]'))) {
    child.removeAttribute('id');
  }
}

function ensureDefs(root: SVGElement): SVGDefsElement {
  const existing = Array.from(root.children).find(isDefs);
  if (existing) return existing as unknown as SVGDefsElement;
  const defs = root.ownerDocument.createElementNS(SVG_NS, 'defs') as SVGDefsElement;
  root.insertBefore(defs, root.firstChild);
  return defs;
}

function wrapRenderableChildren(root: SVGElement): SVGGElement {
  const existing = root.querySelector(':scope > g[data-svg-icon-content="true"]');
  if (existing) return existing as unknown as SVGGElement;

  const group = root.ownerDocument.createElementNS(SVG_NS, 'g') as SVGGElement;
  group.setAttribute('data-svg-icon-content', 'true');

  for (const node of Array.from(root.childNodes)) {
    if (node instanceof Element && isDefs(node)) continue;
    if (node === group) continue;
    group.appendChild(node);
  }
  root.appendChild(group);
  return group;
}

// 렌더 레이어 전체(아웃라인+콘텐츠+하이라이트)를 감싸는 효과 래퍼 그룹.
// 효과 필터를 이 래퍼에 적용하면 아웃라인까지 그림자 실루엣에 포함된다.
function wrapEffectLayers(root: SVGElement): SVGGElement {
  const existing = root.querySelector(':scope > g[data-svg-icon-effects-wrap="true"]');
  if (existing) return existing as unknown as SVGGElement;
  const group = root.ownerDocument.createElementNS(SVG_NS, 'g') as SVGGElement;
  group.setAttribute('data-svg-icon-effects-wrap', 'true');
  for (const node of Array.from(root.childNodes)) {
    if (node instanceof Element && node.tagName.toLowerCase() === 'defs') continue;
    if (node === group) continue;
    group.appendChild(node);
  }
  root.appendChild(group);
  return group;
}

function createGradient(root: SVGElement, primaryColor: string, accentColor: string): string {
  const defs = ensureDefs(root);
  const gradientId = `svg-icon-gradient-${Math.random().toString(36).slice(2, 9)}`;
  const gradient = root.ownerDocument.createElementNS(SVG_NS, 'linearGradient');
  gradient.setAttribute('id', gradientId);
  gradient.setAttribute('x1', '18%');
  gradient.setAttribute('y1', '8%');
  gradient.setAttribute('x2', '82%');
  gradient.setAttribute('y2', '92%');

  // 프리셋 2색(보조 → 메인)만 사용. 이전의 하드코딩 어두운 정지점(#111827)을 제거.
  const stops = [
    ['0%', accentColor],
    ['100%', primaryColor],
  ];
  for (const [offset, color] of stops) {
    const stop = root.ownerDocument.createElementNS(SVG_NS, 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', color);
    gradient.appendChild(stop);
  }
  defs.appendChild(gradient);
  return `url(#${gradientId})`;
}

function createShadowFilter(root: SVGElement): string {
  const defs = ensureDefs(root);
  const filterId = `svg-icon-shadow-${Math.random().toString(36).slice(2, 9)}`;
  const filter = root.ownerDocument.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', filterId);
  filter.setAttribute('x', '-20%');
  filter.setAttribute('y', '-20%');
  filter.setAttribute('width', '140%');
  filter.setAttribute('height', '140%');

  const dropShadow = root.ownerDocument.createElementNS(SVG_NS, 'feDropShadow');
  dropShadow.setAttribute('dx', '0');
  dropShadow.setAttribute('dy', '2');
  dropShadow.setAttribute('stdDeviation', '1.3');
  dropShadow.setAttribute('flood-color', '#0f172a');
  dropShadow.setAttribute('flood-opacity', '0.28');
  filter.appendChild(dropShadow);
  defs.appendChild(filter);
  return `url(#${filterId})`;
}

// 콘텐츠 전용 효과 필터(베벨 + 내부 발광). 콘텐츠 그룹에만 적용해 아웃라인의 영향을 받지 않는다.
function createContentFilter(root: SVGElement, effects: SvgIconEffects, viewBox: SvgIconViewBox): string {
  const defs = ensureDefs(root);
  const doc = root.ownerDocument;
  const id = `svg-icon-effects-${Math.random().toString(36).slice(2, 9)}`;
  const filter = doc.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  // 베벨/내부 발광은 알파 내부에 머무르므로 영역 여유는 작게
  filter.setAttribute('x', '-20%');
  filter.setAttribute('y', '-20%');
  filter.setAttribute('width', '140%');
  filter.setAttribute('height', '140%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  const parsed = parseViewBox(viewBox);
  const u = parsed ? parsed[2] / 64 : 1;
  const add = (
    tag: string,
    attrs: Record<string, string>,
    children?: Array<{ tag: string; attrs: Record<string, string> }>
  ) => {
    const el = doc.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (children) {
      for (const c of children) {
        const ce = doc.createElementNS(SVG_NS, c.tag);
        for (const [k, v] of Object.entries(c.attrs)) ce.setAttribute(k, v);
        el.appendChild(ce);
      }
    }
    filter.appendChild(el);
  };
  const norm = (intensity: number) => Math.max(0, Math.min(1, intensity / 100));

  let graphicRef = 'SourceGraphic';

  // Bevel (양각/음각)
  if (effects.bevel.mode !== 'none') {
    const bvI = norm(effects.bevel.intensity);
    const engraved = effects.bevel.mode === 'engraved';
    const azimuth = engraved ? '55' : '235';
    const elevation = engraved ? '38' : '55';
    add('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: (1.2 * u).toFixed(2), result: 'fxBevelBlur' });
    add('feSpecularLighting', {
      in: 'fxBevelBlur',
      surfaceScale: ((1 + bvI * 4) * u).toFixed(2),
      specularConstant: (0.5 + bvI * 1.2).toFixed(2),
      specularExponent: '16',
      'lighting-color': '#ffffff',
      result: 'fxBevelLight',
    }, [{ tag: 'feDistantLight', attrs: { azimuth, elevation } }]);
    add('feComposite', { in: 'fxBevelLight', in2: 'SourceAlpha', operator: 'in', result: 'fxBevelClip' });
    add('feComposite', { in: graphicRef, in2: 'fxBevelClip', operator: 'arithmetic', k1: '0', k2: '1', k3: '1', k4: '0', result: 'fxBeveled' });
    graphicRef = 'fxBeveled';
  }

  // Inner Glow (콘텐츠 알파 기준 — 아웃라인 영향 없음)
  if (effects.innerGlow.enabled) {
    const igI = norm(effects.innerGlow.intensity);
    add('feFlood', { 'flood-color': effects.innerGlow.color, 'flood-opacity': '1', result: 'fxIgColor' });
    add('feComposite', { in: 'fxIgColor', in2: 'SourceAlpha', operator: 'out', result: 'fxIgOut' });
    add('feGaussianBlur', { in: 'fxIgOut', stdDeviation: ((0.6 + igI * 3) * u).toFixed(2), result: 'fxIgBlur' });
    add('feComposite', { in: 'fxIgBlur', in2: 'SourceAlpha', operator: 'in', result: 'fxIgClip' });
    add('feComponentTransfer', { in: 'fxIgClip', result: 'fxInnerGlow' }, [
      { tag: 'feFuncA', attrs: { type: 'linear', slope: (1 + igI * 3).toFixed(2), intercept: '0' } },
    ]);
    // 마지막 프리미티브(feMerge)의 출력이 필터 결과가 된다.
    add('feMerge', { result: 'fxWithInner' }, [
      { tag: 'feMergeNode', attrs: { in: graphicRef } },
      { tag: 'feMergeNode', attrs: { in: 'fxInnerGlow' } },
    ]);
  }

  defs.appendChild(filter);
  return `url(#${id})`;
}

// 그림자/글로우(halo) 효과 체인을 단일 <filter>로 생성한다(베벨 제외, 아웃라인 포함 래퍼에 적용).
function createEffectsFilter(root: SVGElement, effects: SvgIconEffects, viewBox: SvgIconViewBox): string {
  const defs = ensureDefs(root);
  const doc = root.ownerDocument;
  const id = `svg-icon-effects-${Math.random().toString(36).slice(2, 9)}`;
  const filter = doc.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  // glow/shadow가 번질 여유 영역
  filter.setAttribute('x', '-60%');
  filter.setAttribute('y', '-60%');
  filter.setAttribute('width', '220%');
  filter.setAttribute('height', '220%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  const parsed = parseViewBox(viewBox);
  const u = parsed ? parsed[2] / 64 : 1; // 64 기준 단위 스케일

  const add = (
    tag: string,
    attrs: Record<string, string>,
    children?: Array<{ tag: string; attrs: Record<string, string> }>
  ) => {
    const el = doc.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (children) {
      for (const c of children) {
        const ce = doc.createElementNS(SVG_NS, c.tag);
        for (const [k, v] of Object.entries(c.attrs)) ce.setAttribute(k, v);
        el.appendChild(ce);
      }
    }
    filter.appendChild(el);
  };

  // 강도 정규화 헬퍼(0~1 clamp)
  const norm = (intensity: number) => Math.max(0, Math.min(1, intensity / 100));

  // 베벨·내부 발광은 콘텐츠 전용 필터로 분리(아웃라인 미포함). 여기서는 그림자/외부 발광만 처리.
  const graphicRef = 'SourceGraphic';

  // 뒤쪽 레이어 (drop shadow 최하단 → outer glow → 그래픽)
  const behind: string[] = [];

  // 1) Drop Shadow
  if (effects.dropShadow.enabled) {
    const dsI = norm(effects.dropShadow.intensity);
    add('feFlood', { 'flood-color': effects.dropShadow.color, 'flood-opacity': (0.2 + dsI * 0.55).toFixed(2), result: 'fxDsColor' });
    add('feComposite', { in: 'fxDsColor', in2: 'SourceAlpha', operator: 'in', result: 'fxDsShape' });
    add('feGaussianBlur', { in: 'fxDsShape', stdDeviation: ((0.6 + dsI * 3) * u).toFixed(2), result: 'fxDsBlur' });
    add('feOffset', { in: 'fxDsBlur', dx: '0', dy: ((0.6 + dsI * 3) * u).toFixed(2), result: 'fxDropShadow' });
    behind.push('fxDropShadow');
  }

  // 4) Outer Glow
  if (effects.outerGlow.enabled) {
    const ogI = norm(effects.outerGlow.intensity);
    add('feFlood', { 'flood-color': effects.outerGlow.color, 'flood-opacity': '1', result: 'fxOgColor' });
    add('feComposite', { in: 'fxOgColor', in2: 'SourceAlpha', operator: 'in', result: 'fxOgShape' });
    add('feGaussianBlur', { in: 'fxOgShape', stdDeviation: ((1 + ogI * 4) * u).toFixed(2), result: 'fxOgBlur' });
    add('feComponentTransfer', { in: 'fxOgBlur', result: 'fxOuterGlow' }, [
      { tag: 'feFuncA', attrs: { type: 'linear', slope: (1.4 + ogI * 3).toFixed(2), intercept: '0' } },
    ]);
    behind.push('fxOuterGlow');
  }

  // 5) 최종 합성 (behind: dropShadow → outerGlow 순서)
  add('feMerge', {}, [
    ...behind.map((ref) => ({ tag: 'feMergeNode', attrs: { in: ref } })),
    { tag: 'feMergeNode', attrs: { in: graphicRef } },
  ]);

  defs.appendChild(filter);
  return `url(#${id})`;
}

function unwrapElement(element: Element): void {
  const parent = element.parentNode;
  if (!parent) return;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

// 이전에 적용된 StyleStudio 구조(효과 레이어 · content/normalize 래퍼)를 모두 제거해
// 원본 geometry/viewBox 기준으로 되돌린다. 이미 스타일이 입혀진 SVG에 재적용해도
// 정규화 그룹이 중첩되지 않도록(멱등) 보장한다.
function resetGeneratedStructure(root: SVGElement): void {
  // 1) 생성된 효과 레이어 제거
  for (const element of Array.from(root.querySelectorAll('[data-svg-icon-outline], [data-svg-icon-highlight]'))) {
    element.remove();
  }
  // 2) 생성된 defs(그라데이션 · 그림자) 및 그것을 참조하던 paint/filter 흔적 제거
  for (const element of Array.from(root.querySelectorAll('[id^="svg-icon-gradient-"], [id^="svg-icon-shadow-"], [id^="svg-icon-effects-"]'))) {
    element.remove();
  }
  for (const element of Array.from(root.querySelectorAll('*'))) {
    for (const attr of ['fill', 'stroke', 'filter']) {
      const value = element.getAttribute(attr);
      if (value && /url\(#svg-icon-(gradient|shadow|effects)-/.test(value)) {
        element.removeAttribute(attr);
      }
    }
  }

  // 3) 정규화 직전 viewBox 복원값을 수집한다. 문서 순서상 가장 깊은(마지막) 그룹이 최초 원본 viewBox.
  let baseViewBox: string | null = null;
  for (const group of Array.from(root.querySelectorAll('g[data-svg-icon-base-viewbox]'))) {
    const stored = group.getAttribute('data-svg-icon-base-viewbox');
    if (stored) baseViewBox = stored;
  }
  // 레거시 보정용으로 속성 제거 전에 기존 padding을 읽어 둔다.
  const existingPaddingForReset = parseFiniteNumber(root.getAttribute('data-svg-icon-normalize-padding'));

  // 4) StyleStudio가 만든 래퍼 그룹(content · normalize)을 안쪽까지 모두 펼쳐 제거한다.
  let unwrapped = true;
  while (unwrapped) {
    unwrapped = false;
    for (const group of Array.from(
      root.querySelectorAll(
        'g[data-svg-icon-content="true"], g[data-svg-icon-transform="true"], g[data-svg-icon-effects-wrap="true"]'
      )
    )) {
      unwrapElement(group);
      unwrapped = true;
    }
  }

  // 5) 레거시(표시 없는) 정규화 그룹 보정: 예전 코드가 만든 정규화 그룹은 마크가 없어 4)에서 펼치지 못한다.
  //    이때 transform(scale·translate)과 저장된 padding으로 정규화 직전의 원본 viewBox를 역산해 복원한 뒤 펼친다.
  //    (좌표계 복원 없이 펼치면 콘텐츠가 잘리므로, 역산 가능한 경우에만 수행한다.)
  if (
    !baseViewBox &&
    root.getAttribute('data-svg-icon-normalized') === 'true' &&
    existingPaddingForReset !== null
  ) {
    const target = parseViewBox(root.getAttribute('viewBox'));
    const children = Array.from(root.children).filter((child) => !isDefs(child));
    const only = children.length === 1 ? children[0] : null;
    const transform = only && only.tagName.toLowerCase() === 'g' ? only.getAttribute('transform') : null;
    const scale = inferScaleFromTransform(transform);
    const translate = transform?.match(/translate\(\s*([+-]?[\d.]+)[\s,]+([+-]?[\d.]+)/i);
    if (target && only && scale && translate) {
      const [tx, ty, tw, th] = target;
      const p = existingPaddingForReset;
      const dx = Number(translate[1]);
      const dy = Number(translate[2]);
      const sourceWidth = (tw - p * 2) / scale;
      const sourceHeight = (th - p * 2) / scale;
      const sourceX = (tx + p - dx) / scale;
      const sourceY = (ty + p - dy) / scale;
      if ([sourceWidth, sourceHeight, sourceX, sourceY].every((value) => Number.isFinite(value)) && sourceWidth > 0) {
        baseViewBox = [sourceX, sourceY, sourceWidth, sourceHeight]
          .map((value) => (Number.isInteger(value) ? String(value) : value.toFixed(3)))
          .join(' ');
        unwrapElement(only);
      }
    }
  }

  // 6) 원본 viewBox 복원 및 root에 남은 생성 속성 제거
  if (baseViewBox) root.setAttribute('viewBox', baseViewBox);
  for (const attr of [
    'data-svg-icon-normalized',
    'data-svg-icon-normalize-scale',
    'data-svg-icon-normalize-padding',
    'data-svg-icon-outline-width',
    'data-svg-icon-base-viewbox',
    'shape-rendering',
    'overflow',
    'width',
    'height',
  ]) {
    root.removeAttribute(attr);
  }
  if (root.getAttribute('style') === 'overflow:visible') root.removeAttribute('style');
}

function getNormalizationScale(root: SVGElement): number {
  const scale = Number(root.getAttribute('data-svg-icon-normalize-scale'));
  if (Number.isFinite(scale) && scale > 0) return scale;
  if (root.getAttribute('data-svg-icon-normalized') !== 'true') return 1;

  for (const child of Array.from(root.children)) {
    if (child.tagName.toLowerCase() !== 'g') continue;
    if (child.getAttribute('data-svg-icon-content') !== 'true') continue;
    if (child.hasAttribute('data-svg-icon-outline') || child.hasAttribute('data-svg-icon-highlight')) continue;

    const nestedGroup = Array.from(child.children).find(
      (element) => element.tagName.toLowerCase() === 'g' && element.hasAttribute('transform')
    );
    const transform = nestedGroup?.getAttribute('transform') ?? child.getAttribute('transform');
    const inferredScale = inferScaleFromTransform(transform);
    if (inferredScale) {
      root.setAttribute('data-svg-icon-normalize-scale', inferredScale.toFixed(6));
      return inferredScale;
    }
  }

  return 1;
}

function inferScaleFromTransform(transform: string | null): number | null {
  if (!transform) return null;

  const scaleMatch = transform.match(/scale\(\s*([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/i);
  if (scaleMatch) {
    const scale = Math.abs(Number(scaleMatch[1]));
    return Number.isFinite(scale) && scale > 0 ? scale : null;
  }

  const matrixMatch = transform.match(/matrix\(\s*([^)]+)\)/i);
  if (!matrixMatch) return null;

  const values = matrixMatch[1].split(/[\s,]+/).map((value) => Number(value));
  if (values.length < 4 || values.some((value) => !Number.isFinite(value))) return null;

  const scaleX = Math.hypot(values[0], values[1]);
  const scaleY = Math.hypot(values[2], values[3]);
  const scale = Math.min(scaleX, scaleY);
  return Number.isFinite(scale) && scale > 0 ? scale : null;
}

function getStrokeWidthForTargetUnits(root: SVGElement, width: number): string {
  return (width / getNormalizationScale(root)).toFixed(3);
}

function getOutlineStrokeWidthForTargetUnits(root: SVGElement, width: number): string {
  return ((width * 2) / getNormalizationScale(root)).toFixed(3);
}

function addOutlineLayer(root: SVGElement, contentGroup: SVGGElement, color: string, width: number): void {
  const outlineGroup = contentGroup.cloneNode(true) as SVGGElement;
  removeDuplicateIds(outlineGroup);
  outlineGroup.removeAttribute('filter');
  outlineGroup.setAttribute('data-svg-icon-outline', 'true');
  outlineGroup.setAttribute('pointer-events', 'none');
  const outlineWidth = getOutlineStrokeWidthForTargetUnits(root, width);
  root.setAttribute('data-svg-icon-outline-width', String(width));

  for (const element of Array.from(outlineGroup.querySelectorAll('*'))) {
    const tagName = element.tagName.toLowerCase();
    if (!GRAPHIC_TAGS.has(tagName)) continue;
    element.setAttribute('fill', color);
    element.setAttribute('stroke', color);
    element.setAttribute('stroke-width', outlineWidth);
    element.setAttribute('stroke-linejoin', 'round');
    element.setAttribute('stroke-linecap', 'round');
    element.removeAttribute('vector-effect');
  }

  root.insertBefore(outlineGroup, contentGroup);
}

function addHighlightLayer(root: SVGElement, contentGroup: SVGGElement): void {
  const highlightGroup = contentGroup.cloneNode(true) as SVGGElement;
  removeDuplicateIds(highlightGroup);
  highlightGroup.removeAttribute('filter');
  highlightGroup.setAttribute('data-svg-icon-highlight', 'true');
  highlightGroup.setAttribute('pointer-events', 'none');
  highlightGroup.setAttribute('opacity', '0.18');
  highlightGroup.setAttribute('transform', 'translate(-1 -1)');

  for (const element of Array.from(highlightGroup.querySelectorAll('*'))) {
    const tagName = element.tagName.toLowerCase();
    if (!GRAPHIC_TAGS.has(tagName)) continue;
    element.setAttribute('fill', '#ffffff');
    element.setAttribute('stroke', '#ffffff');
  }
  root.insertBefore(highlightGroup, contentGroup.nextSibling);
}

function applyPaint(element: Element, attr: 'fill' | 'stroke', color: string): void {
  if (shouldReplacePaint(element.getAttribute(attr))) {
    element.setAttribute(attr, color);
  }
}

function applyAccentStroke(root: SVGElement, element: Element, color: string, width: number): void {
  element.setAttribute('stroke', color);
  element.setAttribute('stroke-width', getStrokeWidthForTargetUnits(root, width));
  element.setAttribute('stroke-linejoin', 'round');
  element.setAttribute('stroke-linecap', 'round');
  element.removeAttribute('vector-effect');
}

function applyGradientPaint(element: Element, tagName: string, gradientPaint: string): void {
  const fill = element.getAttribute('fill')?.trim().toLowerCase();
  const stroke = element.getAttribute('stroke')?.trim().toLowerCase();
  const isStrokeShape = tagName === 'line' || tagName === 'polyline';
  const hasVisibleFill = !isStrokeShape && fill !== 'none';
  const hasVisibleStroke = Boolean(stroke && stroke !== 'none');

  if (hasVisibleFill) {
    element.setAttribute('fill', gradientPaint);
  }
  if (hasVisibleStroke || isStrokeShape || fill === 'none') {
    element.setAttribute('stroke', gradientPaint);
  }
  if (!hasVisibleFill && !hasVisibleStroke && !isStrokeShape) {
    element.setAttribute('fill', gradientPaint);
  }
}

export function applySvgIconStyle(svg: string, options: SvgIconStyleOptions): string {
  const root = parseSvg(svg);
  if (!root) return svg;

  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  resetGeneratedStructure(root);
  const effects = normalizeSvgIconEffects(options.effects);
  const effectsActive = hasAnyEffect(effects);
  const shouldUseGradient = options.finishMode === 'gradient' || options.finishMode === 'raised';
  const shouldUseOutline = options.outlineEnabled === true || options.finishMode === 'outlined' || options.finishMode === 'raised';
  // viewBox 단위 스케일(64 기준)
  const vb = parseViewBox(options.viewBox);
  const u = vb ? vb[2] / 64 : 1;
  // 효과로 인한 번짐 여유. 바깥쪽으로 번지는 효과(그림자/외부발광/베벨)의 최대 강도 기반.
  const outerI = Math.max(
    effects.dropShadow.enabled ? effects.dropShadow.intensity / 100 : 0,
    effects.outerGlow.enabled ? effects.outerGlow.intensity / 100 : 0,
    effects.bevel.mode !== 'none' ? effects.bevel.intensity / 100 : 0,
  );
  const glowShadowPadding = (effects.dropShadow.enabled || effects.outerGlow.enabled || effects.bevel.mode !== 'none')
    ? (10 + 16 * outerI) * u
    : 0;
  const effectPadding = Math.max(
    shouldUseOutline ? Math.max(options.outlineWidth + 4, options.finishMode === 'raised' ? 12 : 0) : 0,
    glowShadowPadding
  );
  normalizeViewBox(root, options.viewBox, effectPadding);
  root.removeAttribute('width');
  root.removeAttribute('height');
  if (shouldUseOutline || options.finishMode === 'raised' || effectsActive) {
    root.setAttribute('overflow', 'visible');
    root.setAttribute('style', 'overflow:visible');
  } else {
    root.removeAttribute('overflow');
    if (root.getAttribute('style') === 'overflow:visible') root.removeAttribute('style');
  }
  const contentGroup = wrapRenderableChildren(root);
  const paintColor = shouldUseGradient ? createGradient(root, options.primaryColor, options.accentColor) : options.primaryColor;

  if (options.stylePreset === 'pixel-ish') {
    root.setAttribute('shape-rendering', 'crispEdges');
  } else {
    root.removeAttribute('shape-rendering');
  }

  const graphicElements = Array.from(contentGroup.querySelectorAll('*')).filter((element) =>
    GRAPHIC_TAGS.has(element.tagName.toLowerCase())
  );
  const hasSingleGraphicElement = graphicElements.length <= 1;

  for (const [index, element] of graphicElements.entries()) {
    const tagName = element.tagName.toLowerCase();

    if (shouldUseGradient) {
      applyGradientPaint(element, tagName, paintColor);
      continue;
    }

    if (options.colorMode === 'original') {
      if (element.getAttribute('fill') === 'currentColor') element.setAttribute('fill', options.primaryColor);
      if (element.getAttribute('stroke') === 'currentColor') element.setAttribute('stroke', options.primaryColor);
      if (element.getAttribute('stop-color') === 'currentColor') {
        element.setAttribute('stop-color', options.primaryColor);
      }
      continue;
    }

    const useAccentFill = options.colorMode === 'duotone' && !hasSingleGraphicElement && index % 3 === 1;
    const color = useAccentFill ? options.accentColor : paintColor;
    applyPaint(element, 'fill', color);
    applyPaint(element, 'stroke', options.primaryColor);
    if (options.colorMode === 'duotone' && hasSingleGraphicElement && tagName !== 'line') {
      applyAccentStroke(root, element, options.accentColor, Math.max(1.5, options.outlineWidth * 0.3));
    }
  }

  for (const element of Array.from(contentGroup.querySelectorAll('stop'))) {
    if (options.colorMode !== 'original') {
      element.setAttribute('stop-color', options.colorMode === 'duotone' ? options.accentColor : options.primaryColor);
    }
  }

  if (shouldUseOutline) {
    addOutlineLayer(root, contentGroup, options.outlineColor, options.outlineWidth);
  }
  // 베벨·내부 발광은 콘텐츠 전용(아웃라인 제외), 그림자·외부 발광은 아웃라인 포함 래퍼에 적용.
  const contentEffectsActive = effects.bevel.mode !== 'none' || effects.innerGlow.enabled;
  const haloActive = effects.dropShadow.enabled || effects.outerGlow.enabled;
  // raised의 기본 그림자는 효과 미사용 시에만 적용(효과 활성 시 effects 필터가 그림자를 담당).
  if (options.finishMode === 'raised') {
    if (!effectsActive) contentGroup.setAttribute('filter', createShadowFilter(root));
    addHighlightLayer(root, contentGroup);
  }
  // 콘텐츠 전용 효과(베벨 + 내부 발광): 아웃라인의 영향을 받지 않도록 콘텐츠 그룹에만 적용.
  if (contentEffectsActive) {
    contentGroup.setAttribute('filter', createContentFilter(root, effects, options.viewBox));
  }
  // 그림자/외부 발광: 아웃라인을 포함하도록 렌더 레이어 전체 래퍼에 적용.
  if (haloActive) {
    const wrapper = wrapEffectLayers(root);
    wrapper.setAttribute('filter', createEffectsFilter(root, effects, options.viewBox));
  }

  return new XMLSerializer().serializeToString(root);
}
