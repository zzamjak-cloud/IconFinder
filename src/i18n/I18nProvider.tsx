import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { storageService } from '../services/storageService';
import {
  detectOsLanguage,
  isSupportedLanguage,
  type AppLanguage,
} from './languageOptions';
import { translate, type Translator } from './translate';

/**
 * 첫 페인트 전용 동기 캐시 키.
 *
 * 영속 계층은 Tauri Store(iconfinder.json)이고 이 값은 언제 사라져도 무해한 캐시다.
 * Tauri Store는 비동기라서 최초 렌더에 값을 쓸 수 없고, 그대로 두면 잘못된 언어가 한 프레임 노출된다.
 * 그래서 동기적으로 읽히는 곳에 마지막 선택 언어를 복사해 두고, 마운트 후 Store 값으로 대조·보정한다.
 */
const LANGUAGE_CACHE_KEY = 'iconfinder.language';

function readCachedLanguage(): AppLanguage | null {
  try {
    const value = localStorage.getItem(LANGUAGE_CACHE_KEY);
    return isSupportedLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

function writeCachedLanguage(language: AppLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_CACHE_KEY, language);
  } catch {
    // 캐시 실패는 무해하다. 영속 저장은 Tauri Store가 담당한다.
  }
}

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: Translator;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // 캐시 → OS Locale 순으로 첫 렌더에서 동기 결정하므로 잘못된 언어가 깜빡이지 않는다.
  const [language, setLanguageState] = useState<AppLanguage>(
    () => readCachedLanguage() ?? detectOsLanguage()
  );

  // 마운트 직후 한 번만 Tauri Store와 대조한다. 저장값이 없으면 감지 결과를 최초 저장한다.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await storageService.getLanguage();
      if (cancelled) return;

      if (stored) {
        setLanguageState((current) => {
          if (stored !== current) writeCachedLanguage(stored);
          return stored;
        });
        return;
      }

      setLanguageState((current) => {
        void storageService.saveLanguage(current);
        writeCachedLanguage(current);
        return current;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    writeCachedLanguage(next);
    void storageService.saveLanguage(next);
  }, []);

  const t = useCallback<Translator>(
    (key, values) => translate(language, key, values),
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n은 I18nProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}

/** 컴포넌트 밖(서비스·유틸)에서 번역이 필요할 때 쓰는 축약 훅. */
export function useTranslate(): Translator {
  return useI18n().t;
}
