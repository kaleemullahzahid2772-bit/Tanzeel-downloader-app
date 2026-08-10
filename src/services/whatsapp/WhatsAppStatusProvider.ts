import type { StatusMedia } from '../../domain/models/StatusMedia';

export class WhatsAppStatusProvider {
  private isAccessGranted = false;

  public async checkAccessPermission(): Promise<boolean> {
    return this.isAccessGranted;
  }

  public async requestAccessPermission(): Promise<boolean> {
    this.isAccessGranted = true;
    return true;
  }

  public async scanAvailableStatuses(): Promise<StatusMedia[]> {
    if (!this.isAccessGranted) {
      throw new Error('Access permission required to view WhatsApp status media.');
    }

    // Attempt to access actual device media if in native environment
    if (typeof window !== 'undefined' && typeof (window as any).AndroidStorageAccess !== 'undefined') {
      try {
        const rawJson = (window as any).AndroidStorageAccess.getWhatsAppStatuses();
        const parsed = JSON.parse(rawJson);
        return this.processAndSortStatuses(parsed);
      } catch {
        // Fall back to media provider
      }
    }

    // Return sample local statuses for web browser preview
    const sampleStatuses: StatusMedia[] = [
      {
        id: 'status_01',
        uri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
        displayName: 'WhatsApp_Status_Image_01',
        fileSizeBytes: 2457600,
        fileSizeFormatted: '2.4 MB',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        dateFormatted: '5 mins ago',
      },
      {
        id: 'status_02',
        uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
        displayName: 'WhatsApp_Status_Beach_Sunset',
        fileSizeBytes: 3145728,
        fileSizeFormatted: '3.0 MB',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        dateFormatted: '25 mins ago',
      },
      {
        id: 'status_03',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        type: 'VIDEO',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=400&auto=format&fit=crop&q=80',
        displayName: 'WhatsApp_Status_Video_Nature',
        fileSizeBytes: 12582912,
        fileSizeFormatted: '12.0 MB',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dateFormatted: '2 hours ago',
      },
      {
        id: 'status_04',
        uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
        type: 'IMAGE',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80',
        displayName: 'WhatsApp_Status_Starry_Night',
        fileSizeBytes: 4194304,
        fileSizeFormatted: '4.0 MB',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        dateFormatted: '5 hours ago',
      },
      {
        id: 'status_05',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'VIDEO',
        thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80',
        displayName: 'WhatsApp_Status_Animated_Short',
        fileSizeBytes: 15728640,
        fileSizeFormatted: '15.0 MB',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        dateFormatted: '12 hours ago',
      },
    ];

    return this.processAndSortStatuses(sampleStatuses);
  }

  private processAndSortStatuses(items: StatusMedia[]): StatusMedia[] {
    return items
      .filter((item) => item.type === 'IMAGE' || item.type === 'VIDEO')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const whatsAppStatusProvider = new WhatsAppStatusProvider();
