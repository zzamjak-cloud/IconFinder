import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storageService, type ThemeSetting } from '@/services/storageService';

// 첫 페인트 FOUC 방지용 localStorage 미러 (원본은 Tauri Store)
const THEME_CACHE_KEY = 'iconfinder.theme';

function getCachedTheme(): ThemeSetting {
  const value = localStorage.getItem(THEME_CACHE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function resolveIsDark(theme: ThemeSetting): boolean {
  if (theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
  return theme === 'dark';
}

function applyThemeClass(theme: ThemeSetting): void {
  document.documentElement.classList.toggle('dark', resolveIsDark(theme));
}

/**
 * 테마(light/dark/system) 훅
 * - TanStack Query 캐시를 공유하므로 여러 곳에서 호출해도 상태가 일치한다
 * - 적용은 <html>의 dark 클래스 토글 (tailwind darkMode: class)
 * - system 모드는 OS 테마 변경을 실시간 반영
 */
export function useTheme() {
  const queryClient = useQueryClient();
  const { data: theme = getCachedTheme() } = useQuery({
    queryKey: ['theme'],
    queryFn: () => storageService.getTheme(),
    placeholderData: getCachedTheme(),
    staleTime: Infinity,
  });

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem(THEME_CACHE_KEY, theme);
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      // 즉시 반영을 위해 캐시를 먼저 갱신하고 저장은 비동기로
      queryClient.setQueryData(['theme'], next);
      void storageService.saveTheme(next);
    },
    [queryClient]
  );

  return { theme, setTheme };
}
