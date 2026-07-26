import { useCallback, useEffect, useRef, useState } from 'react';
import { storageService, type UiPreferences } from '@/services/storageService';

const SAVE_DEBOUNCE_MS = 400;

/**
 * UI 상태(그리드 열 수, 사이드바 폭/접힘) 영속화 훅
 * - 마운트 시 1회 로드, save()는 디바운스 저장(사이드바 드래그 폭주 방지)
 * - pagehide/언마운트 시 pending flush
 */
export function useUiPreferences() {
  const [preferences, setPreferences] = useState<UiPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<UiPreferences | null>(null);

  useEffect(() => {
    let cancelled = false;
    storageService
      .getUiPreferences()
      .then((prefs) => {
        if (cancelled) return;
        setPreferences(prefs);
        setIsLoaded(true);
      })
      .catch(() => {
        // 로드 실패 시에도 하이드레이션은 진행(기본값 사용)
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((next: UiPreferences) => {
    pendingRef.current = next;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const payload = pendingRef.current;
      pendingRef.current = null;
      if (payload) void storageService.saveUiPreferences(payload);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    const flush = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const payload = pendingRef.current;
      pendingRef.current = null;
      if (payload) void storageService.saveUiPreferences(payload);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  return { preferences, isLoaded, save };
}
