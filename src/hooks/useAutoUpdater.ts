import { useEffect, useState } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { flushSvgWorkspaceSave } from '@/lib/svgIcon/svgWorkspaceSaver';
import { I18N_ERROR_PREFIX } from '@/i18n/errorMessage';

interface UpdateProgress {
  downloaded: number;
  total: number;
  percentage: number;
}

interface UpdateState {
  checking: boolean;
  checkError: string | null;
  available: boolean;
  update: Update | null;
  downloading: boolean;
  progress: UpdateProgress | null;
  installing: boolean;
  error: string | null;
}

export function useAutoUpdater() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    checkError: null,
    available: false,
    update: null,
    downloading: false,
    progress: null,
    installing: false,
    error: null,
  });

  // 업데이트 확인
  const checkForUpdates = async () => {
    setState(prev => ({ ...prev, checking: true, checkError: null }));

    try {
      const update = await check();

      if (update) {
        console.log('[Updater] 업데이트 발견:', update.version);
        setState(prev => ({
          ...prev,
          checking: false,
          available: true,
          update,
        }));
      } else {
        console.log('[Updater] 최신 버전입니다.');
        setState(prev => ({
          ...prev,
          checking: false,
          available: false,
        }));
      }
    } catch (error) {
      console.error('[Updater] 확인 실패:', error);
      setState(prev => ({
        ...prev,
        checking: false,
        // 원인 메시지가 없을 때만 번역 가능한 코드로 대체한다(UI에서 resolveErrorMessage로 해석).
        checkError: error instanceof Error ? error.message : `${I18N_ERROR_PREFIX}update.checkFailed`,
      }));
    }
  };

  // 업데이트 다운로드 및 설치
  const downloadAndInstall = async () => {
    if (!state.update) return;

    setState(prev => ({ ...prev, downloading: true, error: null }));

    try {
      let totalBytes = 0;
      let downloadedBytes = 0;

      await state.update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            totalBytes = event.data.contentLength || 0;
            console.log('[Updater] 다운로드 시작:', totalBytes, 'bytes');
            break;

          case 'Progress':
            downloadedBytes += event.data.chunkLength;
            const percentage = totalBytes > 0
              ? Math.round((downloadedBytes / totalBytes) * 100)
              : 0;

            setState(prev => ({
              ...prev,
              progress: {
                downloaded: downloadedBytes,
                total: totalBytes,
                percentage,
              },
            }));
            break;

          case 'Finished':
            console.log('[Updater] 다운로드 완료');
            setState(prev => ({
              ...prev,
              downloading: false,
              installing: true,
            }));
            break;
        }
      });

      console.log('[Updater] 설치 완료, 재시작 준비');
      // 재시작 전 대기 중인 SVG 워크스페이스 저장을 디스크에 강제 반영(업데이트 시 데이터 유실 방지)
      await flushSvgWorkspaceSave();
      await relaunch();
    } catch (error) {
      console.error('[Updater] 다운로드/설치 실패:', error);
      setState(prev => ({
        ...prev,
        downloading: false,
        installing: false,
        error: error instanceof Error ? error.message : `${I18N_ERROR_PREFIX}update.failed`,
      }));
    }
  };

  // 앱 시작 시 자동 확인
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Updater] 개발 모드에서는 업데이트 확인을 건너뜁니다.');
      return;
    }

    console.log('[Updater] 앱 시작 시 업데이트 확인 중...');
    checkForUpdates();
  }, []);

  return {
    ...state,
    checkForUpdates,
    downloadAndInstall,
  };
}
