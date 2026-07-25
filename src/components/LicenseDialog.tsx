import { useState } from 'react';
import { Scale } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/packs/en';

interface LicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// 큐레이션 컬렉션별 라이선스 정보 (의무 항목은 렌더 시점에 t()로 해석)
const CURATED_LICENSES: Array<{
  name: string;
  license: string;
  noteKey: TranslationKey;
  free: boolean;
}> = [
  { name: 'Lucide', license: 'ISC', noteKey: 'license.note.copyright', free: true },
  { name: 'Tabler Icons', license: 'MIT', noteKey: 'license.note.copyright', free: true },
  { name: 'Iconoir', license: 'MIT', noteKey: 'license.note.copyright', free: true },
  { name: 'Pixelarticons', license: 'MIT', noteKey: 'license.note.copyright', free: true },
  { name: 'Material Design Icons', license: 'Apache 2.0', noteKey: 'license.note.notice', free: true },
  { name: 'Material Symbols', license: 'Apache 2.0', noteKey: 'license.note.notice', free: true },
  { name: 'Noto Emoji', license: 'Apache 2.0', noteKey: 'license.note.notice', free: true },
  { name: 'Game-icons', license: 'CC BY 3.0', noteKey: 'license.note.attribution', free: false },
  { name: 'OpenMoji', license: 'CC BY-SA 4.0', noteKey: 'license.note.shareAlike', free: false },
];

/**
 * 아이콘 라이선스 정책 안내 다이얼로그
 */
export function LicenseDialog({ isOpen, onClose }: LicenseDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-red-600" />
            {t('license.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <p className="text-muted-foreground">{t('license.intro')}</p>

          {/* 큐레이션 컬렉션 라이선스 표 */}
          <div>
            <h3 className="font-semibold mb-2">{t('license.curated.title')}</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t('license.table.collection')}</th>
                    <th className="px-3 py-2 font-semibold">{t('license.table.license')}</th>
                    <th className="px-3 py-2 font-semibold">{t('license.table.commercial')}</th>
                    <th className="px-3 py-2 font-semibold">{t('license.table.obligation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {CURATED_LICENSES.map((row) => (
                    <tr key={row.name} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{row.name}</td>
                      <td className="px-3 py-2">{row.license}</td>
                      <td className="px-3 py-2">
                        {row.free ? t('license.free') : t('license.conditional')}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{t(row.noteKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 라이선스 유형 설명 */}
          <div className="space-y-2">
            <h3 className="font-semibold">{t('license.types.title')}</h3>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <strong className="text-foreground">{t('license.types.permissive.term')}</strong> —{' '}
                {t('license.types.permissive.desc')}
              </li>
              <li>
                <strong className="text-foreground">{t('license.types.ccby.term')}</strong> —{' '}
                {t('license.types.ccby.desc')}
              </li>
              <li>
                <strong className="text-foreground">{t('license.types.ccbysa.term')}</strong> —{' '}
                {t('license.types.ccbysa.desc')}
              </li>
            </ul>
          </div>

          {/* 통합 검색 경고 */}
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1">
              {t('license.unified.title')}
            </h3>
            <ul className="space-y-1 text-red-800 dark:text-red-300 text-xs">
              <li>{t('license.unified.p1')}</li>
              <li>{t('license.unified.p2')}</li>
              <li>{t('license.unified.p3')}</li>
            </ul>
          </div>

          {/* 권장사항 */}
          <div className="space-y-1">
            <h3 className="font-semibold">{t('license.recommend.title')}</h3>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>{t('license.recommend.item1')}</li>
              <li>{t('license.recommend.item2')}</li>
              <li>{t('license.recommend.item3')}</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            {t('license.disclaimer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 라이선스 버튼 (헤더, 설정 버튼 왼쪽) — 눈에 띄는 빨강색
 */
export function LicenseButton() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        title={t('license.title')}
      >
        <Scale className="w-4 h-4" />
        {t('license.button')}
      </button>
      <LicenseDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
