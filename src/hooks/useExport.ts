import { useMutation } from '@tanstack/react-query';
import { exportService } from '@/services/exportService';
import { ExportOptions } from '@/types/export';
import { useToast } from '@/components/ui/toast';
import { resolveErrorMessage } from '@/i18n/errorMessage';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * 아이콘 내보내기 훅
 * - TanStack Query Mutation으로 내보내기 처리
 * - 성공/실패 토스트 알림
 */
export function useExport() {
  const { toast } = useToast();
  const { t } = useI18n();

  const exportMutation = useMutation({
    mutationFn: ({
      prefix,
      name,
      options,
    }: {
      prefix: string;
      name: string;
      options?: Partial<ExportOptions>;
    }) => exportService.exportIcon(prefix, name, options),
    onSuccess: () => {
      toast({
        title: t('export.toast.success.title'),
        description: t('export.toast.success.body'),
        type: 'success',
      });
    },
    onError: (error) => {
      console.error('Export hook error:', error);
      toast({
        title: t('export.toast.failed.title'),
        description: resolveErrorMessage(t, error),
        type: 'error',
      });
    },
  });

  return {
    exportIcon: exportMutation.mutate,
    isExporting: exportMutation.isPending,
    isSuccess: exportMutation.isSuccess,
    isError: exportMutation.isError,
    error: exportMutation.error,
    reset: exportMutation.reset,
  };
}
