import { useState, useEffect } from 'react';
import { Download, Check, X as XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExport } from '@/hooks/useExport';
import { useSettings } from '@/hooks/useSettings';
import { useIconDetails } from '@/hooks/useIconDetails';
import { useI18n } from '@/i18n/I18nProvider';
import { ExportFormat } from '@/types/export';

interface ExportPanelProps {
  iconName: string | null; // "prefix:name" 형식
  onClose: () => void;
}

/**
 * 내보내기 패널 컴포넌트
 * - 포맷 선택 (SVG/PNG)
 * - PNG 크기 선택
 * - 색상 피커
 * - 설정 저장 옵션
 * - 빠른 내보내기 버튼
 */
export function ExportPanel({ iconName, onClose }: ExportPanelProps) {
  const { exportIcon, isExporting, isSuccess, isError, reset } = useExport();
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();

  // 아이콘 정보 파싱
  const [prefix, name] = iconName?.split(':') || ['', ''];
  const { data: svg } = useIconDetails(prefix, name);

  // 로컬 상태 (실시간 프리뷰용)
  const [format, setFormat] = useState<ExportFormat>(settings.format);
  const [size, setSize] = useState(settings.size);
  const [color, setColor] = useState(settings.color);
  const [saveSettings, setSaveSettings] = useState(false);

  // 아이콘이 변경되면 상태 초기화
  useEffect(() => {
    reset();
  }, [iconName, reset]);

  // 설정이 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setFormat(settings.format);
    setSize(settings.size);
    setColor(settings.color);
  }, [settings]);

  // 성공 시 자동 닫기
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [isSuccess, onClose]);

  const handleExport = async () => {
    if (!iconName) return;

    // 설정 저장 옵션
    if (saveSettings) {
      updateSettings({ format, size, color });
    }

    // 기본 폴더가 설정되어 있으면 자동 저장 활성화
    const hasDefaultFolder = !!settings.defaultFolder;
    if (hasDefaultFolder) {
      await updateSettings({ ...settings, autoSave: true, format, size, color });
    }

    // 내보내기 실행
    exportIcon({
      prefix,
      name,
      options: { format, size, color },
    });
  };

  if (!iconName) return null;

  return (
    <Dialog open={!!iconName} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('export.title')}</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 프리뷰 */}
          <div className="flex items-center justify-center p-8 border rounded-lg bg-muted">
            <div
              className="w-24 h-24 flex items-center justify-center"
              style={{ color }}
              dangerouslySetInnerHTML={{ __html: svg || '' }}
            />
          </div>

          {/* 아이콘 정보 */}
          <div className="text-center">
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{prefix}</p>
          </div>

          {/* 포맷 선택 */}
          <div className="space-y-2">
            <Label>{t('export.format')}</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectContent>
                <SelectItem value="svg">{t('format.svg')}</SelectItem>
                <SelectItem value="png">{t('format.png')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PNG 크기 (PNG 선택 시) */}
          {format === 'png' && (
            <div className="space-y-2">
              <Label>{t('export.size')}</Label>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                <SelectContent>
                  <SelectItem value="64">64x64</SelectItem>
                  <SelectItem value="128">128x128</SelectItem>
                  <SelectItem value="256">256x256</SelectItem>
                  <SelectItem value="512">512x512</SelectItem>
                  <SelectItem value="1024">1024x1024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 색상 선택 */}
          <div className="space-y-2">
            <Label>{t('export.color')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          {/* 설정 저장 체크박스 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="save-settings"
              checked={saveSettings}
              onChange={(e) => setSaveSettings(e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <Label htmlFor="save-settings" className="cursor-pointer">
              {t('export.saveAsDefault')}
            </Label>
          </div>

          {/* 상태 메시지 */}
          {isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
              <Check className="w-5 h-5" />
              <span className="text-sm">{t('export.success')}</span>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <XIcon className="w-5 h-5" />
              <span className="text-sm">{t('export.failed')}</span>
            </div>
          )}

          {/* 내보내기 버튼 */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? t('export.exporting') : t('export.action')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
