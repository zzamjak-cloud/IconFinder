import { Store } from '@tauri-apps/plugin-store';
import { invoke } from '@tauri-apps/api/core';
import { ExportSettings } from '@/types/export';
import { SvgGameIcon, SvgWorkspaceData } from '@/types/svgIcon';
import { isSupportedLanguage, type AppLanguage } from '@/i18n/languageOptions';
import { i18nError } from '@/i18n/errorMessage';
import {
  createDefaultSvgWorkspaceData,
  createSvgIconId,
  ensureUncategorizedCategory,
} from '@/lib/svgIcon/svgIconDefaults';
import {
  buildIconifyPageUrl,
  getIconifyCollectionLabel,
  getIconifyCollectionLicense,
  parseIconifyIconName,
} from '@/lib/svgIcon/svgIconSearch';

// 백업 파일 포맷 버전
// v1: data.favorites(이름 배열)를 별도로 보관하던 IconMaker 포맷
// v2: 즐겨찾기가 보관함 아이콘의 favorite 플래그로 흡수되어 favorites 키가 사라짐
export const SETTINGS_BACKUP_VERSION = 2;

// UI 상태 (그리드 열 수, 사이드바 폭/접힘) — 손상 대비 모든 필드 옵셔널, 읽는 쪽에서 클램프
export interface UiPreferences {
  gridColumns?: number;
  leftWidth?: number;
  leftCollapsed?: boolean;
  rightWidth?: number;
  rightCollapsed?: boolean;
}

// 전체 설정 백업 구조 (읽기는 v1/v2 모두 허용, 쓰기는 항상 v2)
export interface SettingsBackup {
  version: number;
  exportedAt: string;
  data: {
    recentSearches: string[];
    exportSettings: ExportSettings;
    svgWorkspace: SvgWorkspaceData | null;
    language?: AppLanguage;
    /** @deprecated v1 백업에만 존재. 가져오기 시 보관함 라이트 항목으로 변환된다. */
    favorites?: string[];
  };
}

/**
 * v1 백업의 즐겨찾기(아이콘 이름 배열)를 보관함 라이트 항목으로 변환한다.
 * - 저장 위치는 "미분류" 카테고리, favorite 플래그 on.
 * - svg는 ''(라이트 항목) — 최초 표시 시 sourceId로 받아와 채운다.
 * - 워크스페이스 어디에든 같은 sourceId가 이미 있으면 건너뛴다.
 * - 옮길 항목이 없으면 입력 참조를 그대로 반환한다.
 */
function convertLegacyFavorites(
  workspace: SvgWorkspaceData | null,
  favorites: string[]
): SvgWorkspaceData | null {
  const names = Array.from(new Set(favorites.filter((name) => typeof name === 'string' && name.trim())));
  if (names.length === 0) return workspace;

  const base = workspace ?? createDefaultSvgWorkspaceData();
  const existingSourceIds = new Set(
    base.icons.map((icon) => icon.sourceId).filter((id): id is string => Boolean(id))
  );
  const pending = names.filter((name) => !existingSourceIds.has(name));
  if (pending.length === 0) return workspace;

  const { data, category } = ensureUncategorizedCategory(base);
  const now = new Date().toISOString();
  const converted: SvgGameIcon[] = pending.map((sourceId) => {
    const parsed = parseIconifyIconName(sourceId);
    return {
      id: createSvgIconId('svg-icon'),
      categoryId: category.id,
      name: (parsed?.name ?? sourceId).replace(/-/g, ' '),
      prompt: '',
      // 라이트 항목: 이름만 아는 상태
      svg: '',
      tags: [],
      stylePreset: data.stylePreset,
      viewBox: data.defaultViewBox,
      source: 'iconify',
      sourceId,
      sourceName: parsed ? getIconifyCollectionLabel(parsed.prefix) : undefined,
      sourceUrl: buildIconifyPageUrl(sourceId),
      license: parsed ? getIconifyCollectionLicense(parsed.prefix) : undefined,
      favorite: true,
      createdAt: now,
      updatedAt: now,
    };
  });

  const categories = data.categories.map((item) =>
    item.id === category.id
      ? { ...item, iconIds: [...item.iconIds, ...converted.map((icon) => icon.id)], updatedAt: now }
      : item
  );

  return {
    ...data,
    categories,
    icons: [...data.icons, ...converted],
    updatedAt: now,
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
      this.store = await Store.load('iconfinder.json');
    }
    return this.store;
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
   * 최근 검색어 전체 삭제
   */
  async clearRecentSearches(): Promise<void> {
    const store = await this.getStore();
    await store.set('recentSearches', []);
    await store.save();
  }

  /**
   * UI 상태(그리드 열 수, 사이드바 폭/접힘) 가져오기
   */
  async getUiPreferences(): Promise<UiPreferences | null> {
    const store = await this.getStore();
    return (await store.get<UiPreferences>('uiPreferences')) || null;
  }

  /**
   * UI 상태 저장
   */
  async saveUiPreferences(preferences: UiPreferences): Promise<void> {
    const store = await this.getStore();
    await store.set('uiPreferences', preferences);
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
   * 전체 설정을 백업 객체로 수집 (항상 v2)
   * - 최근 검색어, 내보내기 설정, SVG 워크스페이스(카테고리·저장 아이콘·즐겨찾기 플래그), 언어
   */
  async exportAllSettings(): Promise<SettingsBackup> {
    const store = await this.getStore();
    return {
      version: SETTINGS_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        recentSearches: (await store.get<string[]>('recentSearches')) || [],
        exportSettings: await this.getExportSettings(),
        svgWorkspace: (await store.get<SvgWorkspaceData>('svgWorkspace')) ?? null,
        language: (await this.getLanguage()) ?? undefined,
      },
    };
  }

  /**
   * 백업 객체로부터 전체 설정 복원
   * - v2: 그대로 복원
   * - v1(IconMaker): 나머지를 복원한 뒤 favorites(이름 배열)를 워크스페이스 "미분류" 카테고리의
   *   라이트 항목(svg='')으로 변환해 흡수한다. SVG는 최초 표시 시 sourceId로 채운다.
   * - 그 외/형식 불일치: 예외
   */
  async importAllSettings(backup: SettingsBackup): Promise<void> {
    if (!backup || typeof backup !== 'object' || !backup.data) {
      throw i18nError('error.invalidBackup');
    }
    const { favorites, recentSearches, exportSettings, svgWorkspace, language } = backup.data;

    const isLegacyBackup = backup.version === 1 || Array.isArray(favorites);
    if (!isLegacyBackup && backup.version !== SETTINGS_BACKUP_VERSION) {
      throw i18nError('error.invalidBackup');
    }

    const store = await this.getStore();
    if (Array.isArray(recentSearches)) await store.set('recentSearches', recentSearches);
    if (exportSettings) await store.set('exportSettings', exportSettings);
    if (isSupportedLanguage(language)) await store.set('language', language);

    const workspace = isLegacyBackup
      ? convertLegacyFavorites(svgWorkspace ?? null, favorites ?? [])
      : svgWorkspace;
    if (workspace) await store.set('svgWorkspace', workspace);

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
