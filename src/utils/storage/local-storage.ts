/**
 * Type-safe localStorage wrapper with predefined keys
 */

/**
 * All available localStorage keys
 */
export const STORAGE_KEYS = {
  // User related
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  USER_PREFERENCES: 'user_preferences',

  // Document related
  RECENT_DOCUMENTS: 'recent_documents',
  DOCUMENT_DRAFTS: 'document_drafts',
  DOCUMENT_SETTINGS: 'document_settings',

  // Editor related
  EDITOR_THEME: 'editor_theme',
  EDITOR_FONT_SIZE: 'editor_font_size',
  EDITOR_LAYOUT: 'editor_layout',

  // App settings
  APP_LANGUAGE: 'app_language',
  APP_THEME: 'app_theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  DASHBOARD_TOUR_COMPLETED: 'dashboard_tour_completed',

  // Temporary data
  TEMP_DATA: 'temp_data',
  CACHE_TIMESTAMP: 'cache_timestamp',

  // API configuration
  API_KEYS: 'docflow_api_keys',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Storage value type mappings
 */
export interface StorageValueMap {
  [STORAGE_KEYS.USER_TOKEN]: string;
  [STORAGE_KEYS.USER_INFO]: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  [STORAGE_KEYS.USER_PREFERENCES]: {
    notifications: boolean;
    autoSave: boolean;
    darkMode: boolean;
  };
  [STORAGE_KEYS.RECENT_DOCUMENTS]: Array<{
    id: string;
    title: string;
    lastModified: string;
  }>;
  [STORAGE_KEYS.DOCUMENT_DRAFTS]: Record<string, any>;
  [STORAGE_KEYS.DOCUMENT_SETTINGS]: {
    autoSave: boolean;
    saveInterval: number;
  };
  [STORAGE_KEYS.EDITOR_THEME]: 'light' | 'dark' | 'auto';
  [STORAGE_KEYS.EDITOR_FONT_SIZE]: number;
  [STORAGE_KEYS.EDITOR_LAYOUT]: 'default' | 'focus' | 'typewriter';
  [STORAGE_KEYS.APP_LANGUAGE]: 'zh-CN' | 'en-US';
  [STORAGE_KEYS.APP_THEME]: 'light' | 'dark' | 'system';
  [STORAGE_KEYS.SIDEBAR_COLLAPSED]: boolean;
  [STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED]: boolean;
  [STORAGE_KEYS.TEMP_DATA]: any;
  [STORAGE_KEYS.CACHE_TIMESTAMP]: number;
  [STORAGE_KEYS.API_KEYS]: {
    siliconflow?: string;
    minimax?: string;
    openai?: string;
    anthropic?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Type-safe localStorage manager
 */
class LocalStorageManager {
  /**
   * Set localStorage value
   * @param key - Storage key
   * @param value - Value to store
   */
  set<K extends keyof StorageValueMap>(key: K, value: StorageValueMap[K]): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to set localStorage item "${key}":`, error);
    }
  }

  /**
   * Get localStorage value
   * @param key - Storage key
   * @param defaultValue - Default value if key not found
   * @returns Stored value or default value
   */
  get<K extends keyof StorageValueMap>(
    key: K,
    defaultValue?: StorageValueMap[K],
  ): StorageValueMap[K] | undefined {
    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return defaultValue;
      }

      return JSON.parse(item) as StorageValueMap[K];
    } catch (error) {
      console.error(`Failed to get localStorage item "${key}":`, error);

      return defaultValue;
    }
  }

  /**
   * Remove localStorage item
   * @param key - Storage key
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item "${key}":`, error);
    }
  }

  /**
   * Check if key exists
   * @param key - Storage key
   * @returns True if key exists
   */
  has(key: StorageKey): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Clear all localStorage data
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Get all defined keys that exist
   * @returns Array of existing keys
   */
  getAllKeys(): StorageKey[] {
    const allKeys = Object.values(STORAGE_KEYS);

    return allKeys.filter((key) => this.has(key));
  }

  /**
   * Get approximate storage size
   * @returns Storage size in characters
   */
  getStorageSize(): number {
    let total = 0;

    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);

      if (item) {
        total += key.length + item.length;
      }
    }

    return total;
  }

  /**
   * Set multiple values at once
   * @param items - Key-value pairs to set
   */
  setMultiple(items: Partial<StorageValueMap>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key as StorageKey, value);
    });
  }

  /**
   * Get multiple values at once
   * @param keys - Array of keys to get
   * @returns Key-value pairs
   */
  getMultiple<K extends keyof StorageValueMap>(keys: K[]): Partial<Pick<StorageValueMap, K>> {
    const result: Partial<Pick<StorageValueMap, K>> = {};
    keys.forEach((key) => {
      const value = this.get(key);

      if (value !== undefined) {
        result[key] = value;
      }
    });

    return result;
  }
}

/**
 * Singleton storage instance
 */
export const storage = new LocalStorageManager();

export default storage;
