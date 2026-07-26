import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsButton } from '@/components/SettingsDialog';
import { LicenseButton } from '@/components/LicenseDialog';
import { ToastProvider } from '@/components/ui/toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SvgIconPanel } from '@/components/svg-icon/SvgIconPanel';
import { storageService } from '@/services/storageService';
import { useAutoUpdater } from '@/hooks/useAutoUpdater';
import { UpdateDialog } from '@/components/UpdateDialog';
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
  // 업데이트 다이얼로그를 사용자가 닫았는지 여부
  const [updateDismissed, setUpdateDismissed] = useState(false);

  // 자동 업데이트
  const updater = useAutoUpdater();

  // 키보드 단축키
  useKeyboardShortcuts();

  // 앱 시작 시 기본 폴더 초기화
  useEffect(() => {
    storageService.initializeDefaultFolder();
  }, []);

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* 헤더 */}
        <header className="relative flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">IconFinder</h1>
            {/* v0.3.2에서 설명 문구를 없애고 현재 버전 배지로 대체했다. */}
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              v{APP_VERSION}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LicenseButton />
            <SettingsButton />
          </div>
        </header>

        {/* 메인 컨텐츠 — v1.0.0에서 검색/에디터 탭을 없애고 단일 워크스페이스가 본문 전체를 담당한다. */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <SvgIconPanel />
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
