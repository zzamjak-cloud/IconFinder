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

// JSX 속성명 변환: 일반 규칙(kebab→camel)으로 안 되는 특례만 표로 관리
const JSX_ATTRIBUTE_OVERRIDES: Record<string, string> = {
  class: 'className',
  'xlink:href': 'xlinkHref',
  'xmlns:xlink': 'xmlnsXlink',
  'xml:space': 'xmlSpace',
  'xml:lang': 'xmlLang',
};

function toJsxAttributeName(name: string): string {
  const override = JSX_ATTRIBUTE_OVERRIDES[name];
  if (override) return override;
  // data-*/aria-*는 JSX에서 kebab-case 그대로 유효
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (name.includes('-')) return name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  return name;
}

// style="a:b; c:d" → {{ a: 'b', c: 'd' }}
function styleToJsxObject(style: string): string {
  const entries = style
    .split(';')
    .map((rule) => rule.trim())
    .filter(Boolean)
    .flatMap((rule) => {
      const index = rule.indexOf(':');
      if (index < 0) return [];
      const prop = rule.slice(0, index).trim().replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
      const value = rule.slice(index + 1).trim();
      return [`${prop}: '${value.replace(/'/g, "\\'")}'`];
    });
  return `{{ ${entries.join(', ')} }}`;
}

function toPascalComponentName(name: string): string {
  const pascal = safeFileName(name)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');
  if (!pascal) return 'SvgIcon';
  return /^[0-9]/.test(pascal) ? `Icon${pascal}` : pascal;
}

function elementToJsx(element: Element, indent: string, isRoot: boolean): string {
  const attrParts: string[] = [];
  for (const attr of Array.from(element.attributes)) {
    if (attr.name === 'style') {
      attrParts.push(`style=${styleToJsxObject(attr.value)}`);
      continue;
    }
    attrParts.push(`${toJsxAttributeName(attr.name)}="${attr.value.replace(/"/g, '&quot;')}"`);
  }
  if (isRoot) attrParts.push('{...props}');

  const tag = element.tagName;
  const open = `${indent}<${tag}${attrParts.length ? ' ' + attrParts.join(' ') : ''}`;
  const childJsx = Array.from(element.childNodes)
    .flatMap((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) return [elementToJsx(node as Element, indent + '  ', false)];
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? [`${indent}  ${text}`] : [];
      }
      return [];
    })
    .join('\n');

  if (!childJsx) return `${open} />`;
  return `${open}>\n${childJsx}\n${indent}</${tag}>`;
}

/**
 * React 컴포넌트 스니펫 (JSX 속성 변환 포함).
 * 파싱 실패 시 dangerouslySetInnerHTML 폴백.
 */
export function buildReactIconSnippet(icon: SvgGameIcon): string {
  const standalone = buildStandaloneSvg(icon);
  const componentName = toPascalComponentName(icon.name);
  try {
    const doc = new DOMParser().parseFromString(standalone, 'image/svg+xml');
    const svg = doc.documentElement;
    if (svg.tagName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
      throw new Error('svg parse failed');
    }
    const jsx = elementToJsx(svg, '    ', true);
    return `import type { SVGProps } from 'react';

export function ${componentName}(props: SVGProps<SVGSVGElement>) {
  return (
${jsx}
  );
}
`;
  } catch {
    return `export function ${componentName}() {
  return <span dangerouslySetInnerHTML={{ __html: ${JSON.stringify(standalone)} }} />;
}
`;
  }
}

/**
 * Vue SFC 스니펫 — Vue 템플릿은 kebab-case SVG 속성을 그대로 허용하므로 변환 불필요.
 */
export function buildVueIconSnippet(icon: SvgGameIcon): string {
  return `<template>
  ${buildStandaloneSvg(icon)}
</template>
`;
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
