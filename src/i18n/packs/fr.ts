import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { frCommonTranslations } from './fr/common';
import { frAppTranslations } from './fr/app';
import { frSettingsTranslations } from './fr/settings';
import { frExportTranslations } from './fr/export';
import { frEditorTranslations } from './fr/editor';
import { frErrorTranslations } from './fr/errors';

export const frTranslations = {
  ...frCommonTranslations,
  ...frAppTranslations,
  ...frSettingsTranslations,
  ...frExportTranslations,
  ...frEditorTranslations,
  ...frErrorTranslations,
} as const;

export const frLanguagePack = {
  code: 'fr',
  translations: frTranslations,
} satisfies LanguagePack<TranslationKey>;
