/**
 * Canvas 기반 SVG→PNG 래스터화
 * - 스타일 엔진의 SVG 필터(효과)를 그대로 반영하기 위해 resvg 대신 Canvas 사용
 * - 이미지는 1회 로드 후 여러 크기로 재래스터화 가능 (다중 해상도 내보내기용)
 */

/** 이미지 로드용 SVG 정규화 (xmlns·viewBox 기반 width/height) */
export function normalizeSvgForRaster(svg: string): string {
  let normalized = svg;

  if (!normalized.includes('xmlns=')) {
    normalized = normalized.replace(
      /<svg(\s|>)/,
      '<svg xmlns="http://www.w3.org/2000/svg"$1'
    );
  }

  const viewBoxMatch = normalized.match(/viewBox=["']([^"']+)["']/);
  if (!viewBoxMatch) {
    return normalized.replace(/<svg([^>]*)>/, '<svg$1 width="24" height="24">');
  }

  const viewBoxParts = viewBoxMatch[1].split(/\s+/);
  const width = viewBoxParts[2];
  const height = viewBoxParts[3];

  normalized = normalized.replace(/\s+width=["'][^"']*["']/g, '');
  normalized = normalized.replace(/\s+height=["'][^"']*["']/g, '');
  normalized = normalized.replace(
    /<svg(\s|>)/,
    `<svg width="${width}" height="${height}"$1`
  );

  return normalized;
}

/** SVG 문자열을 HTMLImageElement로 1회 로드 */
export async function loadSvgImage(svgContent: string): Promise<HTMLImageElement> {
  const normalized = normalizeSvgForRaster(svgContent);
  const img = new Image();
  const base64Svg = btoa(unescape(encodeURIComponent(normalized)));
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load SVG as image'));
    img.src = dataUrl;
  });

  return img;
}

/** 로드된 이미지를 지정 크기 PNG 바이트로 래스터화 */
export async function rasterizePng(img: HTMLImageElement, size: number): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context');
  }

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to encode PNG blob'));
    }, 'image/png');
  });

  return new Uint8Array(await blob.arrayBuffer());
}
