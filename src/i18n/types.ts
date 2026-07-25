import type { AppLanguage } from './languageOptions';

/** t() 두 번째 인자로 넘기는 보간 값. `{name}` 자리표시자를 치환한다. */
export type TranslationValues = Record<string, string | number>;

/**
 * 언어팩 계약.
 *
 * K에 영어 팩에서 파생한 TranslationKey를 넣으면 키가 하나라도 빠질 때 컴파일 에러가 난다.
 * 각 언어팩은 `satisfies LanguagePack<TranslationKey>`로 선언한다.
 */
export interface LanguagePack<K extends string = string> {
  code: AppLanguage;
  translations: Record<K, string>;
}
