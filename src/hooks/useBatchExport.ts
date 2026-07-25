import { useState, useCallback } from 'react';
import { exportService } from '@/services/exportService';
import { storageService } from '@/services/storageService';
import { i18nError, resolveErrorMessage } from '@/i18n/errorMessage';
import { useI18n } from '@/i18n/I18nProvider';
import { useSettings } from './useSettings';

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
   * @param iconNames 아이콘 이름 목록 (예: ["mdi:home", "lucide:user"])
   */
  const batchExport = async (iconNames: string[]) => {
    if (iconNames.length === 0) {
      throw i18nError('batch.error.noIcons');
    }

    // 기본 폴더 확인
    if (!settings.defaultFolder) {
      throw i18nError('batch.error.noFolder');
    }

    setIsExporting(true);
    setProgress({ current: 0, total: iconNames.length });
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

      console.log(`Starting batch export of ${iconNames.length} icons`);
      console.log('Export settings:', exportOptions);

      // 순차적으로 내보내기 (너무 빠르면 API 제한에 걸릴 수 있음)
      for (let i = 0; i < iconNames.length; i++) {
        const iconName = iconNames[i];
        const [prefix, name] = iconName.split(':');

        try {
          console.log(`Exporting ${i + 1}/${iconNames.length}: ${iconName}`);

          await exportService.exportIcon(prefix, name, exportOptions);

          setProgress({ current: i + 1, total: iconNames.length });

          // API 부하 방지를 위해 약간의 딜레이
          if (i < iconNames.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          const errorMsg = `${iconName}: ${resolveErrorMessage(t, error)}`;
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
