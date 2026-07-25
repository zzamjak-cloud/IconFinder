import { Search, X } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

/**
 * 아이콘 검색 바 컴포넌트
 * - 실시간 검색 입력
 * - 검색어 클리어 버튼
 * - 400ms debouncing 적용 (useIconSearch 훅에서 처리)
 */
export function SearchBar() {
  const { query, setQuery, clearSearch } = useSearchStore();
  const { t } = useI18n();

  return (
    <div className="relative w-full">
      {/* 검색 아이콘 */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />

      {/* 검색 입력 */}
      <input
        type="text"
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={cn(
          "w-full pl-10 pr-10 py-2 rounded-lg",
          "border border-input bg-background",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "transition-all"
        )}
      />

      {/* 클리어 버튼 */}
      {query && (
        <button
          onClick={clearSearch}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded-md",
            "hover:bg-muted",
            "transition-colors"
          )}
          aria-label={t('search.clear')}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
