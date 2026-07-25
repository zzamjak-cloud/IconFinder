import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { iconifyApi } from './iconifyApi';
import { storageService } from './storageService';
import { ExportOptions } from '@/types/export';
import { i18nError } from '@/i18n/errorMessage';

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
      svgContent = this.normalizeSvgSize(svgContent);
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
    await this.savePngViaCanvas(filePath, this.normalizeSvgSize(svgContent), size, '');
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
   * PNG 저장 (Canvas를 사용하여 브라우저에서 변환)
   */
  private async savePngViaCanvas(
    filePath: string,
    svgContent: string,
    size: number,
    _color: string
  ): Promise<void> {
    console.log('Canvas PNG conversion started, size:', size);
    console.log('SVG preview:', svgContent.substring(0, 200));

    // SVG를 data URL로 변환 (Blob URL보다 호환성 좋음)
    const img = new Image();
    const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
    console.log('Created data URL for SVG');

    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
        resolve(null);
      };
      img.onerror = (e) => {
        console.error('Image load error:', e);
        console.error('Failed SVG content:', svgContent);
        reject(new Error('Failed to load SVG as image'));
      };
      img.src = dataUrl;
    });

    // Canvas에 그리기
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    console.log('Canvas created:', size, 'x', size);

    // 투명 배경
    ctx.clearRect(0, 0, size, size);

    // SVG 그리기
    ctx.drawImage(img, 0, 0, size, size);
    console.log('Image drawn to canvas');

    // 픽셀 데이터 확인
    const imageData = ctx.getImageData(0, 0, size, size);
    const pixelCount = imageData.data.filter((_, i) => i % 4 === 3 && imageData.data[i] > 0).length;
    console.log('Non-transparent pixels in canvas:', pixelCount);

    if (pixelCount === 0) {
      console.error('WARNING: Canvas has no visible pixels!');
    }

    // PNG로 변환
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    console.log('PNG blob created, size:', blob.size, 'bytes');

    const arrayBuffer = await blob.arrayBuffer();
    const pngData = Array.from(new Uint8Array(arrayBuffer));

    console.log('Sending PNG data to Rust for file save, size:', pngData.length, 'bytes');
    await invoke('save_icon_file', {
      filePath,
      content: pngData,
    });
    console.log('File saved successfully via Canvas method');
  }

  /**
   * SVG 크기 속성 정규화
   * - "1em" 같은 상대 단위를 제거
   * - viewBox에서 실제 크기를 추출하여 width/height로 설정
   * - xmlns 속성이 없으면 추가 (이미지 로드에 필수)
   */
  private normalizeSvgSize(svg: string): string {
    let normalized = svg;

    // xmlns 속성이 없으면 추가 (이미지로 로드할 때 필수)
    if (!normalized.includes('xmlns=')) {
      normalized = normalized.replace(
        /<svg(\s|>)/,
        '<svg xmlns="http://www.w3.org/2000/svg"$1'
      );
      console.log('Added xmlns attribute to SVG');
    }

    // viewBox 추출
    const viewBoxMatch = normalized.match(/viewBox=["']([^"']+)["']/);
    if (!viewBoxMatch) {
      console.warn('No viewBox found, using default size 24x24');
      // viewBox가 없으면 기본 크기 설정
      return normalized.replace(/<svg([^>]*)>/, '<svg$1 width="24" height="24">');
    }

    // viewBox 형식: "x y width height" (예: "0 0 24 24")
    const viewBoxParts = viewBoxMatch[1].split(/\s+/);
    const width = viewBoxParts[2];
    const height = viewBoxParts[3];

    console.log(`Extracted viewBox dimensions: ${width}x${height}`);

    // 기존 width/height 속성 제거
    normalized = normalized.replace(/\s+width=["'][^"']*["']/g, '');
    normalized = normalized.replace(/\s+height=["'][^"']*["']/g, '');

    // 새 width/height 추가 (공백 포함)
    normalized = normalized.replace(
      /<svg(\s|>)/,
      `<svg width="${width}" height="${height}"$1`
    );

    console.log('Normalized SVG:', normalized.substring(0, 150));
    return normalized;
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
