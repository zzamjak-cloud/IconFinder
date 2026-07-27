import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { storageService, type ThemeSetting } from '@/services/storageService';

// 첫 페인트 FOUC 방지용 localStorage 미러 (원본은 Tauri Store)
const THEME_CACHE_KEY = 'iconfinder.theme';

function getCachedTheme(): ThemeSetting {
  try {
    const value = localStorage.getItem(THEME_CACHE_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  } catch {
    return 'system';
  }
}

function resolveIsDark(theme: ThemeSetting): boolean {
  if (theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
  return theme === 'dark';
}

/** html.dark 토글 + color-scheme. macOS WKWebView가 OS 다크를 강제해도 명시적으로 light를 고정한다. */
function applyThemeClass(theme: ThemeSetting): void {
  const isDark = resolveIsDark(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

/** Tauri 네이티브 창 테마 동기화 (macOS/Linux는 앱 전역). 브라우저/권한 부족 시 무시. */
async function applyNativeWindowTheme(theme: ThemeSetting): Promise<void> {
  try {
    const native = theme === 'system' ? null : theme;
    await getCurrentWindow().setTheme(native);
  } catch {
    // 웹 미리보기 또는 ACL 미허용 시 no-op
  }
}

function persistThemeCache(theme: ThemeSetting): void {
  try {
    localStorage.setItem(THEME_CACHE_KEY, theme);
  } catch {
    // Tauri 일부 환경에서 localStorage 제한 가능 — 클래스 적용은 이미 완료
  }
}

/**
 * 테마(light/dark/system) 훅
 * - TanStack Query 캐시를 공유하므로 여러 곳에서 호출해도 상태가 일치한다
 * - 적용은 <html>의 dark 클래스 + color-scheme + (가능 시) 네이티브 window.setTheme
 * - system 모드는 OS 테마 변경을 실시간 반영
 */
export function useTheme() {
  const queryClient = useQueryClient();
  // 사용자가 고른 테마보다 늦은 getTheme 응답이 캐시를 되돌리지 못하게 세대 번호로 가드
  const generationRef = useRef(0);

  const { data: theme = getCachedTheme() } = useQuery({
    queryKey: ['theme'],
    queryFn: async () => {
      const generation = generationRef.current;
      const stored = await storageService.getTheme();
      // 저장소 응답이 오기 전에 사용자가 바꾼 값이 있으면 그걸 유지
      if (generation !== generationRef.current) {
        return queryClient.getQueryData<ThemeSetting>(['theme']) ?? stored;
      }
      return stored;
    },
    placeholderData: getCachedTheme(),
    staleTime: Infinity,
  });

  useEffect(() => {
    applyThemeClass(theme);
    persistThemeCache(theme);
    void applyNativeWindowTheme(theme);
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      generationRef.current += 1;
      // useEffect를 기다리지 않고 즉시 반영 (체감 지연/레이스 방지)
      applyThemeClass(next);
      persistThemeCache(next);
      void applyNativeWindowTheme(next);
      void queryClient.cancelQueries({ queryKey: ['theme'] });
      queryClient.setQueryData(['theme'], next);
      void storageService.saveTheme(next);
    },
    [queryClient]
  );

  return { theme, setTheme };
}
