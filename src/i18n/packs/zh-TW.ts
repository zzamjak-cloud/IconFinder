import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { zhTWCommonTranslations } from './zh-TW/common';
import { zhTWAppTranslations } from './zh-TW/app';
import { zhTWSettingsTranslations } from './zh-TW/settings';
import { zhTWExportTranslations } from './zh-TW/export';
import { zhTWEditorTranslations } from './zh-TW/editor';
import { zhTWErrorTranslations } from './zh-TW/errors';

export const zhTWTranslations = {
  ...zhTWCommonTranslations,
  ...zhTWAppTranslations,
  ...zhTWSettingsTranslations,
  ...zhTWExportTranslations,
  ...zhTWEditorTranslations,
  ...zhTWErrorTranslations,
} as const;

export const zhTWLanguagePack = {
  code: 'zh-TW',
  translations: zhTWTranslations,
} satisfies LanguagePack<TranslationKey>;
