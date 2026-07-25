import { useState, useEffect, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchBar } from '@/components/SearchBar';
import { IconGrid } from '@/components/IconGrid';
import { ExportPanel } from '@/components/ExportPanel';
import { BatchExportDialog } from '@/components/BatchExportDialog';
import { SettingsButton } from '@/components/SettingsDialog';
import { LicenseButton } from '@/components/LicenseDialog';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { ToastProvider } from '@/components/ui/toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Star, Download, Search as SearchIcon, Palette, Loader2 } from 'lucide-react';

// SVG 워크스페이스 패널 (lazy 로드)
const SvgIconPanel = lazy(() =>
  import('@/components/svg-icon/SvgIconPanel').then((module) => ({ default: module.SvgIconPanel }))
);

type MainView = 'search' | 'svgWorkspace';
import { useFavorites } from '@/hooks/useFavorites';
import { storageService } from '@/services/storageService';
import { cn } from '@/lib/utils';
import { useAutoUpdater } from '@/hooks/useAutoUpdater';
import { UpdateDialog } from '@/components/UpdateDialog';
import { useI18n } from '@/i18n';

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
  // 메인 뷰 전환 (검색 ↔ SVG 에디터)
  const [mainView, setMainView] = useState<MainView>('search');

  // 선택된 아이콘 (내보내기 패널용)
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // 즐겨찾기 필터 상태
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // 일괄 내보내기 다이얼로그 상태
  const [showBatchExport, setShowBatchExport] = useState(false);

  // Grid 컬럼 수 상태 (5~10)
  const [gridColumns, setGridColumns] = useState(10);

  // 업데이트 다이얼로그를 사용자가 닫았는지 여부
  const [updateDismissed, setUpdateDismissed] = useState(false);

  // 즐겨찾기 데이터
  const { favorites } = useFavorites();

  // 자동 업데이트
  const updater = useAutoUpdater();

  const { t } = useI18n();

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
            <h1 className="text-2xl font-bold">IconMaker</h1>
            <p className="text-sm text-muted-foreground">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 검색 / 에디터 뷰 전환 토글 (화면 중앙 배치) */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center rounded-md bg-muted/50 p-1">
              <button
                onClick={() => setMainView('search')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-sm font-medium",
                  mainView === 'search'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t('app.tab.search.title')}
              >
                <SearchIcon className="w-4 h-4" />
                {t('app.tab.search')}
              </button>
              <button
                onClick={() => setMainView('svgWorkspace')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-sm font-medium",
                  mainView === 'svgWorkspace'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={t('app.tab.editor.title')}
              >
                <Palette className="w-4 h-4" />
                {t('app.tab.editor')}
              </button>
              </div>
            </div>

            {/* 검색 전용 컨트롤: 에디터 탭에서는 불필요하므로 숨김 */}
            {mainView === 'search' && (
              <>
                {/* 카테고리 드롭다운 */}
                <CategoryDropdown />
              </>
            )}

            <div className="flex items-center gap-2">
            {/* 즐겨찾기/일괄 내보내기: 검색 전용 */}
            {mainView === 'search' && (
              <>
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                    "hover:bg-muted",
                    showOnlyFavorites && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}
                  title={showOnlyFavorites ? t('app.favorites.showAll') : t('app.favorites.showOnly')}
                >
                  <Star
                    className={cn(
                      "w-5 h-5",
                      showOnlyFavorites && "fill-yellow-500"
                    )}
                  />
                  <span className="text-sm font-medium">
                    {t('app.favorites')} {showOnlyFavorites && `(${favorites.length})`}
                  </span>
                </button>

                {/* 일괄 내보내기 버튼 (즐겨찾기 필터 활성화 시에만 표시) */}
                {showOnlyFavorites && favorites.length > 0 && (
                  <button
                    onClick={() => setShowBatchExport(true)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                      "hover:bg-muted",
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    title={t('app.batchExport.title')}
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {t('app.batchExport')}
                    </span>
                  </button>
                )}
              </>
            )}

            <LicenseButton />
            <SettingsButton />
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {mainView === 'search' ? (
            <>
              {/* 검색 바 */}
              <div className="px-6 py-4 border-b border-border">
                <SearchBar />
              </div>

              {/* 아이콘 그리드 영역 */}
              <div className="flex-1 overflow-hidden p-6">
                <IconGrid
                  onIconClick={setSelectedIcon}
                  showOnlyFavorites={showOnlyFavorites}
                  favorites={favorites}
                  columns={gridColumns}
                  onColumnsChange={setGridColumns}
                />
              </div>
            </>
          ) : (
            <Suspense
              fallback={
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('app.editorLoading')}
                </div>
              }
            >
              <SvgIconPanel />
            </Suspense>
          )}
        </main>

        {/* 내보내기 패널 */}
        <ExportPanel
          iconName={selectedIcon}
          onClose={() => setSelectedIcon(null)}
        />

        {/* 일괄 내보내기 다이얼로그 */}
        <BatchExportDialog
          iconNames={favorites}
          isOpen={showBatchExport}
          onClose={() => setShowBatchExport(false)}
        />

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
