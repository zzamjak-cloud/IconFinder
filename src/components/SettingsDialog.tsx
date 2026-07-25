import { useState, useEffect } from 'react';
import { Settings, Folder, Download, Upload, AlertTriangle } from 'lucide-react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { ExportFormat } from '@/types/export';
import { storageService, SettingsBackup } from '@/services/storageService';
import { useI18n } from '@/i18n/I18nProvider';
import { LANGUAGE_OPTIONS, type AppLanguage } from '@/i18n/languageOptions';
import { i18nError, resolveErrorMessage } from '@/i18n/errorMessage';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 설정 다이얼로그 컴포넌트
 * - 기본 저장 폴더 선택
 * - 자동 저장 옵션
 * - 기본 내보내기 설정
 */
export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { settings, updateSettings, isUpdating } = useSettings();
  const { t, language, setLanguage } = useI18n();

  // 로컬 상태
  const [defaultFolder, setDefaultFolder] = useState(settings.defaultFolder);
  const [defaultFormat, setDefaultFormat] = useState(settings.format);
  const [defaultSize, setDefaultSize] = useState(settings.size);
  const [defaultColor, setDefaultColor] = useState(settings.color);

  // 백업/복원 상태
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<SettingsBackup | null>(null);
  const [restoreFileName, setRestoreFileName] = useState('');

  // settings가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setDefaultFolder(settings.defaultFolder);
    setDefaultFormat(settings.format);
    setDefaultSize(settings.size);
    setDefaultColor(settings.color);
  }, [settings]);

  // 폴더 선택 대화상자
  const handleSelectFolder = async () => {
    const selected = await open({
      directory: true,
      defaultPath: defaultFolder,
      title: t('settings.defaultFolder.dialogTitle'),
    });

    if (selected && typeof selected === 'string') {
      setDefaultFolder(selected);
    }
  };

  // 설정 저장 (autoSave는 항상 true)
  const handleSave = () => {
    updateSettings({
      defaultFolder,
      autoSave: true, // 항상 자동 저장 모드
      format: defaultFormat,
      size: defaultSize,
      color: defaultColor,
    });
    onClose();
  };

  // 설정 초기화
  const handleReset = () => {
    setDefaultFolder('');
    setDefaultFormat('png');
    setDefaultSize(128);
    setDefaultColor('#000000');
  };

  // 전체 설정 백업 파일로 내보내기
  const handleBackupExport = async () => {
    setBackupStatus(null);
    try {
      const backup = await storageService.exportAllSettings();
      const dateTag = new Date().toISOString().slice(0, 10);
      const path = await save({
        defaultPath: `iconfinder-backup-${dateTag}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
        title: t('settings.backup.saveDialogTitle'),
      });
      if (!path) return; // 사용자가 취소
      // 임의 경로 쓰기는 검증된 Rust 커맨드 재사용 (plugin-fs 스코프 제약 회피)
      const bytes = Array.from(new TextEncoder().encode(JSON.stringify(backup, null, 2)));
      await invoke('save_icon_file', { filePath: path, content: bytes });
      const count = backup.data.svgWorkspace?.icons.length ?? 0;
      setBackupStatus(t('settings.backup.saved', { count }));
    } catch (error) {
      setBackupStatus(t('settings.backup.failed', { error: resolveErrorMessage(t, error) }));
    }
  };

  // 복원할 백업 파일 선택 (적용 전 확인 단계)
  const handlePickRestoreFile = async () => {
    setBackupStatus(null);
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
        title: t('settings.backup.openDialogTitle'),
      });
      if (!selected || typeof selected !== 'string') return;
      const text = await invoke<string>('read_text_file', { filePath: selected });
      const parsed = JSON.parse(text) as SettingsBackup;
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        throw i18nError('error.backupInvalidFormat');
      }
      setPendingRestore(parsed);
      setRestoreFileName(selected.split(/[\\/]/).pop() || selected);
    } catch (error) {
      setBackupStatus(t('settings.backup.readFailed', { error: resolveErrorMessage(t, error) }));
    }
  };

  // 복원 적용 → 모든 상태 재로딩을 위해 앱 새로고침
  const handleConfirmRestore = async () => {
    if (!pendingRestore) return;
    try {
      await storageService.importAllSettings(pendingRestore);
      window.location.reload();
    } catch (error) {
      setBackupStatus(t('settings.backup.restoreFailed', { error: resolveErrorMessage(t, error) }));
      setPendingRestore(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 일반 */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('settings.general')}</h3>

            {/* 언어 선택: 저장 버튼과 무관하게 선택 즉시 적용된다 */}
            <div className="space-y-2">
              <Label>{t('language.title')}</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as AppLanguage)}
              >
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {`${option.flag} ${option.nativeName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('language.help')}</p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-border" />

          {/* 기본 저장 폴더 */}
          <div className="space-y-2">
            <Label>{t('settings.defaultFolder')}</Label>
            <div className="flex gap-2">
              <Input
                value={defaultFolder}
                readOnly
                placeholder={t('settings.defaultFolder.placeholder')}
                className="flex-1"
              />
              <Button onClick={handleSelectFolder} variant="outline">
                <Folder className="w-4 h-4 mr-2" />
                {t('common.select')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.defaultFolder.help')}
            </p>
          </div>

          {/* 구분선 */}
          <div className="border-t border-border" />

          {/* 기본 내보내기 설정 */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('settings.exportDefaults')}</h3>

            {/* 기본 포맷 */}
            <div className="space-y-2">
              <Label>{t('settings.format')}</Label>
              <Select
                value={defaultFormat}
                onValueChange={(v) => setDefaultFormat(v as ExportFormat)}
              >
                <SelectContent>
                  <SelectItem value="svg">{t('format.svg')}</SelectItem>
                  <SelectItem value="png">{t('format.png')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 기본 PNG 크기 */}
            <div className="space-y-2">
              <Label>{t('settings.pngSize')}</Label>
              <Select
                value={String(defaultSize)}
                onValueChange={(v) => setDefaultSize(Number(v))}
              >
                <SelectContent>
                  <SelectItem value="64">64x64</SelectItem>
                  <SelectItem value="128">128x128</SelectItem>
                  <SelectItem value="256">256x256</SelectItem>
                  <SelectItem value="512">512x512</SelectItem>
                  <SelectItem value="1024">1024x1024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 기본 색상 */}
            <div className="space-y-2">
              <Label>{t('settings.color')}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={defaultColor}
                  onChange={(e) => setDefaultColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={defaultColor}
                  onChange={(e) => setDefaultColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-border" />

          {/* 백업 및 복원 */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t('settings.backup')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('settings.backup.help')}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleBackupExport} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {t('settings.backup.export')}
              </Button>
              <Button onClick={handlePickRestoreFile} variant="outline" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                {t('settings.backup.import')}
              </Button>
            </div>

            {/* 복원 확인 (적용 시 현재 설정 덮어쓰기) */}
            {pendingRestore && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                      {t('settings.backup.restoreWarning', { fileName: restoreFileName })}
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleConfirmRestore} size="sm">
                        {t('settings.backup.restoreApply')}
                      </Button>
                      <Button
                        onClick={() => {
                          setPendingRestore(null);
                          setRestoreFileName('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {backupStatus && (
              <p className="text-xs text-muted-foreground">{backupStatus}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button onClick={handleReset} variant="outline">
              {t('common.reset')}
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 설정 버튼 컴포넌트 (헤더에 표시)
 */
export function SettingsButton() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        aria-label={t('settings.button.aria')}
      >
        <Settings className="w-5 h-5" />
      </Button>
      <SettingsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
