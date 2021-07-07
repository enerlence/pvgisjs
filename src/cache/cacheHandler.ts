import { sizeof } from './utils/sizeOf';

export type CacheHandlerOptions = {
  maxSizeCache?: number;
};

export class CacheHandler {
  constructor(options?: CacheHandlerOptions) {
    // initialize cache
    this.cache = new Map<string, string>();
    this.size = 0;
    this.keys = [];
    // cache options
    if (options) {
      this.maxSizeCache = options.maxSizeCache || 104857600;
    }
  }

  // max size of the cache in B, default to 100MB
  private maxSizeCache = 104857600;

  // cache map
  private cache: Map<string, string>;

  // cache map size in b
  private size: number;

  // cache map size in b
  private keys: string[];

  getItemSize(item: string): number {
    return sizeof(item);
  }

  clearCacheSpace(requiredSpace: number) {
    while (this.maxSizeCache - this.size < requiredSpace || this.cache.size === 0) {
      const entries = this.cache.entries();
      const sizeOfDeletedItem = this.getItemSize(entries.next().value[0]);
      this.cache.delete(entries.next().value[0]);
      this.keys = this.keys.filter((k) => k !== entries.next().value[0]);
      this.size -= sizeOfDeletedItem;
    }
  }

  // set new cache entry
  setItem(queryKey: string, value: string): void {
    // check size of the cache
    const itemSize = this.getItemSize(value);
    // check if inserted item is greater than max cache size
    if (itemSize <= this.maxSizeCache) {
      if (this.size + itemSize > this.maxSizeCache) {
        // clear needed space
        this.clearCacheSpace(itemSize);
      }
      // finally set item data on map
      this.cache.set(queryKey, value);
      this.keys.push(queryKey);
      this.size += itemSize;
    }
  }

  /**
   * Finds item on cache
   * @param queryKey
   * @returns
   */
  getItem<T>(queryKey: string): T | undefined {
    return this.keys.includes(queryKey) ? JSON.parse(this.cache.get(queryKey) || '') : undefined;
  }

  /**
   * Clears cache
   */
  clear(): void {
    this.cache.clear();
    this.size = 0;
    this.keys = [];
  }
}
