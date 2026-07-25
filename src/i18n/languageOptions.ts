/**
 * 지원 언어 목록.
 *
 * 언어를 추가할 때 수정해야 하는 곳은 다음 3곳뿐이다.
 *   1. 이 파일의 LANGUAGE_OPTIONS 배열
 *   2. src/i18n/packs/<code>/ 디렉토리 (번역 파일)
 *   3. src/i18n/packs/index.ts 레지스트리
 * LANGUAGE_PACKS가 Record<AppLanguage, ...>로 선언되어 있어 3번을 빼먹으면 컴파일 에러가 난다.
 */
export const LANGUAGE_OPTIONS = [
  {
    code: 'en',
    flag: '🇺🇸',
    nativeName: 'English',
    localePrefixes: ['en'],
  },
  {
    code: 'ko',
    flag: '🇰🇷',
    nativeName: '한국어',
    localePrefixes: ['ko'],
  },
  {
    code: 'ja',
    flag: '🇯🇵',
    nativeName: '日本語',
    localePrefixes: ['ja'],
  },
  {
    // 접두사 없는 'zh'는 간체를 기본으로 둔다. 번체는 아래 zh-TW의 더 긴 접두사가 우선 매칭된다.
    code: 'zh-CN',
    flag: '🇨🇳',
    nativeName: '简体中文',
    localePrefixes: ['zh', 'zh-cn', 'zh-sg', 'zh-hans'],
  },
  {
    code: 'zh-TW',
    flag: '🇹🇼',
    nativeName: '繁體中文',
    localePrefixes: ['zh-tw', 'zh-hk', 'zh-mo', 'zh-hant'],
  },
  {
    code: 'es',
    flag: '🇪🇸',
    nativeName: 'Español',
    localePrefixes: ['es'],
  },
  {
    code: 'fr',
    flag: '🇫🇷',
    nativeName: 'Français',
    localePrefixes: ['fr'],
  },
  {
    code: 'de',
    flag: '🇩🇪',
    nativeName: 'Deutsch',
    localePrefixes: ['de'],
  },
  {
    code: 'ru',
    flag: '🇷🇺',
    nativeName: 'Русский',
    localePrefixes: ['ru'],
  },
  {
    code: 'pt',
    flag: '🇧🇷',
    nativeName: 'Português',
    localePrefixes: ['pt'],
  },
  {
    code: 'it',
    flag: '🇮🇹',
    nativeName: 'Italiano',
    localePrefixes: ['it'],
  },
] as const;

/** 지원 언어 코드. LANGUAGE_OPTIONS에서 자동 파생되므로 별도 유지보수가 필요 없다. */
export type AppLanguage = (typeof LANGUAGE_OPTIONS)[number]['code'];

export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

/** OS Locale을 인식하지 못했을 때의 기본 언어. */
export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export function isSupportedLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && LANGUAGE_OPTIONS.some((option) => option.code === value);
}

/**
 * OS/브라우저 Locale에서 앱 언어를 추론한다.
 *
 * zh와 zh-tw처럼 접두사가 겹치는 언어가 있으므로 후보 하나당 "가장 긴 접두사 매칭"을 우선한다.
 * 예: 'zh-Hant-HK' → zh-hant(7자)가 zh(2자)를 이기므로 번체.
 */
export function detectOsLanguage(): AppLanguage {
  const candidates =
    typeof navigator === 'undefined'
      ? []
      : [...(navigator.languages ?? []), navigator.language].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    let best: { code: AppLanguage; prefixLength: number } | null = null;

    for (const option of LANGUAGE_OPTIONS) {
      for (const prefix of option.localePrefixes) {
        const matches =
          normalized === prefix ||
          normalized.startsWith(`${prefix}-`) ||
          normalized.startsWith(`${prefix}_`);
        if (matches && (!best || prefix.length > best.prefixLength)) {
          best = { code: option.code, prefixLength: prefix.length };
        }
      }
    }

    if (best) return best.code;
  }

  return DEFAULT_LANGUAGE;
}
