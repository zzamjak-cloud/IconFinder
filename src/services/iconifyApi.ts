import { i18nError } from '@/i18n/errorMessage';

const API_BASE = 'https://api.iconify.design';

/**
 * Iconify API 서비스 클래스
 * SVG 다운로드 및 컬렉션 목록 제공 (검색은 svgIconSearch.ts의 단일 경로 사용)
 */
export class IconifyApiService {
  /**
   * SVG 다운로드
   * @param prefix 아이콘 세트 접두사 (예: "mdi")
   * @param name 아이콘 이름 (예: "home")
   * @returns SVG 문자열
   */
  async getIconSvg(prefix: string, name: string): Promise<string> {
    console.log(`Downloading SVG: ${prefix}/${name}`);
    const response = await fetch(`${API_BASE}/${prefix}/${name}.svg`);

    if (!response.ok) {
      console.error(`SVG download failed with status: ${response.status}`);
      throw i18nError('error.svgDownloadFailed');
    }

    const svgContent = await response.text();
    console.log(`SVG downloaded, length: ${svgContent.length}`);
    console.log('SVG preview:', svgContent.substring(0, 200));

    return svgContent;
  }

  /**
   * 컬렉션 목록 가져오기
   * @returns 사용 가능한 아이콘 컬렉션 목록
   */
  async getCollections(): Promise<any> {
    const response = await fetch(`${API_BASE}/collections`);

    if (!response.ok) {
      throw i18nError('error.collectionsFailed');
    }

    return await response.json();
  }
}

// 싱글톤 인스턴스 내보내기
export const iconifyApi = new IconifyApiService();
