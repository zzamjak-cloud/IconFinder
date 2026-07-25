import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { itCommonTranslations } from './it/common';
import { itAppTranslations } from './it/app';
import { itSettingsTranslations } from './it/settings';
import { itExportTranslations } from './it/export';
import { itEditorTranslations } from './it/editor';
import { itErrorTranslations } from './it/errors';

export const itTranslations = {
  ...itCommonTranslations,
  ...itAppTranslations,
  ...itSettingsTranslations,
  ...itExportTranslations,
  ...itEditorTranslations,
  ...itErrorTranslations,
} as const;

export const itLanguagePack = {
  code: 'it',
  translations: itTranslations,
} satisfies LanguagePack<TranslationKey>;
