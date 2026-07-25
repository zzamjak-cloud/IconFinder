import type { LanguagePack } from '../types';
import { enCommonTranslations } from './en/common';
import { enAppTranslations } from './en/app';
import { enSettingsTranslations } from './en/settings';
import { enExportTranslations } from './en/export';
import { enEditorTranslations } from './en/editor';
import { enErrorTranslations } from './en/errors';

/**
 * 영어 팩이 스키마 원본(source of record)이다.
 * 새 키는 반드시 여기에 먼저 추가해야 하며, 그 순간 다른 언어팩이 컴파일 에러로 누락을 알려준다.
 */
export const enTranslations = {
  ...enCommonTranslations,
  ...enAppTranslations,
  ...enSettingsTranslations,
  ...enExportTranslations,
  ...enEditorTranslations,
  ...enErrorTranslations,
} as const;

/** 번역 키 유니온. 영어 팩에서 자동 파생된다. */
export type TranslationKey = keyof typeof enTranslations;

export const enLanguagePack = {
  code: 'en',
  translations: enTranslations,
} satisfies LanguagePack<TranslationKey>;
