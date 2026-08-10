export class StatusThumbnailCache {
  private cache: Map<string, string> = new Map();
  private maxItems: number;

  constructor(maxItems = 100) {
    this.maxItems = maxItems;
  }

  public get(id: string): string | undefined {
    return this.cache.get(id);
  }

  public set(id: string, url: string): void {
    if (this.cache.size >= this.maxItems) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(id, url);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const statusThumbnailCache = new StatusThumbnailCache();
