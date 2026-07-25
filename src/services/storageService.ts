import { Store } from '@tauri-apps/plugin-store';
import { invoke } from '@tauri-apps/api/core';
import { ExportSettings } from '@/types/export';
import { SvgWorkspaceData } from '@/types/svgIcon';
import { isSupportedLanguage, type AppLanguage } from '@/i18n/languageOptions';
import { i18nError } from '@/i18n/errorMessage';

// 백업 파일 포맷 버전 (향후 마이그레이션 대비)
export const SETTINGS_BACKUP_VERSION = 1;

// 전체 설정 백업 구조
export interface SettingsBackup {
  version: number;
  exportedAt: string;
  data: {
    favorites: string[];
    recentSearches: string[];
    exportSettings: ExportSettings;
    svgWorkspace: SvgWorkspaceData | null;
    language?: AppLanguage;
  };
}

/**
 * Tauri Store를 사용한 데이터 영속성 서비스
 */
export class StorageService {
  private store: Store | null = null;

  /**
   * Store 인스턴스 가져오기 (lazy initialization)
   */
  private async getStore(): Promise<Store> {
    if (!this.store) {
      this.store = await Store.load('iconmaker.json');
    }
    return this.store;
  }

  /**
   * 즐겨찾기 목록 가져오기
   */
  async getFavorites(): Promise<string[]> {
    const store = await this.getStore();
    return (await store.get<string[]>('favorites')) || [];
  }

  /**
   * 즐겨찾기 목록 저장
   */
  async saveFavorites(favorites: string[]): Promise<void> {
    const store = await this.getStore();
    await store.set('favorites', favorites);
    await store.save();
  }

  /**
   * 즐겨찾기 추가
   */
  async addFavorite(iconName: string): Promise<void> {
    console.log('Adding favorite:', iconName);
    const favorites = await this.getFavorites();
    if (!favorites.includes(iconName)) {
      const newFavorites = [...favorites, iconName];
      await this.saveFavorites(newFavorites);
      console.log('Favorite added successfully. Total favorites:', newFavorites.length);
    } else {
      console.log('Icon already in favorites');
    }
  }

  /**
   * 즐겨찾기 제거
   */
  async removeFavorite(iconName: string): Promise<void> {
    console.log('Removing favorite:', iconName);
    const favorites = await this.getFavorites();
    const newFavorites = favorites.filter(f => f !== iconName);
    await this.saveFavorites(newFavorites);
    console.log('Favorite removed successfully. Total favorites:', newFavorites.length);
  }

  /**
   * 최근 검색어 가져오기
   */
  async getRecentSearches(): Promise<string[]> {
    const store = await this.getStore();
    return (await store.get<string[]>('recentSearches')) || [];
  }

  /**
   * 최근 검색어 추가
   */
  async addRecentSearch(query: string): Promise<void> {
    const store = await this.getStore();
    const searches = await this.getRecentSearches();
    const filtered = searches.filter(s => s !== query);
    await store.set('recentSearches', [query, ...filtered].slice(0, 10));
    await store.save();
  }

  /**
   * 내보내기 설정 가져오기
   */
  async getExportSettings(): Promise<ExportSettings> {
    const store = await this.getStore();
    return (await store.get<ExportSettings>('exportSettings')) || {
      defaultFolder: '',
      format: 'png',
      size: 128,
      color: '#000000',
      autoSave: true, // 항상 자동 저장 모드
    };
  }

  /**
   * 내보내기 설정 저장
   */
  async saveExportSettings(settings: ExportSettings): Promise<void> {
    const store = await this.getStore();
    await store.set('exportSettings', settings);
    await store.save();
  }

  /**
   * 표시 언어 가져오기
   * - 사용자가 한 번도 선택하지 않았으면 null (I18nProvider가 OS Locale로 감지)
   */
  async getLanguage(): Promise<AppLanguage | null> {
    const store = await this.getStore();
    const value = await store.get<string>('language');
    return isSupportedLanguage(value) ? value : null;
  }

  /**
   * 표시 언어 저장
   */
  async saveLanguage(language: AppLanguage): Promise<void> {
    const store = await this.getStore();
    await store.set('language', language);
    await store.save();
  }

  /**
   * SVG 워크스페이스 가져오기
   * - 저장된 적이 없으면 null 반환 (훅에서 기본값 초기화)
   */
  async getSvgWorkspace(): Promise<SvgWorkspaceData | null> {
    const store = await this.getStore();
    return (await store.get<SvgWorkspaceData>('svgWorkspace')) ?? null;
  }

  /**
   * SVG 워크스페이스 저장
   */
  async saveSvgWorkspace(data: SvgWorkspaceData): Promise<void> {
    const store = await this.getStore();
    await store.set('svgWorkspace', data);
    await store.save();
  }

  /**
   * 전체 설정을 백업 객체로 수집
   * - 즐겨찾기, 최근 검색어, 내보내기 설정, SVG 워크스페이스(카테고리·저장 아이콘 포함)
   */
  async exportAllSettings(): Promise<SettingsBackup> {
    const store = await this.getStore();
    return {
      version: SETTINGS_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        favorites: (await store.get<string[]>('favorites')) || [],
        recentSearches: (await store.get<string[]>('recentSearches')) || [],
        exportSettings: await this.getExportSettings(),
        svgWorkspace: (await store.get<SvgWorkspaceData>('svgWorkspace')) ?? null,
        language: (await this.getLanguage()) ?? undefined,
      },
    };
  }

  /**
   * 백업 객체로부터 전체 설정 복원
   * - 존재하는 키만 덮어쓰며, 형식이 올바르지 않으면 예외
   */
  async importAllSettings(backup: SettingsBackup): Promise<void> {
    if (!backup || typeof backup !== 'object' || !backup.data) {
      throw i18nError('error.invalidBackup');
    }
    const store = await this.getStore();
    const { favorites, recentSearches, exportSettings, svgWorkspace, language } = backup.data;
    if (Array.isArray(favorites)) await store.set('favorites', favorites);
    if (Array.isArray(recentSearches)) await store.set('recentSearches', recentSearches);
    if (exportSettings) await store.set('exportSettings', exportSettings);
    if (svgWorkspace) await store.set('svgWorkspace', svgWorkspace);
    if (isSupportedLanguage(language)) await store.set('language', language);
    await store.save();
  }

  /**
   * 기본 저장 폴더 초기화
   * - 시스템 다운로드 폴더에 Download_Icon 폴더 생성
   * - 기본 폴더가 비어있을 때만 설정
   */
  async initializeDefaultFolder(): Promise<void> {
    try {
      const currentSettings = await this.getExportSettings();

      // 이미 기본 폴더가 설정되어 있으면 건너뛰기
      if (currentSettings.defaultFolder) {
        console.log('Default folder already set:', currentSettings.defaultFolder);
        return;
      }

      // Rust 명령어로 Download_Icon 폴더 생성 및 경로 가져오기
      const folderPath = await invoke<string>('setup_default_folder');
      console.log('Default folder initialized:', folderPath);

      // 설정에 저장
      await this.saveExportSettings({
        ...currentSettings,
        defaultFolder: folderPath,
      });

      console.log('Default folder saved to settings');
    } catch (error) {
      console.error('Failed to initialize default folder:', error);
      // 에러가 발생해도 앱 실행을 방해하지 않음
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const storageService = new StorageService();
