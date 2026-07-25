import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { ptCommonTranslations } from './pt/common';
import { ptAppTranslations } from './pt/app';
import { ptSettingsTranslations } from './pt/settings';
import { ptExportTranslations } from './pt/export';
import { ptEditorTranslations } from './pt/editor';
import { ptErrorTranslations } from './pt/errors';

export const ptTranslations = {
  ...ptCommonTranslations,
  ...ptAppTranslations,
  ...ptSettingsTranslations,
  ...ptExportTranslations,
  ...ptEditorTranslations,
  ...ptErrorTranslations,
} as const;

export const ptLanguagePack = {
  code: 'pt',
  translations: ptTranslations,
} satisfies LanguagePack<TranslationKey>;
