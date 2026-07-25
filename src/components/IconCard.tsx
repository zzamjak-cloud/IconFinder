import { Star } from 'lucide-react';
import { useIconDetails } from '@/hooks/useIconDetails';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

interface IconCardProps {
  iconName: string;  // 형식: "prefix:name" (예: "mdi:home")
  onClick?: () => void;
}

/**
 * 개별 아이콘을 표시하는 카드 컴포넌트
 * - 아이콘 SVG를 표시
 * - 아이콘 이름과 prefix 표시
 * - 즐겨찾기 버튼
 * - 클릭 시 상세 정보 또는 내보내기 패널 표시
 */
export function IconCard({ iconName, onClick }: IconCardProps) {
  // "mdi:home" 형식을 "mdi"와 "home"으로 분리
  const [prefix, name] = iconName.split(':');
  const { t } = useI18n();

  // SVG 데이터 가져오기
  const { data: svg, isLoading, error } = useIconDetails(prefix, name);

  // 즐겨찾기 상태
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(iconName);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative border rounded-lg p-4 transition-all cursor-pointer",
        "hover:shadow-md hover:border-primary",
        "bg-card text-card-foreground",
        "h-full flex flex-col" // 셀 높이를 가득 채워 그리드 비율에 맞춰 스케일
      )}
    >
      {/* 즐겨찾기 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(iconName);
        }}
        className={cn(
          "absolute top-2 right-2 p-1.5 rounded-md",
          "hover:bg-muted transition-colors z-10",
          favorite && "text-yellow-500"
        )}
        aria-label={favorite ? t('favorites.remove') : t('favorites.add')}
      >
        <Star
          className={cn(
            "w-4 h-4",
            favorite && "fill-yellow-500"
          )}
        />
      </button>

      {/* 아이콘 표시 영역 — flex-1로 셀 높이에 맞춰 가변 */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {isLoading && (
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
        )}
        {error && (
          <div className="text-xs text-destructive text-center">
            {t('icon.loadFailed')}
          </div>
        )}
        {svg && (
          <div
            className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      {/* 아이콘 이름 */}
      <div className="w-full text-center space-y-0.5 mt-2 shrink-0">
        <p className="text-sm font-medium truncate" title={name}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {prefix}
        </p>
      </div>
    </div>
  );
}
