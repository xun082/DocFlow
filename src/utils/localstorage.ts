// 定义所有可用的 localStorage 键
export const STORAGE_KEYS = {
  // 用户相关
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  USER_PREFERENCES: 'user_preferences',

  // 文档相关
  RECENT_DOCUMENTS: 'recent_documents',
  DOCUMENT_DRAFTS: 'document_drafts',
  DOCUMENT_SETTINGS: 'document_settings',

  // 编辑器相关
  EDITOR_THEME: 'editor_theme',
  EDITOR_FONT_SIZE: 'editor_font_size',
  EDITOR_LAYOUT: 'editor_layout',

  // 应用设置
  APP_LANGUAGE: 'app_language',
  APP_THEME: 'app_theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',

  // 临时数据
  TEMP_DATA: 'temp_data',
  CACHE_TIMESTAMP: 'cache_timestamp',

  // API 配置
  API_KEYS: 'docflow_api_keys',
} as const;

// 从 STORAGE_KEYS 中提取键的类型
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// 定义每个键对应的数据类型
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
  [STORAGE_KEYS.TEMP_DATA]: any;
  [STORAGE_KEYS.CACHE_TIMESTAMP]: number;
  [STORAGE_KEYS.API_KEYS]: {
    siliconflow?: string;
    openai?: string;
    anthropic?: string;
    [key: string]: string | undefined;
  };
}

/**
 * 类型安全的 localStorage 封装工具
 */
class LocalStorageManager {
  /**
   * 设置 localStorage 值
   * @param key 存储键，只能使用 STORAGE_KEYS 中定义的键
   * @param value 存储值，类型会根据键自动推断
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
   * 获取 localStorage 值
   * @param key 存储键
   * @param defaultValue 默认值，当键不存在时返回
   * @returns 存储的值或默认值
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
   * 移除 localStorage 项
   * @param key 存储键
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item "${key}":`, error);
    }
  }

  /**
   * 检查键是否存在
   * @param key 存储键
   * @returns 是否存在
   */
  has(key: StorageKey): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * 清空所有 localStorage 数据
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * 获取所有已定义的键
   * @returns 所有存在的键数组
   */
  getAllKeys(): StorageKey[] {
    const allKeys = Object.values(STORAGE_KEYS);

    return allKeys.filter((key) => this.has(key));
  }

  /**
   * 获取存储大小（近似值，以字符数计算）
   * @returns 存储大小
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
   * 批量设置多个值
   * @param items 键值对对象
   */
  setMultiple(items: Partial<StorageValueMap>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key as StorageKey, value);
    });
  }

  /**
   * 批量获取多个值
   * @param keys 键数组
   * @returns 键值对对象
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

// 创建单例实例
export const storage = new LocalStorageManager();

// 导出默认实例
export default storage;
