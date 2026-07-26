import { useEffect, useRef } from 'react';

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

// 편집 가능한 요소에 포커스가 있으면 true (입력 중 오동작 방지)
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

/**
 * 키보드 단축키 훅
 * - Cmd/Ctrl + K: 검색 포커스
 * - Cmd/Ctrl + S: 빠른 내보내기
 * - Cmd/Ctrl + F: 즐겨찾기 토글 (Tauri WebView에는 브라우저 찾기 바가 없어 충돌 없음)
 * - ESC: 다이얼로그 닫기 (브라우저 기본)
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  // 콜백은 ref로 읽어 리스너를 1회만 등록한다 (매 렌더 재등록 방지)
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (!modKey) return;

      // Cmd/Ctrl + K: 검색 포커스 (입력 중에도 허용)
      if (e.key === 'k') {
        e.preventDefault();
        if (optionsRef.current.onSearch) {
          optionsRef.current.onSearch();
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
      if (e.key === 's') {
        e.preventDefault();
        optionsRef.current.onQuickExport?.();
      }

      // Cmd/Ctrl + F: 즐겨찾기 토글 (텍스트 입력 중에는 무시)
      if (e.key === 'f') {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        optionsRef.current.onToggleFavorite?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
