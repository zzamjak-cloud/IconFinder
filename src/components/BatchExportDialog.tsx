import { useState, useEffect } from 'react';
import { Download, Check, X as XIcon, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useBatchExport, type BatchExportItem } from '@/hooks/useBatchExport';
import { useSettings } from '@/hooks/useSettings';
import { resolveErrorMessage } from '@/i18n/errorMessage';
import { useI18n } from '@/i18n/I18nProvider';
import {
  RESOLUTION_PRESET_OPTIONS,
  type ResolutionPresetId,
} from '@/lib/export/resolutionPresets';

interface BatchExportDialogProps {
  /** 내보낼 항목 목록. 호출부가 선택 항목/카테고리 등 무엇이든 명시적으로 넘긴다. */
  items: BatchExportItem[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 일괄 내보내기 다이얼로그
 * - 여러 아이콘을 한 번에 내보내기
 * - 진행 상황 표시
 * - 에러 목록 표시
 */
export function BatchExportDialog({ items, isOpen, onClose }: BatchExportDialogProps) {
  const { batchExport, isExporting, progress, errors, reset } = useBatchExport();
  const { settings } = useSettings();
  const { t } = useI18n();
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);
  const [resolutionPreset, setResolutionPreset] = useState<ResolutionPresetId>('none');

  // 다이얼로그가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
      setResolutionPreset('none');
      reset();
    }
  }, [isOpen, reset]);

  // 완료 후 자동 닫기
  useEffect(() => {
    if (hasStarted && !isExporting && errors.length === 0) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [hasStarted, isExporting, errors, onClose]);

  const handleStart = async () => {
    setHasStarted(true);
    try {
      await batchExport(items, { resolutionPreset });
    } catch (error) {
      // Tauri에서 window.alert은 동작이 불안정하므로 앱 토스트로 알린다.
      toast({
        title: t('export.failed'),
        description: resolveErrorMessage(t, error),
        type: 'error',
      });
      onClose();
    }
  };

  const isComplete = hasStarted && !isExporting;
  const hasErrors = errors.length > 0;
  const isMultiRes = resolutionPreset !== 'none';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('batch.title')}</span>
            {!isExporting && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 내보내기 정보 */}
          {!hasStarted && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">
                  {t('batch.summary', { count: items.length })}
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {t('batch.detail.format', {
                      format: isMultiRes ? 'PNG' : settings.format.toUpperCase(),
                    })}
                  </p>
                  {(isMultiRes || settings.format === 'png') && (
                    <p>{t('batch.detail.size', { size: settings.size })}</p>
                  )}
                  <p>{t('batch.detail.color', { color: settings.color })}</p>
                  <p>
                    {t('batch.detail.folder', {
                      folder: settings.defaultFolder || t('common.notSet'),
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="batch-resolution-preset">
                  {t('batch.preset.label')}
                </label>
                <select
                  id="batch-resolution-preset"
                  value={resolutionPreset}
                  onChange={(event) =>
                    setResolutionPreset(event.target.value as ResolutionPresetId)
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {RESOLUTION_PRESET_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
                {isMultiRes && (
                  <p className="text-xs text-muted-foreground">{t('batch.preset.hint')}</p>
                )}
              </div>

              {!settings.defaultFolder && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">{t('batch.noFolder.title')}</p>
                    <p className="mt-1">{t('batch.noFolder.body')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 진행 상황 */}
          {hasStarted && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progress.current} / {progress.total}
                  </span>
                  <span className="font-medium">
                    {progress.total > 0
                      ? Math.round((progress.current / progress.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {isExporting && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-600 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">{t('batch.exporting')}</span>
                </div>
              )}

              {isComplete && !hasErrors && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">
                    {t('batch.done', { count: items.length })}
                  </span>
                </div>
              )}

              {isComplete && hasErrors && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">
                      {t('batch.partial', {
                        success: Math.max(0, items.length - errors.length),
                        failed: errors.length,
                      })}
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t('batch.errorList')}
                    </p>
                    {errors.map((error, idx) => (
                      <p key={idx} className="text-xs text-destructive">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!hasStarted && (
            <Button
              onClick={handleStart}
              disabled={!settings.defaultFolder}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('batch.start')}
            </Button>
          )}

          {isComplete && (
            <Button onClick={onClose} className="w-full">
              {t('common.close')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
