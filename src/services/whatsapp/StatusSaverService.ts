import type { StatusMedia } from '../../domain/models/StatusMedia';

export class StatusSaverService {
  private savedFilenames: Set<string> = new Set();

  public sanitizeFilename(name: string, ext = '.jpg'): string {
    if (!name) return `status_${Date.now()}${ext}`;
    let clean = name
      .replace(/[\/\?<>\\:\*\|":]/g, '')
      .replace(/\.\./g, '')
      .trim();

    if (clean.toLowerCase().endsWith(ext.toLowerCase())) {
      clean = clean.slice(0, -ext.length);
    }
    return `${clean.substring(0, 100)}${ext}`;
  }

  public getDuplicateSafeName(baseName: string, ext: string): string {
    const cleanBase = this.sanitizeFilename(baseName, ext).replace(ext, '');
    let candidate = `${cleanBase}${ext}`;
    let counter = 1;

    while (this.savedFilenames.has(candidate)) {
      candidate = `${cleanBase} (${counter})${ext}`;
      counter++;
    }

    this.savedFilenames.add(candidate);
    return candidate;
  }

  public async saveStatusToDevice(item: StatusMedia): Promise<string> {
    const ext = item.type === 'VIDEO' || item.type === 'video' ? '.mp4' : '.jpg';
    const finalFilename = this.getDuplicateSafeName(item.displayName || 'status', ext);
    const targetUri = item.uri || item.mediaUrl;

    if (!targetUri) {
      throw new Error('Status media URI is missing.');
    }

    try {
      if (targetUri.startsWith('blob:') || targetUri.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = targetUri;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return finalFilename;
      }

      // Fetch blob locally without remote upload
      const res = await fetch(targetUri);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      return finalFilename;
    } catch {
      throw new Error('Unable to save status media to device storage.');
    }
  }
}

export const statusSaverService = new StatusSaverService();
