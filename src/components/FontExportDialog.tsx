import { useMemo, useState } from 'react';
import { AlertCircle, Check, Download, Type } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';
import { resolveErrorMessage } from '@/i18n/errorMessage';
import { exportService } from '@/services/exportService';
import {
  buildIconFont,
  type FontExportResult,
  type FontGlyphInput,
  type FontSkipReason,
} from '@/lib/export/fontGlyph';

export interface FontExportItem {
  name: string;
  /** 스타일 미적용 원본 SVG */
  svg: string;
}

interface FontExportDialogProps {
  items: FontExportItem[];
  isOpen: boolean;
  onClose: () => void;
}

function skipReasonKey(reason: FontSkipReason): `font.skip.${FontSkipReason}` {
  return `font.skip.${reason}`;
}

/**
 * 아이콘 폰트(TTF) 내보내기 다이얼로그
 * - 호환 아이콘만 변환, 비호환은 목록으로 안내
 */
export function FontExportDialog({ items, isOpen, onClose }: FontExportDialogProps) {
  const { t } = useI18n();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FontExportResult | null>(null);
  const [fontFamily, setFontFamily] = useState('IconFinderIcons');

  const previewInputs = useMemo<FontGlyphInput[]>(
    () => items.map((item) => ({ name: item.name, svg: item.svg })),
    [items]
  );

  const resetAndClose = () => {
    setIsWorking(false);
    setError(null);
    setResult(null);
    setFontFamily('IconFinderIcons');
    onClose();
  };

  const handleBuild = async () => {
    setIsWorking(true);
    setError(null);
    try {
      const built = buildIconFont(previewInputs, { fontFamily });
      if (built.converted.length === 0) {
        setResult(built);
        return;
      }
      setResult(built);
    } catch (buildError) {
      setError(
        buildError instanceof Error
          ? resolveErrorMessage(t, buildError)
          : t('font.error.build')
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleSave = async () => {
    if (!result || result.converted.length === 0) return;
    setIsWorking(true);
    setError(null);
    try {
      const base = result.fontFamily.replace(/[^\w-]+/g, '_') || 'IconFinderIcons';
      const ttfPath = await exportService.saveBinaryFile(
        `${base}.ttf`,
        new Uint8Array(result.ttfBytes),
        'ttf'
      );
      if (!ttfPath) {
        setIsWorking(false);
        return;
      }
      await exportService.saveTextFile(`${base}.css`, result.css, 'css');
      await exportService.saveTextFile(`${base}-preview.html`, result.htmlPreview, 'html');
      resetAndClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? resolveErrorMessage(t, saveError)
          : t('font.error.save')
      );
      setIsWorking(false);
    }
  };

  const showResult = result !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            {t('font.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {!showResult && (
            <>
              <p className="text-sm text-muted-foreground">{t('font.hint.style')}</p>
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p className="font-medium">{t('font.summary', { count: items.length })}</p>
                <p className="text-muted-foreground">{t('font.hint.compatible')}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="font-family-input">
                  {t('font.familyLabel')}
                </label>
                <input
                  id="font-family-input"
                  value={fontFamily}
                  onChange={(event) => setFontFamily(event.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          {showResult && result && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
                <Check className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">
                    {t('font.result.converted', { count: result.converted.length })}
                  </p>
                  {result.skipped.length > 0 && (
                    <p className="mt-1">
                      {t('font.result.skipped', { count: result.skipped.length })}
                    </p>
                  )}
                </div>
              </div>

              {result.skipped.length > 0 && (
                <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t('font.result.skippedList')}
                  </p>
                  {result.skipped.map((item) => (
                    <p key={`${item.name}-${item.reason}`} className="text-xs text-destructive">
                      • {item.name} — {t(skipReasonKey(item.reason))}
                    </p>
                  ))}
                </div>
              )}

              {result.converted.length > 0 && (
                <div className="max-h-32 overflow-y-auto p-3 border rounded-lg space-y-1 text-xs">
                  {result.converted.map((item) => (
                    <p key={item.codepoint}>
                      U+{item.codepoint.toString(16).toUpperCase()} · {item.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {!showResult ? (
            <Button onClick={() => void handleBuild()} disabled={isWorking || items.length === 0} className="w-full">
              <Type className="w-4 h-4 mr-2" />
              {isWorking ? t('font.building') : t('font.build')}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={resetAndClose} className="flex-1" disabled={isWorking}>
                {t('common.close')}
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={isWorking || !result || result.converted.length === 0}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {isWorking ? t('font.saving') : t('font.save')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
