import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { esCommonTranslations } from './es/common';
import { esAppTranslations } from './es/app';
import { esSettingsTranslations } from './es/settings';
import { esExportTranslations } from './es/export';
import { esEditorTranslations } from './es/editor';
import { esErrorTranslations } from './es/errors';

export const esTranslations = {
  ...esCommonTranslations,
  ...esAppTranslations,
  ...esSettingsTranslations,
  ...esExportTranslations,
  ...esEditorTranslations,
  ...esErrorTranslations,
} as const;

export const esLanguagePack = {
  code: 'es',
  translations: esTranslations,
} satisfies LanguagePack<TranslationKey>;
