import { I18N_ERROR_PREFIX } from '@/i18n/errorMessage';

export interface SanitizedSvgResult {
  ok: boolean;
  svg: string;
  error?: string;
  viewBox?: string;
}

const BLOCKED_ELEMENTS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
]);

const XML_ENTITIES = new Set(['amp', 'lt', 'gt', 'quot', 'apos']);

function extractSvg(rawSvg: string): string {
  const withoutFence = rawSvg
    .replace(/```svg/gi, '```')
    .replace(/```xml/gi, '```')
    .replace(/```/g, '')
    .trim();
  const firstSvg = withoutFence.search(/<svg[\s>]/i);
  const lastSvg = withoutFence.toLowerCase().lastIndexOf('</svg>');
  if (firstSvg === -1 || lastSvg === -1) return withoutFence;
  return withoutFence.slice(firstSvg, lastSvg + '</svg>'.length);
}

function normalizeCommonSvgSyntax(svgSource: string): string {
  let normalized = svgSource
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/\bclassName=/g, 'class=')
    .replace(/\bstrokeWidth=/g, 'stroke-width=')
    .replace(/\bstrokeLinecap=/g, 'stroke-linecap=')
    .replace(/\bstrokeLinejoin=/g, 'stroke-linejoin=')
    .replace(/\bstrokeMiterlimit=/g, 'stroke-miterlimit=')
    .replace(/\bfillRule=/g, 'fill-rule=')
    .replace(/\bclipRule=/g, 'clip-rule=');

  if (/\bxlink:href=/.test(normalized) && !/\bxmlns:xlink=/.test(normalized)) {
    normalized = normalized.replace(
      /<svg\b([^>]*)>/i,
      '<svg$1 xmlns:xlink="http://www.w3.org/1999/xlink">'
    );
  }

  normalized = normalized.replace(/&([a-zA-Z][\w.-]*);/g, (match, entity: string) => {
    return XML_ENTITIES.has(entity) ? match : `&amp;${entity};`;
  });

  return normalized.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-fA-F]+;)/g, '&amp;');
}

function isUnsafeUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith('#')) return false;
  if (normalized.startsWith('data:image/svg+xml')) return true;
  return /^(https?:|javascript:|file:|blob:)/.test(normalized);
}

function sanitizeElement(element: Element): void {
  const tagName = element.tagName.toLowerCase();
  if (BLOCKED_ELEMENTS.has(tagName)) {
    element.remove();
    return;
  }

  for (const attr of Array.from(element.attributes)) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (name.startsWith('on')) {
      element.removeAttribute(attr.name);
      continue;
    }

    if ((name === 'href' || name === 'xlink:href') && isUnsafeUrl(value)) {
      element.removeAttribute(attr.name);
      continue;
    }

    if (name === 'style' && /url\s*\(|@import/i.test(value)) {
      element.removeAttribute(attr.name);
    }
  }
}

function parseSvgRoot(svgSource: string): Element | null {
  const parser = new DOMParser();
  const normalized = normalizeCommonSvgSyntax(svgSource);
  const xmlDoc = parser.parseFromString(normalized, 'image/svg+xml');
  const xmlRoot = xmlDoc.documentElement;
  if (!xmlDoc.querySelector('parsererror') && xmlRoot?.tagName.toLowerCase() === 'svg') {
    return xmlRoot;
  }

  const htmlDoc = parser.parseFromString(svgSource, 'text/html');
  const htmlRoot = htmlDoc.querySelector('svg');
  if (htmlRoot) return htmlRoot;

  const normalizedHtmlDoc = parser.parseFromString(normalized, 'text/html');
  return normalizedHtmlDoc.querySelector('svg');
}

export function sanitizeSvg(rawSvg: string, fallbackViewBox = '0 0 64 64'): SanitizedSvgResult {
  const svgSource = extractSvg(rawSvg);
  if (!svgSource.startsWith('<svg')) {
    // error는 문장이 아니라 번역 프로토콜 코드. UI에서 resolveErrorMessage로 현재 언어 문장이 된다.
    return { ok: false, svg: '', error: `${I18N_ERROR_PREFIX}error.svg.noRoot` };
  }

  const root = parseSvgRoot(svgSource);
  if (!root || root.tagName.toLowerCase() !== 'svg') {
    return { ok: false, svg: '', error: `${I18N_ERROR_PREFIX}error.svg.notSvg` };
  }

  for (const element of Array.from(root.querySelectorAll('*'))) {
    sanitizeElement(element);
  }
  sanitizeElement(root);

  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!root.getAttribute('viewBox')) {
    root.setAttribute('viewBox', fallbackViewBox);
  }
  root.removeAttribute('width');
  root.removeAttribute('height');

  const serialized = new XMLSerializer().serializeToString(root);
  return {
    ok: true,
    svg: serialized,
    viewBox: root.getAttribute('viewBox') ?? fallbackViewBox,
  };
}
