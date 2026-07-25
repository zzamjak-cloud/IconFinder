import { Download, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { resolveErrorMessage } from '@/i18n/errorMessage';

// 변경 내역은 앱 안에 복제하지 않고 GitHub의 CHANGELOG 원본으로 바로 보낸다.
const CHANGELOG_URL = 'https://github.com/zzamjak-cloud/IconMaker/blob/main/CHANGELOG.md';

interface UpdateDialogProps {
  available: boolean;
  downloading: boolean;
  installing: boolean;
  error: string | null;
  progress: {
    downloaded: number;
    total: number;
    percentage: number;
  } | null;
  onDownload: () => void;
  onClose: () => void;
}

export function UpdateDialog({
  available,
  downloading,
  installing,
  error,
  progress,
  onDownload,
  onClose,
}: UpdateDialogProps) {
  const { t } = useI18n();

  if (!available && !error) return null;

  const title = error
    ? t('update.title.error')
    : installing
      ? t('update.title.installing')
      : downloading
        ? t('update.title.downloading')
        : t('update.title.available');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-4">
          {error ? (
            <AlertCircle className="w-6 h-6 text-destructive" />
          ) : installing ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Download className="w-6 h-6 text-primary" />
          )}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        {/* 본문 */}
        <div className="mb-6 text-sm text-muted-foreground">
          {error ? (
            <p className="text-destructive">{resolveErrorMessage(t, error)}</p>
          ) : installing ? (
            <p>{t('update.installing.body')}</p>
          ) : downloading ? (
            <>
              <p className="mb-2">{t('update.downloading.body')}</p>
              {progress && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{progress.percentage}%</span>
                    <span>
                      {formatBytes(progress.downloaded)} / {formatBytes(progress.total)}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // 업데이트 대기 상태에서는 부가 정보 없이 CHANGELOG 링크만 노출한다.
            <button
              type="button"
              onClick={() => void openUrl(CHANGELOG_URL)}
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('update.changelog')}
            </button>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          {!downloading && !installing && (
            <>
              <button
                onClick={onClose}
                className={cn('px-4 py-2 rounded-md transition-colors', 'hover:bg-muted')}
              >
                {error ? t('common.close') : t('update.later')}
              </button>
              {!error && (
                <button
                  onClick={onDownload}
                  className={cn(
                    'px-4 py-2 rounded-md transition-colors',
                    'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {t('update.now')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
