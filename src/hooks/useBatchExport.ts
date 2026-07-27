import { useState, useCallback } from 'react';
import { exportService } from '@/services/exportService';
import { storageService } from '@/services/storageService';
import { i18nError, resolveErrorMessage } from '@/i18n/errorMessage';
import { useI18n } from '@/i18n/I18nProvider';
import { iconifyApi } from '@/services/iconifyApi';
import {
  type ResolutionPresetId,
  resolveResolutionPreset,
} from '@/lib/export/resolutionPresets';
import { useSettings } from './useSettings';

/**
 * 일괄 내보내기 대상 1건.
 * - svg가 있으면 그 내용을 그대로 저장한다(보관함 아이콘의 스타일 적용 결과).
 * - svg가 없으면 name("prefix:name")으로 Iconify 원본을 받아 저장한다.
 */
export interface BatchExportItem {
  name: string;
  svg?: string;
}

export interface BatchExportOptions {
  /** none이면 기존 단일 포맷 내보내기 */
  resolutionPreset?: ResolutionPresetId;
}

/**
 * 일괄 내보내기 훅
 * - 여러 아이콘을 한 번에 내보내기
 * - 진행 상황 추적
 * - 에러 처리
 */
export function useBatchExport() {
  const { settings } = useSettings();
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * 여러 아이콘 일괄 내보내기
   * @param items 내보낼 항목 목록. svg가 있으면 그대로 저장, 없으면 name으로 원본을 받아 저장.
   */
  const batchExport = async (items: BatchExportItem[], options?: BatchExportOptions) => {
    if (items.length === 0) {
      throw i18nError('batch.error.noIcons');
    }

    // 기본 폴더 확인
    if (!settings.defaultFolder) {
      throw i18nError('batch.error.noFolder');
    }

    const presetId: ResolutionPresetId = options?.resolutionPreset ?? 'none';
    const useMultiRes = presetId !== 'none';

    // 다중 해상도는 PNG 전용 — 엔트리 수로 total 산정
    const entriesPerIcon = useMultiRes
      ? (resolveResolutionPreset(presetId, 'icon', settings.size)?.entries.length ?? 1)
      : 1;
    const totalSteps = items.length * entriesPerIcon;

    setIsExporting(true);
    setProgress({ current: 0, total: totalSteps });
    setErrors([]);

    const exportErrors: string[] = [];
    let completedSteps = 0;

    // 원래 autoSave 설정 저장
    const originalAutoSave = settings.autoSave;

    try {
      // 일괄 내보내기를 위해 autoSave를 임시로 활성화
      await storageService.saveExportSettings({
        ...settings,
        autoSave: true,
      });

      const exportOptions = {
        format: useMultiRes ? ('png' as const) : settings.format,
        size: settings.size,
        color: settings.color,
      };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          let svg = item.svg;
          if (!svg) {
            const [prefix, name] = item.name.split(':');
            svg = await iconifyApi.getIconSvg(prefix, name);
            if (!svg) throw i18nError('error.svgDownloadFailed');
          }

          if (useMultiRes) {
            await exportService.exportIconMultiRes(
              item.name,
              svg,
              presetId,
              exportOptions.size,
              () => {
                completedSteps += 1;
                setProgress({ current: completedSteps, total: totalSteps });
              }
            );
          } else if (exportOptions.format === 'png') {
            await exportService.saveSvgAsPng(item.name, svg, exportOptions.size);
            completedSteps += 1;
            setProgress({ current: completedSteps, total: totalSteps });
          } else {
            await exportService.saveTextFile(item.name, svg, 'svg');
            completedSteps += 1;
            setProgress({ current: completedSteps, total: totalSteps });
          }

          // API 부하 방지를 위해 약간의 딜레이 (원본을 새로 받아오는 경우에만)
          if (!item.svg && i < items.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } catch (error) {
          const errorMsg = `${item.name}: ${resolveErrorMessage(t, error)}`;
          exportErrors.push(errorMsg);
          // 실패한 아이콘 분량만큼 진행률을 앞으로 맞춤
          completedSteps = Math.min(totalSteps, (i + 1) * entriesPerIcon);
          setProgress({ current: completedSteps, total: totalSteps });
        }
      }

      setErrors(exportErrors);
    } finally {
      // 원래 autoSave 설정 복원
      await storageService.saveExportSettings({
        ...settings,
        autoSave: originalAutoSave,
      });

      setIsExporting(false);
    }
  };

  const reset = useCallback(() => {
    setProgress({ current: 0, total: 0 });
    setErrors([]);
  }, []);

  return {
    batchExport,
    isExporting,
    progress,
    errors,
    reset,
  };
}
