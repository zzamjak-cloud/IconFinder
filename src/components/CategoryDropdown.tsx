import { useEffect, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { iconifyApi } from '@/services/iconifyApi';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

interface Collection {
  prefix: string;
  name: string;
  total: number;
  author?: {
    name: string;
  };
}

/**
 * 아이콘 카테고리(컬렉션) 드롭다운 컴포넌트
 * - Iconify API에서 사용 가능한 모든 아이콘 세트를 가져옴
 * - 선택된 컬렉션의 모든 아이콘을 표시
 * - 검색 기능과 병행 사용 가능
 */
export function CategoryDropdown() {
  const { selectedPrefix, setSelectedPrefix, clearSearch } = useSearchStore();
  const { t, language } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 컬렉션 목록 로드
  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true);
      try {
        const data = await iconifyApi.getCollections();

        // Object를 배열로 변환 및 정렬 (인기도순)
        const collectionsArray = Object.entries(data).map(([prefix, info]: [string, any]) => ({
          prefix,
          name: info.name,
          total: info.total,
          author: info.author,
        }));

        // 아이콘 수가 많은 순으로 정렬
        collectionsArray.sort((a, b) => b.total - a.total);

        setCollections(collectionsArray);
      } catch (error) {
        console.error('Failed to load collections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  const handleSelect = (prefix: string) => {
    if (selectedPrefix === prefix) {
      // 이미 선택된 컬렉션을 다시 클릭하면 해제
      clearSearch();
    } else {
      setSelectedPrefix(prefix);
    }
    setIsOpen(false);
  };

  const selectedCollection = collections.find((c) => c.prefix === selectedPrefix);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
          "border border-input bg-background hover:bg-muted",
          selectedPrefix && "border-primary"
        )}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t('common.loading')}</span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium">
              {selectedCollection ? selectedCollection.name : t('collection.label')}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && !loading && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 드롭다운 컨텐츠 */}
          <div className="absolute top-full mt-2 right-0 z-20 w-80 max-h-96 overflow-y-auto bg-background border border-border rounded-md shadow-lg">
            {/* 전체 보기 옵션 */}
            <button
              onClick={() => {
                clearSearch();
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border",
                !selectedPrefix && "bg-muted"
              )}
            >
              <div className="font-medium text-sm">{t('collection.viewAll')}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('collection.allSets')}
              </div>
            </button>

            {/* 컬렉션 목록 */}
            {collections.slice(0, 50).map((collection) => (
              <button
                key={collection.prefix}
                onClick={() => handleSelect(collection.prefix)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0",
                  selectedPrefix === collection.prefix && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {collection.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t('collection.iconCount', {
                        prefix: collection.prefix,
                        count: collection.total.toLocaleString(language),
                      })}
                      {collection.author && ` • ${collection.author.name}`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
