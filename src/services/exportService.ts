import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { iconifyApi } from './iconifyApi';
import { storageService } from './storageService';
import { ExportOptions } from '@/types/export';
import { i18nError } from '@/i18n/errorMessage';
import { loadSvgImage, normalizeSvgForRaster, rasterizePng } from '@/lib/export/rasterize';
import {
  type ResolutionPresetId,
  resolveResolutionPreset,
} from '@/lib/export/resolutionPresets';

/**
 * 아이콘 내보내기 서비스
 * - SVG/PNG 내보내기
 * - 색상 변경
 * - 파일 저장
 */
export class ExportService {
  /**
   * 아이콘 내보내기 (메인 함수)
   * @param prefix 아이콘 세트 (예: "mdi")
   * @param name 아이콘 이름 (예: "home")
   * @param options 내보내기 옵션
   */
  async exportIcon(
    prefix: string,
    name: string,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    try {
      // 설정 가져오기
      const settings = await storageService.getExportSettings();
      console.log('Export settings:', settings);

      // 최종 옵션 결정
      const exportOptions: Required<ExportOptions> = {
        format: options?.format || settings.format,
        size: options?.size || settings.size,
        color: options?.color || settings.color,
        fileName: options?.fileName || `${prefix}-${name}`,
      };
      console.log('Export options:', exportOptions);

      // SVG 다운로드
      let svgContent = await iconifyApi.getIconSvg(prefix, name);
      console.log('SVG content length:', svgContent?.length);
      if (!svgContent) {
        throw i18nError('error.svgDownloadFailed');
      }

      // SVG 크기 속성 정리 (1em 같은 상대 단위 제거)
      // viewBox에서 실제 크기를 추출하여 사용
      svgContent = normalizeSvgForRaster(svgContent);
      console.log('Normalized SVG:', svgContent.substring(0, 200));

      // 색상 변경 (currentColor를 실제 색상으로 변경)
      if (exportOptions.color) {
        console.log('Changing color to:', exportOptions.color);
        svgContent = await invoke<string>('change_svg_color', {
          svgContent,
          newColor: exportOptions.color,
        });
        console.log('Color changed, new SVG length:', svgContent.length);
        console.log('SVG after color change:', svgContent.substring(0, 300));
      }

      // 파일 경로 결정 (모든 포맷)
      const filePath = await this.getFilePath(exportOptions, settings);
      console.log('File path:', filePath);
      if (!filePath) {
        throw i18nError('error.noFilePath');
      }

      // 포맷에 따라 저장
      if (exportOptions.format === 'svg') {
        console.log('Saving as SVG');
        await this.saveSvg(filePath, svgContent);
      } else if (exportOptions.format === 'png') {
        console.log('Converting to PNG using canvas, size:', exportOptions.size);
        await this.savePngViaCanvas(filePath, svgContent, exportOptions.size, exportOptions.color);
      }
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  /**
   * 파일 경로 결정 (대화상자 또는 자동 저장)
   */
  private async getFilePath(
    options: Required<ExportOptions>,
    settings: any
  ): Promise<string | null> {
    return this.resolveSavePath(`${options.fileName}.${options.format}`, options.format, settings);
  }

  /**
   * 저장 위치 결정 공통 로직 (자동 저장 폴더 또는 저장 대화상자)
   * @returns 결정된 경로, 취소 시 null
   */
  private async resolveSavePath(
    fileName: string,
    extension: string,
    settings: any
  ): Promise<string | null> {
    // 자동 저장 모드
    if (settings.autoSave && settings.defaultFolder) {
      return `${settings.defaultFolder}/${fileName}`;
    }

    // 대화상자 표시
    return await save({
      defaultPath: settings.defaultFolder
        ? `${settings.defaultFolder}/${fileName}`
        : fileName,
      filters: [{
        name: extension.toUpperCase(),
        extensions: [extension],
      }],
    });
  }

  /**
   * 텍스트 파일 저장 (SVG/HTML 스니펫 등)
   * - 기존 SVG 내보내기와 동일한 저장 위치 정책(자동저장 폴더 또는 저장 대화상자) 재사용
   * - 텍스트를 바이트로 변환해 save_icon_file Tauri command로 저장
   * @returns 저장된 파일 경로, 취소 시 null
   */
  async saveTextFile(fileName: string, text: string, extension: string): Promise<string | null> {
    const settings = await storageService.getExportSettings();

    // 전달받은 fileName이 확장자를 포함하지 않으면 부여한다.
    const fullFileName = fileName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
      ? fileName
      : `${fileName}.${extension}`;

    const filePath = await this.resolveSavePath(fullFileName, extension, settings);
    if (!filePath) {
      return null;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    await invoke('save_icon_file', {
      filePath,
      content: Array.from(data),
    });

    return filePath;
  }

  /**
   * 바이너리 파일 저장 (TTF 등)
   */
  async saveBinaryFile(
    fileName: string,
    bytes: Uint8Array,
    extension: string
  ): Promise<string | null> {
    const settings = await storageService.getExportSettings();
    const fullFileName = fileName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
      ? fileName
      : `${fileName}.${extension}`;
    const filePath = await this.resolveSavePath(fullFileName, extension, settings);
    if (!filePath) return null;
    await invoke('save_icon_file', {
      filePath,
      content: Array.from(bytes),
    });
    return filePath;
  }

  /**
   * SVG 콘텐츠를 PNG로 저장
   * - 저장 위치 정책(자동저장 폴더 또는 저장 대화상자)은 기존 로직 재사용
   * - Canvas로 래스터화하므로 SVG 필터(효과)가 그대로 PNG에 반영됨
   * @returns 저장된 파일 경로, 취소 시 null
   */
  async saveSvgAsPng(fileName: string, svgContent: string, size: number): Promise<string | null> {
    const settings = await storageService.getExportSettings();
    const base = fileName.replace(/\.(svg|png)$/i, '');
    const filePath = await this.resolveSavePath(`${base}.png`, 'png', settings);
    if (!filePath) return null;
    await this.savePngViaCanvas(filePath, normalizeSvgForRaster(svgContent), size, '');
    return filePath;
  }

  /**
   * SVG를 PNG 바이트로 래스터화 (파일 저장·클립보드·다중 해상도 공용)
   */
  async renderSvgToPngBytes(svgContent: string, size: number): Promise<Uint8Array> {
    const img = await loadSvgImage(svgContent);
    return rasterizePng(img, size);
  }

  /**
   * 다중 해상도 일괄 저장
   * - SVG 1회 로드 후 크기별 래스터화
   * - autoSave+defaultFolder 필수 (폴더 구조 생성)
   * @returns 저장된 파일 수
   */
  async exportIconMultiRes(
    fileName: string,
    svgContent: string,
    presetId: ResolutionPresetId,
    baseSize: number,
    onEntrySaved?: () => void
  ): Promise<number> {
    const settings = await storageService.getExportSettings();
    if (!settings.autoSave || !settings.defaultFolder) {
      throw i18nError('batch.error.noFolder');
    }

    const preset = resolveResolutionPreset(presetId, fileName, baseSize);
    if (!preset) {
      throw i18nError('batch.error.noIcons');
    }

    const img = await loadSvgImage(svgContent);
    let saved = 0;

    for (const entry of preset.entries) {
      const filePath = `${settings.defaultFolder}/${entry.relativePath}`;
      const pngBytes = await rasterizePng(img, entry.size);
      await invoke('save_icon_file', {
        filePath,
        content: Array.from(pngBytes),
      });
      saved += 1;
      onEntrySaved?.();
    }

    if (preset.contentsJson && preset.contentsJsonPath) {
      const jsonPath = `${settings.defaultFolder}/${preset.contentsJsonPath}`;
      const encoder = new TextEncoder();
      await invoke('save_icon_file', {
        filePath: jsonPath,
        content: Array.from(encoder.encode(preset.contentsJson)),
      });
    }

    return saved;
  }

  /**
   * 앱 아이콘 패키지(.ico / .icns) 내보내기
   * - Canvas로 PNG 생성 후 Rust가 컨테이너만 패키징
   */
  async exportAppIcon(
    fileName: string,
    svgContent: string,
    target: 'ico' | 'icns'
  ): Promise<string | null> {
    const settings = await storageService.getExportSettings();
    const sizes =
      target === 'ico'
        ? [16, 32, 48, 64, 128, 256]
        : [16, 32, 64, 128, 256, 512, 1024];

    const img = await loadSvgImage(svgContent);
    const entries: Array<{ size: number; png: number[] }> = [];
    for (const size of sizes) {
      const pngBytes = await rasterizePng(img, size);
      entries.push({ size, png: Array.from(pngBytes) });
    }

    const base = fileName.replace(/\.(svg|png|ico|icns)$/i, '');
    const extension = target;
    const filePath = await this.resolveSavePath(`${base}.${extension}`, extension, {
      ...settings,
      // 단건 액션: 대화상자 허용 (autoSave면 기본 폴더)
    });
    if (!filePath) return null;

    await invoke(target === 'ico' ? 'create_ico' : 'create_icns', {
      entries,
      filePath,
    });
    return filePath;
  }

  /**
   * SVG 저장
   */
  private async saveSvg(filePath: string, content: string): Promise<void> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    await invoke('save_icon_file', {
      filePath,
      content: Array.from(data),
    });
  }

  /**
   * PNG 저장 (Canvas 래스터화 → Rust 파일 쓰기)
   */
  private async savePngViaCanvas(
    filePath: string,
    svgContent: string,
    size: number,
    _color: string
  ): Promise<void> {
    const pngBytes = await this.renderSvgToPngBytes(svgContent, size);
    await invoke('save_icon_file', {
      filePath,
      content: Array.from(pngBytes),
    });
  }

  /**
   * 일괄 내보내기
   */
  async exportMultiple(
    icons: Array<{ prefix: string; name: string }>,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    for (const icon of icons) {
      await this.exportIcon(icon.prefix, icon.name, options);
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const exportService = new ExportService();
