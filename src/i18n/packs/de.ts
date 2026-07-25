import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { deCommonTranslations } from './de/common';
import { deAppTranslations } from './de/app';
import { deSettingsTranslations } from './de/settings';
import { deExportTranslations } from './de/export';
import { deEditorTranslations } from './de/editor';
import { deErrorTranslations } from './de/errors';

export const deTranslations = {
  ...deCommonTranslations,
  ...deAppTranslations,
  ...deSettingsTranslations,
  ...deExportTranslations,
  ...deEditorTranslations,
  ...deErrorTranslations,
} as const;

export const deLanguagePack = {
  code: 'de',
  translations: deTranslations,
} satisfies LanguagePack<TranslationKey>;
