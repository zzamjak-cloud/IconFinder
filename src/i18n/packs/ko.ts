import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { koCommonTranslations } from './ko/common';
import { koAppTranslations } from './ko/app';
import { koSettingsTranslations } from './ko/settings';
import { koExportTranslations } from './ko/export';
import { koEditorTranslations } from './ko/editor';
import { koErrorTranslations } from './ko/errors';

export const koTranslations = {
  ...koCommonTranslations,
  ...koAppTranslations,
  ...koSettingsTranslations,
  ...koExportTranslations,
  ...koEditorTranslations,
  ...koErrorTranslations,
} as const;

export const koLanguagePack = {
  code: 'ko',
  translations: koTranslations,
} satisfies LanguagePack<TranslationKey>;
