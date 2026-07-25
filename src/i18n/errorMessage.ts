import { enTranslations, type TranslationKey } from './packs/en';
import type { Translator } from './translate';

/**
 * 번역 가능한 에러 프로토콜.
 *
 * 서비스 계층과 Rust 커맨드는 사용자에게 보일 문장을 직접 만들지 않고
 * `i18n:<번역키>` 또는 `i18n:<번역키>|<세부내용>` 형태의 코드를 던진다.
 * UI에서 resolveErrorMessage로 현재 언어 문장으로 바꿔 표시한다.
 */
export const I18N_ERROR_PREFIX = 'i18n:';

/** 서비스/유틸에서 번역 가능한 에러를 만들 때 사용한다. */
export function i18nError(key: TranslationKey, detail?: string): Error {
  return new Error(`${I18N_ERROR_PREFIX}${key}${detail ? `|${detail}` : ''}`);
}

function isTranslationKey(value: string): value is TranslationKey {
  return value in enTranslations;
}

/** 어떤 형태의 에러든 현재 언어의 표시 문장으로 변환한다. */
export function resolveErrorMessage(t: Translator, error: unknown): string {
  const raw =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  if (!raw) return t('error.unknown');

  if (raw.startsWith(I18N_ERROR_PREFIX)) {
    const body = raw.slice(I18N_ERROR_PREFIX.length);
    const separator = body.indexOf('|');
    const key = separator === -1 ? body : body.slice(0, separator);
    const detail = separator === -1 ? undefined : body.slice(separator + 1);

    if (isTranslationKey(key)) {
      return t(key, detail ? { detail } : undefined);
    }
  }

  return raw;
}
