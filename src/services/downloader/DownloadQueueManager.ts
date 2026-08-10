export class DownloadQueueManager {
  private maxConcurrency: number;
  private activeCount: number;
  private queue: Array<() => Promise<void>>;

  constructor(maxConcurrency = 2) {
    this.maxConcurrency = maxConcurrency;
    this.activeCount = 0;
    this.queue = [];
  }

  public setConcurrency(limit: number): void {
    this.maxConcurrency = Math.max(1, limit);
  }

  public enqueue(taskRunner: () => Promise<void>): void {
    this.queue.push(taskRunner);
    this.processQueue();
  }

  private processQueue(): void {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const nextTask = this.queue.shift();
    if (!nextTask) return;

    this.activeCount++;
    nextTask().finally(() => {
      this.activeCount--;
      this.processQueue();
    });
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const downloadQueueManager = new DownloadQueueManager(2);
