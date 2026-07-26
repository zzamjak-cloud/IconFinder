import { useEffect } from 'react';

/**
 * 워크스페이스 검색 입력의 DOM id.
 * v1.0.0에서 헤더 SearchBar가 사라졌으므로 Cmd/Ctrl+K는 이 입력을 직접 찾는다.
 */
export const WORKSPACE_SEARCH_INPUT_ID = 'workspace-search-input';

interface KeyboardShortcutsOptions {
  onSearch?: () => void;          // Cmd/Ctrl + K
  onQuickExport?: () => void;     // Cmd/Ctrl + S
  onToggleFavorite?: () => void;  // Cmd/Ctrl + F
}

/**
 * 키보드 단축키 훅
 * - Cmd/Ctrl + K: 검색 포커스
 * - Cmd/Ctrl + S: 빠른 내보내기
 * - Cmd/Ctrl + F: 즐겨찾기 토글
 * - ESC: 다이얼로그 닫기 (브라우저 기본)
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K: 검색 포커스
      if (modKey && e.key === 'k') {
        e.preventDefault();
        if (options.onSearch) {
          options.onSearch();
        } else {
          // 기본 동작: 워크스페이스 검색 입력에 포커스(없으면 첫 텍스트 입력으로 폴백)
          const searchInput =
            (document.getElementById(WORKSPACE_SEARCH_INPUT_ID) as HTMLInputElement | null) ??
            (document.querySelector('input[type="text"]') as HTMLInputElement | null);
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }

      // Cmd/Ctrl + S: 빠른 내보내기
      if (modKey && e.key === 's') {
        e.preventDefault();
        if (options.onQuickExport) {
          options.onQuickExport();
        }
      }

      // Cmd/Ctrl + F: 즐겨찾기 토글
      // (브라우저 기본 검색과 충돌하므로 주석 처리)
      // if (modKey && e.key === 'f') {
      //   e.preventDefault();
      //   if (options.onToggleFavorite) {
      //     options.onToggleFavorite();
      //   }
      // }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
