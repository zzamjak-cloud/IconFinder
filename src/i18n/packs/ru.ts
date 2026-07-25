import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { ruCommonTranslations } from './ru/common';
import { ruAppTranslations } from './ru/app';
import { ruSettingsTranslations } from './ru/settings';
import { ruExportTranslations } from './ru/export';
import { ruEditorTranslations } from './ru/editor';
import { ruErrorTranslations } from './ru/errors';

export const ruTranslations = {
  ...ruCommonTranslations,
  ...ruAppTranslations,
  ...ruSettingsTranslations,
  ...ruExportTranslations,
  ...ruEditorTranslations,
  ...ruErrorTranslations,
} as const;

export const ruLanguagePack = {
  code: 'ru',
  translations: ruTranslations,
} satisfies LanguagePack<TranslationKey>;
