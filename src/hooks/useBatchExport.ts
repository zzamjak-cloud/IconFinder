import { useState, useCallback } from 'react';
import { exportService } from '@/services/exportService';
import { storageService } from '@/services/storageService';
import { i18nError, resolveErrorMessage } from '@/i18n/errorMessage';
import { useI18n } from '@/i18n/I18nProvider';
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
  const batchExport = async (items: BatchExportItem[]) => {
    if (items.length === 0) {
      throw i18nError('batch.error.noIcons');
    }

    // 기본 폴더 확인
    if (!settings.defaultFolder) {
      throw i18nError('batch.error.noFolder');
    }

    setIsExporting(true);
    setProgress({ current: 0, total: items.length });
    setErrors([]);

    const exportErrors: string[] = [];

    // 원래 autoSave 설정 저장
    const originalAutoSave = settings.autoSave;

    try {
      // 일괄 내보내기를 위해 autoSave를 임시로 활성화
      await storageService.saveExportSettings({
        ...settings,
        autoSave: true,
      });

      const exportOptions = {
        format: settings.format,
        size: settings.size,
        color: settings.color,
      };

      console.log(`Starting batch export of ${items.length} icons`);
      console.log('Export settings:', exportOptions);

      // 순차적으로 내보내기 (너무 빠르면 API 제한에 걸릴 수 있음)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          console.log(`Exporting ${i + 1}/${items.length}: ${item.name}`);

          if (item.svg) {
            // 이미 SVG 원문을 들고 있는 항목(보관함 아이콘)은 네트워크 없이 그대로 저장한다.
            if (exportOptions.format === 'png') {
              await exportService.saveSvgAsPng(item.name, item.svg, exportOptions.size);
            } else {
              await exportService.saveTextFile(item.name, item.svg, 'svg');
            }
          } else {
            const [prefix, name] = item.name.split(':');
            await exportService.exportIcon(prefix, name, exportOptions);
          }

          setProgress({ current: i + 1, total: items.length });

          // API 부하 방지를 위해 약간의 딜레이 (원본을 새로 받아오는 경우에만 필요)
          if (!item.svg && i < items.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          const errorMsg = `${item.name}: ${resolveErrorMessage(t, error)}`;
          console.error('Export error:', errorMsg);
          exportErrors.push(errorMsg);
        }
      }

      setErrors(exportErrors);

      if (exportErrors.length === 0) {
        console.log('Batch export completed successfully');
      } else {
        console.warn(`Batch export completed with ${exportErrors.length} errors`);
      }
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
