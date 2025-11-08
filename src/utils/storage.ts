import { STORAGE_KEYS } from './constants';

// Generic storage utilities
export const setItem = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue || null;
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue || null;
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Profile-specific storage
export const setSelectedProfile = (profileId: string): void => {
  setItem(STORAGE_KEYS.SELECTED_PROFILE, profileId);
};

export const getSelectedProfile = (): string | null => {
  return getItem<string>(STORAGE_KEYS.SELECTED_PROFILE);
};

export const removeSelectedProfile = (): void => {
  removeItem(STORAGE_KEYS.SELECTED_PROFILE);
};

// User preferences
interface UserPreferences {
  language: string;
  autoplay: boolean;
  notifications: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  subtitles: boolean;
  audioDescription: boolean;
}

export const setUserPreferences = (preferences: Partial<UserPreferences>): void => {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };
  setItem(STORAGE_KEYS.USER_PREFERENCES, updated);
};

export const getUserPreferences = (): UserPreferences => {
  return getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {
    language: 'en',
    autoplay: true,
    notifications: true,
    dataUsage: 'medium',
    subtitles: false,
    audioDescription: false,
  })!;
};

// Volume level
export const setVolumeLevel = (volume: number): void => {
  setItem(STORAGE_KEYS.VOLUME_LEVEL, Math.max(0, Math.min(1, volume)));
};

export const getVolumeLevel = (): number => {
  return getItem<number>(STORAGE_KEYS.VOLUME_LEVEL, 1)!;
};

// Playback quality
export const setPlaybackQuality = (quality: 'auto' | 'low' | 'medium' | 'high'): void => {
  setItem(STORAGE_KEYS.PLAYBACK_QUALITY, quality);
};

export const getPlaybackQuality = (): string => {
  return getItem<string>(STORAGE_KEYS.PLAYBACK_QUALITY, 'auto')!;
};

// Recently viewed content
interface RecentlyViewed {
  contentId: number;
  contentType: 'movie' | 'tv';
  timestamp: string;
  title: string;
  poster_path?: string;
}

export const addToRecentlyViewed = (content: RecentlyViewed): void => {
  const recent = getRecentlyViewed();
  const filtered = recent.filter(
    item => !(item.contentId === content.contentId && item.contentType === content.contentType)
  );
  const updated = [content, ...filtered].slice(0, 20); // Keep only last 20 items
  setItem('recently_viewed', updated);
};

export const getRecentlyViewed = (): RecentlyViewed[] => {
  return getItem<RecentlyViewed[]>('recently_viewed', [])!;
};

export const clearRecentlyViewed = (): void => {
  removeItem('recently_viewed');
};

// Search history
export const addToSearchHistory = (query: string): void => {
  if (!query.trim()) return;
  
  const history = getSearchHistory();
  const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, 10); // Keep only last 10 searches
  setItem('search_history', updated);
};

export const getSearchHistory = (): string[] => {
  return getItem<string[]>('search_history', [])!;
};

export const clearSearchHistory = (): void => {
  removeItem('search_history');
};

// Content cache
interface CachedContent {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export const setCachedContent = (key: string, data: any, ttl: number = 5 * 60 * 1000): void => {
  const cached: CachedContent = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
  };
  setItem(`cache_${key}`, cached);
};

export const getCachedContent = (key: string): any | null => {
  const cached = getItem<CachedContent>(`cache_${key}`);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    removeItem(`cache_${key}`);
    return null;
  }
  
  return cached.data;
};

export const clearExpiredCache = (): void => {
  const keys = Object.keys(localStorage);
  const now = Date.now();
  
  keys.forEach(key => {
    if (key.startsWith('cache_')) {
      const cached = getItem<CachedContent>(key);
      if (cached && now > cached.expiresAt) {
        removeItem(key);
      }
    }
  });
};

// Initialize cache cleanup on app start
export const initializeCacheCleanup = (): void => {
  clearExpiredCache();
  
  // Clean up expired cache every 5 minutes
  setInterval(clearExpiredCache, 5 * 60 * 1000);
};

// Export all storage utilities
export const storage = {
  setItem,
  getItem,
  removeItem,
  clearStorage,
  setSelectedProfile,
  getSelectedProfile,
  removeSelectedProfile,
  setUserPreferences,
  getUserPreferences,
  setVolumeLevel,
  getVolumeLevel,
  setPlaybackQuality,
  getPlaybackQuality,
  addToRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed,
  addToSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  setCachedContent,
  getCachedContent,
  clearExpiredCache,
  initializeCacheCleanup,
};