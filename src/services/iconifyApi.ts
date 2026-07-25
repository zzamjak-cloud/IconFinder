import { IconSearchResult, SearchOptions } from '@/types/icon';
import { i18nError } from '@/i18n/errorMessage';

const API_BASE = 'https://api.iconify.design';

/**
 * Iconify API 서비스 클래스
 * 아이콘 검색 및 SVG 다운로드 기능 제공
 */
export class IconifyApiService {
  // 진행 중인 요청을 취소하기 위한 AbortController
  private abortController: AbortController | null = null;

  /**
   * 아이콘 검색
   * @param options 검색 옵션 (query, limit, prefix 등)
   * @returns 검색 결과
   */
  async searchIcons(options: SearchOptions): Promise<IconSearchResult> {
    // 이전 요청 취소
    this.cancelPendingRequest();

    // 새 AbortController 생성
    this.abortController = new AbortController();

    const params = new URLSearchParams({
      query: options.query,
      limit: String(options.limit || 64),
      start: String(options.start || 0),
    });

    if (options.prefix) {
      params.append('prefix', options.prefix);
    }

    try {
      const response = await fetch(
        `${API_BASE}/search?${params}`,
        { signal: this.abortController.signal }
      );

      if (!response.ok) {
        throw i18nError('error.iconSearchFailed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 요청이 취소된 경우 빈 결과 반환
        return { icons: [], total: 0, limit: 0, start: 0 };
      }
      throw error;
    }
  }

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

  /**
   * 진행 중인 요청 취소
   */
  cancelPendingRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const iconifyApi = new IconifyApiService();
