export class NotificationService {
  private hasPermission = false;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        this.hasPermission = true;
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          this.hasPermission = perm === 'granted';
        });
      }
    }
  }

  public notifyDownloadComplete(title: string) {
    if (!this.hasPermission) return;
    try {
      new Notification('Download Complete', {
        body: `"${title}" has been saved successfully.`,
        icon: '/vite.svg',
      });
    } catch {
      // Notification failed or unsupported
    }
  }

  public notifyDownloadFailed(title: string, errorMsg?: string) {
    if (!this.hasPermission) return;
    try {
      new Notification('Download Failed', {
        body: errorMsg || `Unable to download "${title}".`,
        icon: '/vite.svg',
      });
    } catch {
      // Ignore
    }
  }
}

export const notificationService = new NotificationService();
