import type { DownloadTaskItem } from '../../domain/models/DownloadTaskItem';

export interface StorageMetrics {
  totalSizeBytes: number;
  totalSizeFormatted: string;
  completedFileCount: number;
  failedFileCount: number;
}

export class StorageMetricsCalculator {
  public calculateMetrics(tasks: DownloadTaskItem[]): StorageMetrics {
    let totalSizeBytes = 0;
    let completedFileCount = 0;
    let failedFileCount = 0;

    tasks.forEach((t) => {
      if (t.state === 'COMPLETED' || t.state === 'completed' as any) {
        completedFileCount++;
        totalSizeBytes += t.downloadedBytes || t.totalBytes || 0;
      } else if (t.state === 'FAILED' || t.state === 'failed' as any) {
        failedFileCount++;
      }
    });

    const totalMb = (totalSizeBytes / (1024 * 1024)).toFixed(1);
    const totalSizeFormatted = totalSizeBytes >= 1024 * 1024 * 1024
      ? `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${totalMb} MB`;

    return {
      totalSizeBytes,
      totalSizeFormatted,
      completedFileCount,
      failedFileCount,
    };
  }
}

export const storageMetricsCalculator = new StorageMetricsCalculator();
