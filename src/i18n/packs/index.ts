import type { AppLanguage } from '../languageOptions';
import type { LanguagePack } from '../types';
import { enLanguagePack } from './en';
import { koLanguagePack } from './ko';
import { jaLanguagePack } from './ja';
import { zhCNLanguagePack } from './zh-CN';
import { zhTWLanguagePack } from './zh-TW';
import { esLanguagePack } from './es';
import { frLanguagePack } from './fr';
import { deLanguagePack } from './de';
import { ruLanguagePack } from './ru';
import { ptLanguagePack } from './pt';
import { itLanguagePack } from './it';

/**
 * Record<AppLanguage, ...>로 선언되어 있으므로 LANGUAGE_OPTIONS에 언어를 추가하고
 * 여기 등록을 빼먹으면 컴파일 에러가 난다.
 */
export const LANGUAGE_PACKS: Record<AppLanguage, LanguagePack> = {
  en: enLanguagePack,
  ko: koLanguagePack,
  ja: jaLanguagePack,
  'zh-CN': zhCNLanguagePack,
  'zh-TW': zhTWLanguagePack,
  es: esLanguagePack,
  fr: frLanguagePack,
  de: deLanguagePack,
  ru: ruLanguagePack,
  pt: ptLanguagePack,
  it: itLanguagePack,
};

export type { TranslationKey } from './en';
export { enLanguagePack, enTranslations } from './en';
