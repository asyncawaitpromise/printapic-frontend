class PhotoCacheService {
  constructor() {
    this.cache = new Map();
    this.CACHE_KEY = 'user_photos_cache';
    this.CACHE_TIMESTAMP_KEY = 'user_photos_cache_timestamp';
    this.CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  }

  // Get cache key for current user
  getCacheKey(userId = 'anonymous') {
    return `${this.CACHE_KEY}_${userId}`;
  }

  getTimestampKey(userId = 'anonymous') {
    return `${this.CACHE_TIMESTAMP_KEY}_${userId}`;
  }

  // Save photos to cache (both memory and localStorage)
  setPhotos(photos, userId = 'anonymous') {
    const cacheKey = this.getCacheKey(userId);
    const timestampKey = this.getTimestampKey(userId);
    const timestamp = Date.now();

    // Memory cache
    this.cache.set(cacheKey, {
      photos,
      timestamp
    });

    // Persistent cache in localStorage
    try {
      localStorage.setItem(cacheKey, JSON.stringify(photos));
      localStorage.setItem(timestampKey, timestamp.toString());
      console.log('📦 Photos cached for user:', userId, '- Count:', photos.length);
    } catch (error) {
      console.warn('Failed to cache photos to localStorage:', error);
    }
  }

  // Get photos from cache (memory first, then localStorage)
  getPhotos(userId = 'anonymous') {
    const cacheKey = this.getCacheKey(userId);
    const timestampKey = this.getTimestampKey(userId);

    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (this.isValidCache(cached.timestamp)) {
        console.log('📦 Using memory cached photos for user:', userId, '- Count:', cached.photos.length);
        return cached.photos;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Check localStorage cache
    try {
      const cachedPhotos = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(timestampKey);

      if (cachedPhotos && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        if (this.isValidCache(timestamp)) {
          const photos = JSON.parse(cachedPhotos);
          
          // Restore to memory cache
          this.cache.set(cacheKey, {
            photos,
            timestamp
          });

          console.log('📦 Using localStorage cached photos for user:', userId, '- Count:', photos.length);
          return photos;
        } else {
          // Expired cache, clean up
          this.clearCache(userId);
        }
      }
    } catch (error) {
      console.warn('Failed to read photos from localStorage cache:', error);
    }

    return null;
  }

  // Check if cache is still valid
  isValidCache(timestamp) {
    return (Date.now() - timestamp) < this.CACHE_EXPIRY;
  }

  // Check if we have cached photos (for immediate rendering)
  hasPhotos(userId = 'anonymous') {
    return this.getPhotos(userId) !== null;
  }

  // Clear cache for user
  clearCache(userId = 'anonymous') {
    const cacheKey = this.getCacheKey(userId);
    const timestampKey = this.getTimestampKey(userId);

    // Clear memory cache
    this.cache.delete(cacheKey);

    // Clear localStorage cache
    try {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      console.log('📦 Cache cleared for user:', userId);
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  // Clear all caches (useful for logout)
  clearAllCaches() {
    // Clear memory cache
    this.cache.clear();

    // Clear localStorage caches
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY) || key.startsWith(this.CACHE_TIMESTAMP_KEY)) {
          localStorage.removeItem(key);
        }
      });
      console.log('📦 All photo caches cleared');
    } catch (error) {
      console.warn('Failed to clear localStorage caches:', error);
    }
  }

  // Get cache info for debugging
  getCacheInfo(userId = 'anonymous') {
    const cacheKey = this.getCacheKey(userId);
    const timestampKey = this.getTimestampKey(userId);

    const memoryCache = this.cache.get(cacheKey);
    const localStoragePhotos = localStorage.getItem(cacheKey);
    const localStorageTimestamp = localStorage.getItem(timestampKey);

    return {
      hasMemoryCache: !!memoryCache,
      hasLocalStorageCache: !!localStoragePhotos,
      memoryCacheCount: memoryCache?.photos?.length || 0,
      localStorageCacheCount: localStoragePhotos ? JSON.parse(localStoragePhotos).length : 0,
      cacheAge: localStorageTimestamp ? Date.now() - parseInt(localStorageTimestamp) : null,
      isValid: localStorageTimestamp ? this.isValidCache(parseInt(localStorageTimestamp)) : false
    };
  }
}

// Export singleton instance
export const photoCacheService = new PhotoCacheService();