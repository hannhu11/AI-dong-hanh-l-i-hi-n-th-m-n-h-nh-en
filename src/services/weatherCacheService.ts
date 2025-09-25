/**
 * 🌤️ WEATHER CACHE SERVICE
 * ======================
 * 
 * Giải quyết Vấn đề #5: API call bất chấp
 * Theo "Linh Hồn Của AI": Chỉ call API OpenWeatherMap 30 phút/1 lần
 * 
 * Features:
 * ✅ 30-minute intelligent caching
 * ✅ Automatic cache invalidation
 * ✅ Fallback to cache when API fails
 * ✅ Smart cache warming
 */

import { getCurrentWeather, WeatherData, WeatherError } from './weatherService';

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  city: string;
}

class WeatherCacheService {
  private static instance: WeatherCacheService;
  private cache = new Map<string, CachedWeatherData>();
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 phút
  private activeFetches = new Map<string, Promise<WeatherData | WeatherError>>();

  private constructor() {}

  public static getInstance(): WeatherCacheService {
    if (!WeatherCacheService.instance) {
      WeatherCacheService.instance = new WeatherCacheService();
    }
    return WeatherCacheService.instance;
  }

  /**
   * 🚀 Main method: Get weather với intelligent caching
   */
  public async getCachedWeather(city: string): Promise<WeatherData | WeatherError> {
    const cacheKey = city.toLowerCase().trim();
    
    // 🔍 Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`🌤️ WeatherCache: Using cached data for ${city} (${Math.floor((Date.now() - cached.timestamp) / 60000)} minutes old)`);
      return cached.data;
    }

    // 🚫 Prevent multiple simultaneous calls cho cùng 1 city
    if (this.activeFetches.has(cacheKey)) {
      console.log(`🌤️ WeatherCache: Waiting for existing fetch for ${city}`);
      return await this.activeFetches.get(cacheKey)!;
    }

    // 🌐 Fetch new data
    const fetchPromise = this.fetchAndCache(city);
    this.activeFetches.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.activeFetches.delete(cacheKey);
    }
  }

  /**
   * 🔄 Fetch and cache weather data
   */
  private async fetchAndCache(city: string): Promise<WeatherData | WeatherError> {
    try {
      console.log(`🌤️ WeatherCache: Fetching fresh weather data for ${city}`);
      const weatherData = await getCurrentWeather(city);
      
      if ('error' in weatherData) {
        // ⚠️ API failed, return cached data if available
        const cached = this.cache.get(city.toLowerCase().trim());
        if (cached) {
          console.log(`🌤️ WeatherCache: API failed, using stale cache for ${city}`);
          return cached.data;
        }
        return weatherData;
      }

      // ✅ Success: Update cache
      this.cache.set(city.toLowerCase().trim(), {
        data: weatherData,
        timestamp: Date.now(),
        city: city
      });

      console.log(`🌤️ WeatherCache: Cached fresh data for ${city}`);
      return weatherData;

    } catch (error) {
      console.error(`🌤️ WeatherCache: Error fetching weather for ${city}:`, error);
      
      // Return cached data if available
      const cached = this.cache.get(city.toLowerCase().trim());
      if (cached) {
        console.log(`🌤️ WeatherCache: Using stale cache due to error`);
        return cached.data;
      }

      return { error: "Không thể lấy thông tin thời tiết", code: 500 };
    }
  }

  /**
   * 🕐 Check if cache is still valid (within 30 minutes)
   */
  private isCacheValid(cached: CachedWeatherData): boolean {
    return Date.now() - cached.timestamp < this.CACHE_DURATION_MS;
  }

  /**
   * 🧹 Manual cache cleanup (optional)
   */
  public cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION_MS * 2) { // Remove after 1 hour
        this.cache.delete(key);
        console.log(`🌤️ WeatherCache: Cleaned up expired cache for ${cached.city}`);
      }
    }
  }

  /**
   * 🔄 Force refresh for a specific city
   */
  public async forceRefresh(city: string): Promise<WeatherData | WeatherError> {
    const cacheKey = city.toLowerCase().trim();
    this.cache.delete(cacheKey);
    return await this.getCachedWeather(city);
  }

  /**
   * 📊 Get cache stats for debugging
   */
  public getCacheStats(): { totalCities: number; entries: Array<{city: string; age: number}> } {
    const now = Date.now();
    const entries = Array.from(this.cache.values()).map(cached => ({
      city: cached.city,
      age: Math.floor((now - cached.timestamp) / 60000) // age in minutes
    }));

    return {
      totalCities: this.cache.size,
      entries
    };
  }
}

// 🌍 Export singleton instance
export const weatherCache = WeatherCacheService.getInstance();

// 🧹 Auto cleanup every hour
setInterval(() => {
  weatherCache.cleanupExpiredCache();
}, 60 * 60 * 1000);
