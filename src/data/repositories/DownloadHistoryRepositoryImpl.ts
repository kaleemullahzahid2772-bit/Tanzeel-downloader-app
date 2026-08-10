import type { DownloadHistoryItem, IDownloadHistoryRepository } from '../../domain/interfaces/IDownloadHistoryRepository';

export class DownloadHistoryRepositoryImpl implements IDownloadHistoryRepository {
  private STORAGE_KEY = 'omnidownloader_history_v1';
  private inMemoryFallback: DownloadHistoryItem[] = [];

  public async getHistory(): Promise<DownloadHistoryItem[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
      }
      return this.inMemoryFallback;
    } catch {
      return this.inMemoryFallback;
    }
  }

  public async addTask(task: DownloadHistoryItem): Promise<void> {
    const history = await this.getHistory();
    const existingIndex = history.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...task };
    } else {
      history.unshift(task);
    }
    this.saveHistory(history);
  }

  public async renameTask(id: string, newTitle: string): Promise<void> {
    const history = await this.getHistory();
    const task = history.find((t) => t.id === id);
    if (task) {
      task.title = newTitle;
      this.saveHistory(history);
    }
  }

  public async removeTask(id: string): Promise<void> {
    const history = await this.getHistory();
    const updated = history.filter((t) => t.id !== id);
    this.saveHistory(updated);
  }

  public async bulkRemoveTasks(ids: string[]): Promise<void> {
    const history = await this.getHistory();
    const idSet = new Set(ids);
    const updated = history.filter((t) => !idSet.has(t.id));
    this.saveHistory(updated);
  }

  public async clearHistory(): Promise<void> {
    this.inMemoryFallback = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }

  private saveHistory(history: DownloadHistoryItem[]): void {
    this.inMemoryFallback = history;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
    } catch {
      // Storage write failed
    }
  }
}

export const downloadHistoryRepository = new DownloadHistoryRepositoryImpl();
