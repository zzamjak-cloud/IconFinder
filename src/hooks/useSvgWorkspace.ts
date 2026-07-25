import { useCallback, useEffect, useRef, useState } from 'react';
import { storageService } from '@/services/storageService';
import { SvgWorkspaceData } from '@/types/svgIcon';
import {
  createDefaultSvgWorkspaceData,
  migrateSvgWorkspaceCategories,
} from '@/lib/svgIcon/svgIconDefaults';
import { scheduleSvgWorkspaceSave, flushSvgWorkspaceSave } from '@/lib/svgIcon/svgWorkspaceSaver';

// 디바운스 저장 지연(ms)
const SAVE_DEBOUNCE_MS = 400;

type WorkspaceUpdater = SvgWorkspaceData | ((prev: SvgWorkspaceData) => SvgWorkspaceData);

/**
 * SVG 워크스페이스 영속성 훅
 * - 마운트 시 Tauri Store에서 로드, 없으면 기본 데이터로 초기화
 * - updateWorkspace 호출 시 상태 갱신 + 디바운스 저장, updatedAt 갱신
 * - 로드가 "성공"했을 때만 저장을 허용해, 로드 실패 시 기존 디스크 데이터를 덮어쓰지 않는다.
 * - 화면 숨김/종료/자동 업데이트 재시작 직전에는 즉시 저장(flush)된다.
 */
export function useSvgWorkspace() {
  const [workspace, setWorkspace] = useState<SvgWorkspaceData>(() => createDefaultSvgWorkspaceData());
  const [isLoading, setIsLoading] = useState(true);
  // 초기 로드가 끝났는지 + 저장해도 안전한지(로드 성공 시에만 true)
  const loadedRef = useRef(false);
  const canPersistRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await storageService.getSvgWorkspace();
        if (cancelled) return;
        // 정상 로드(데이터 또는 명시적 없음) → 저장 허용
        canPersistRef.current = true;
        if (!stored) {
          setWorkspace(createDefaultSvgWorkspaceData());
        } else {
          // 기본 카테고리를 templateKey 기반으로 승격(구버전 저장 데이터 호환).
          const migrated = migrateSvgWorkspaceCategories(stored);
          setWorkspace(migrated);
          // 실제로 바뀐 경우에만 디스크에 반영(디바운스 저장 경로 재사용).
          if (migrated !== stored) {
            scheduleSvgWorkspaceSave(migrated, SAVE_DEBOUNCE_MS);
          }
        }
      } catch {
        if (!cancelled) {
          // 로드 실패 시: 디스크 데이터 보호를 위해 이번 세션에는 저장하지 않는다.
          setWorkspace(createDefaultSvgWorkspaceData());
          canPersistRef.current = false;
        }
      } finally {
        if (!cancelled) {
          loadedRef.current = true;
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 화면 숨김/종료 시 대기 중인 저장을 즉시 반영(자동 업데이트 재시작 대비 백업)
  useEffect(() => {
    const flush = () => {
      void flushSvgWorkspaceSave();
    };
    const onVisibility = () => {
      if (document.hidden) flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      // 언마운트 시에도 대기 중 저장을 반영
      flush();
    };
  }, []);

  const updateWorkspace = useCallback((next: WorkspaceUpdater) => {
    setWorkspace((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      const updated: SvgWorkspaceData = { ...resolved, updatedAt: new Date().toISOString() };

      // 로드 완료 + 저장 안전 상태일 때만 디스크에 반영
      if (loadedRef.current && canPersistRef.current) {
        scheduleSvgWorkspaceSave(updated, SAVE_DEBOUNCE_MS);
      }

      return updated;
    });
  }, []);

  return { workspace, updateWorkspace, isLoading };
}
