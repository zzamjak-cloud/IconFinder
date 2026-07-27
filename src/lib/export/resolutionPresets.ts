/**
 * 다중 해상도 내보내기 프리셋
 * - multiplier: 설정 기본 크기를 @1x로 @2x/@3x
 * - android: mipmap 밀도별 런처 아이콘
 * - ios-appicon: AppIcon.appiconset + Contents.json
 */

export type ResolutionPresetId = 'none' | 'multiplier' | 'android' | 'ios-appicon';

export interface ResolutionEntry {
  /** defaultFolder 기준 상대 경로. `{name}` 토큰 치환 */
  relativePath: string;
  size: number;
}

export interface ResolvedResolutionPreset {
  id: Exclude<ResolutionPresetId, 'none'>;
  entries: ResolutionEntry[];
  /** iOS AppIcon용 Contents.json (해당 시) */
  contentsJson?: string;
  contentsJsonPath?: string;
}

/** Android 리소스 이름: ic_ 접두 + snake_case */
export function normalizeAndroidIconName(rawName: string): string {
  const base = rawName
    .replace(/\.(svg|png)$/i, '')
    .replace(/^.*[/:]/, '') // prefix:name 또는 경로에서 이름만
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
  const body = base || 'icon';
  return body.startsWith('ic_') ? body : `ic_${body}`;
}

/** 일반 파일명 토큰용 안전한 이름 */
export function normalizeExportBaseName(rawName: string): string {
  return (
    rawName
      .replace(/\.(svg|png)$/i, '')
      .replace(/^.*[/:]/, '')
      .replace(/[\\/:*?"<>|]+/g, '_')
      .trim() || 'icon'
  );
}

function applyNameToken(pathTemplate: string, name: string): string {
  return pathTemplate.replace(/\{name\}/g, name);
}

/** @1x/@2x/@3x — 설정 size를 1x 기준으로 사용 */
function buildMultiplierEntries(baseSize: number): ResolutionEntry[] {
  return [
    { relativePath: '{name}.png', size: baseSize },
    { relativePath: '{name}@2x.png', size: baseSize * 2 },
    { relativePath: '{name}@3x.png', size: baseSize * 3 },
  ];
}

/** Android mipmap 밀도 (런처 아이콘 기준) */
const ANDROID_DENSITIES: Array<{ folder: string; size: number }> = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

function buildAndroidEntries(iconName: string): ResolutionEntry[] {
  return ANDROID_DENSITIES.map(({ folder, size }) => ({
    relativePath: `res/${folder}/${iconName}.png`,
    size,
  }));
}

/** iOS App Icon 슬롯 (동일 크기 dedupe) */
const IOS_APPICON_SLOTS: Array<{
  sizePt: number;
  scale: number;
  idiom: 'iphone' | 'ipad' | 'ios-marketing';
}> = [
  { sizePt: 20, scale: 2, idiom: 'iphone' },
  { sizePt: 20, scale: 3, idiom: 'iphone' },
  { sizePt: 29, scale: 2, idiom: 'iphone' },
  { sizePt: 29, scale: 3, idiom: 'iphone' },
  { sizePt: 40, scale: 2, idiom: 'iphone' },
  { sizePt: 40, scale: 3, idiom: 'iphone' },
  { sizePt: 60, scale: 2, idiom: 'iphone' },
  { sizePt: 60, scale: 3, idiom: 'iphone' },
  { sizePt: 20, scale: 1, idiom: 'ipad' },
  { sizePt: 20, scale: 2, idiom: 'ipad' },
  { sizePt: 29, scale: 1, idiom: 'ipad' },
  { sizePt: 29, scale: 2, idiom: 'ipad' },
  { sizePt: 40, scale: 1, idiom: 'ipad' },
  { sizePt: 40, scale: 2, idiom: 'ipad' },
  { sizePt: 76, scale: 1, idiom: 'ipad' },
  { sizePt: 76, scale: 2, idiom: 'ipad' },
  { sizePt: 83.5, scale: 2, idiom: 'ipad' },
  { sizePt: 1024, scale: 1, idiom: 'ios-marketing' },
];

function buildIosAppIcon(baseName: string): {
  entries: ResolutionEntry[];
  contentsJson: string;
  contentsJsonPath: string;
} {
  const setDir = `${baseName}.appiconset`;
  const images: Array<Record<string, string>> = [];
  const entries: ResolutionEntry[] = [];
  const seenSizes = new Set<number>();

  for (const slot of IOS_APPICON_SLOTS) {
    const px = Math.round(slot.sizePt * slot.scale);
    const fileName = `icon_${px}.png`;
    if (!seenSizes.has(px)) {
      seenSizes.add(px);
      entries.push({
        relativePath: `${setDir}/${fileName}`,
        size: px,
      });
    }
    images.push({
      size: `${slot.sizePt}x${slot.sizePt}`,
      idiom: slot.idiom,
      filename: fileName,
      scale: `${slot.scale}x`,
    });
  }

  return {
    entries,
    contentsJson: JSON.stringify({ images, info: { version: 1, author: 'iconfinder' } }, null, 2),
    contentsJsonPath: `${setDir}/Contents.json`,
  };
}

/**
 * 프리셋 ID + 아이콘 이름 + 기본 크기로 실제 출력 엔트리 생성
 * none이면 null
 */
export function resolveResolutionPreset(
  presetId: ResolutionPresetId,
  rawName: string,
  baseSize: number
): ResolvedResolutionPreset | null {
  if (presetId === 'none') return null;

  if (presetId === 'multiplier') {
    const name = normalizeExportBaseName(rawName);
    return {
      id: presetId,
      entries: buildMultiplierEntries(baseSize).map((entry) => ({
        ...entry,
        relativePath: applyNameToken(entry.relativePath, name),
      })),
    };
  }

  if (presetId === 'android') {
    const name = normalizeAndroidIconName(rawName);
    return {
      id: presetId,
      entries: buildAndroidEntries(name),
    };
  }

  const name = normalizeExportBaseName(rawName);
  const ios = buildIosAppIcon(name);
  return {
    id: 'ios-appicon',
    entries: ios.entries,
    contentsJson: ios.contentsJson,
    contentsJsonPath: ios.contentsJsonPath,
  };
}

export const RESOLUTION_PRESET_OPTIONS: Array<{
  id: ResolutionPresetId;
  labelKey:
    | 'batch.preset.none'
    | 'batch.preset.multiplier'
    | 'batch.preset.android'
    | 'batch.preset.ios';
}> = [
  { id: 'none', labelKey: 'batch.preset.none' },
  { id: 'multiplier', labelKey: 'batch.preset.multiplier' },
  { id: 'android', labelKey: 'batch.preset.android' },
  { id: 'ios-appicon', labelKey: 'batch.preset.ios' },
];
