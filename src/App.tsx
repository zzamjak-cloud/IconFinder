import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsButton } from '@/components/SettingsDialog';
import { LicenseButton } from '@/components/LicenseDialog';
import { ToastProvider } from '@/components/ui/toast';
import { SvgIconPanel, type WorkspaceTab } from '@/components/svg-icon/SvgIconPanel';
import { storageService } from '@/services/storageService';
import { useAutoUpdater } from '@/hooks/useAutoUpdater';
import { UpdateDialog } from '@/components/UpdateDialog';
import { useI18n } from '@/i18n';
import packageJson from '../package.json';

const APP_VERSION = packageJson.version;

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 7, // 7분 (Iconify API 캐시 시간)
      gcTime: 1000 * 60 * 30,   // 30분간 캐시 유지
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 메인 앱 내용 (QueryClientProvider 내부에 있어야 함)
function AppContent() {
  const { t } = useI18n();
  // 업데이트 다이얼로그를 사용자가 닫았는지 여부
  const [updateDismissed, setUpdateDismissed] = useState(false);
  // 검색 | 즐겨찾기 워크스페이스 탭
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('search');

  // 자동 업데이트
  const updater = useAutoUpdater();

  // 앱 시작 시 기본 폴더 초기화
  useEffect(() => {
    storageService.initializeDefaultFolder();
  }, []);

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* 헤더 — 검색|즐겨찾기 탭으로 워크스페이스 모드를 전환한다 */}
        <header className="relative flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">IconFinder</h1>
            {/* v0.3.2에서 설명 문구를 없애고 현재 버전 배지로 대체했다. */}
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              v{APP_VERSION}
            </span>
          </div>
          <nav
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-lg bg-muted p-1"
            aria-label={t('workspace.tab.label')}
          >
            {(
              [
                { id: 'search' as const, labelKey: 'workspace.tab.search' as const },
                { id: 'favorites' as const, labelKey: 'workspace.tab.favorites' as const },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWorkspaceTab(tab.id)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                  workspaceTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={workspaceTab === tab.id ? 'page' : undefined}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LicenseButton />
            <SettingsButton />
          </div>
        </header>

        {/* 메인 컨텐츠 — 헤더 탭에 따라 검색/즐겨찾기 레이아웃을 전환한다 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <SvgIconPanel mode={workspaceTab} />
        </main>

        {/* 업데이트 다이얼로그 */}
        <UpdateDialog
          available={updater.available && !updateDismissed}
          downloading={updater.downloading}
          installing={updater.installing}
          error={updateDismissed ? null : updater.error}
          progress={updater.progress}
          onDownload={updater.downloadAndInstall}
          onClose={() => setUpdateDismissed(true)}
        />
      </div>
    </ToastProvider>
  );
}

// App 컴포넌트 (QueryClientProvider로 감싸기)
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
