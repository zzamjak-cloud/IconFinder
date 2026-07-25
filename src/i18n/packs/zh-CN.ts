import type { LanguagePack } from '../types';
import type { TranslationKey } from './en';
import { zhCNCommonTranslations } from './zh-CN/common';
import { zhCNAppTranslations } from './zh-CN/app';
import { zhCNSettingsTranslations } from './zh-CN/settings';
import { zhCNExportTranslations } from './zh-CN/export';
import { zhCNEditorTranslations } from './zh-CN/editor';
import { zhCNErrorTranslations } from './zh-CN/errors';

export const zhCNTranslations = {
  ...zhCNCommonTranslations,
  ...zhCNAppTranslations,
  ...zhCNSettingsTranslations,
  ...zhCNExportTranslations,
  ...zhCNEditorTranslations,
  ...zhCNErrorTranslations,
} as const;

export const zhCNLanguagePack = {
  code: 'zh-CN',
  translations: zhCNTranslations,
} satisfies LanguagePack<TranslationKey>;
