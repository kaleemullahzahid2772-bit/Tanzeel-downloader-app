import type { HistorySortOption } from '../../domain/models/HistoryItem';
import type { DownloadTaskItem } from '../../domain/models/DownloadTaskItem';

export class HistorySearchManager {
  public searchAndSortTasks(
    tasks: DownloadTaskItem[],
    query: string,
    sortOption: HistorySortOption = 'NEWEST'
  ): DownloadTaskItem[] {
    const trimmed = query.trim().toLowerCase();

    // 1. Local Text Search Filtering
    let filtered = tasks;
    if (trimmed) {
      filtered = tasks.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(trimmed)) ||
          (t.url && t.url.toLowerCase().includes(trimmed)) ||
          (t.platform && t.platform.toLowerCase().includes(trimmed))
      );
    }

    // 2. Sorting Algorithms
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'OLDEST':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

        case 'LARGEST':
          return b.totalBytes - a.totalBytes;

        case 'SMALLEST':
          return a.totalBytes - b.totalBytes;

        case 'NAME_ASC':
          return (a.title || '').localeCompare(b.title || '');

        case 'NEWEST':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  }
}

export const historySearchManager = new HistorySearchManager();
