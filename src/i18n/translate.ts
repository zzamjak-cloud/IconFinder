import type { AppLanguage } from './languageOptions';
import { LANGUAGE_PACKS } from './packs';
import type { TranslationKey } from './packs/en';
import type { TranslationValues } from './types';

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/** `{name}` 자리표시자를 values의 같은 이름 값으로 치환한다. 값이 없으면 자리표시자를 그대로 남긴다. */
export function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(PLACEHOLDER_PATTERN, (match, name: string) =>
    name in values ? String(values[name]) : match
  );
}

/** 폴백 순서: 요청 언어 → 영어 → 키 그대로(개발 중 누락을 눈에 보이게 함). */
export function translate(
  language: AppLanguage,
  key: TranslationKey,
  values?: TranslationValues
): string {
  const template =
    LANGUAGE_PACKS[language]?.translations[key] ?? LANGUAGE_PACKS.en.translations[key] ?? key;
  return interpolate(template, values);
}

/** 컴포넌트가 주입받는 번역 함수 타입. */
export type Translator = (key: TranslationKey, values?: TranslationValues) => string;
