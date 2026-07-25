import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { jaCommonTranslations } from './ja/common';
import { jaAppTranslations } from './ja/app';
import { jaSettingsTranslations } from './ja/settings';
import { jaExportTranslations } from './ja/export';
import { jaEditorTranslations } from './ja/editor';
import { jaErrorTranslations } from './ja/errors';

export const jaTranslations = {
  ...jaCommonTranslations,
  ...jaAppTranslations,
  ...jaSettingsTranslations,
  ...jaExportTranslations,
  ...jaEditorTranslations,
  ...jaErrorTranslations,
} as const;

export const jaLanguagePack = {
  code: 'ja',
  translations: jaTranslations,
} satisfies LanguagePack<TranslationKey>;
