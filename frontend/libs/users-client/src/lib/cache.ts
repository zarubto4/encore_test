type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class Cache {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static readonly expireTime = 24 * 60 * 60 * 1000; // 24 hours

  public static get<T>(key: string): T | null {
    const cacheEntry = Cache.cache.get(key);
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return cacheEntry.data;
    }
    Cache.cache.delete(key);
    return null;
  }

  public static set<T>(key: string, data: T, expire: number = Cache.expireTime): void {
    Cache.cache.set(key, { data, expiresAt: Date.now() + expire });
  }

  public static clear(): void {
    Cache.cache.clear();
  }

  public static delete(key: string): void {
    Cache.cache.delete(key);
  }
}
