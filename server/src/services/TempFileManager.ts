import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class TempFileManager {
  private tempDir: string;

  constructor() {
    this.tempDir = path.resolve(__dirname, '../../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  public sanitizeFilename(name: string, ext = '.mp4'): string {
    if (!name) return `video_${Date.now()}${ext}`;

    let cleanName = name;
    if (cleanName.toLowerCase().endsWith(ext.toLowerCase())) {
      cleanName = cleanName.slice(0, -ext.length);
    }

    // Strip path traversal characters, null bytes, and illegal characters
    cleanName = cleanName
      .replace(/[\/\?<>\\:\*\|":]/g, '')
      .replace(/\.\./g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .trim();

    const truncated = cleanName.substring(0, 100) || 'media_file';
    return `${truncated}${ext}`;
  }

  public createTempFilePath(prefix = 'media_', ext = '.mp4'): string {
    const randomHex = crypto.randomBytes(8).toString('hex');
    return path.join(this.tempDir, `${prefix}${Date.now()}_${randomHex}${ext}`);
  }

  public safeDelete(filePath: string): void {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('[TempFileManager] Safe delete failed:', err);
    }
  }

  public cleanupOldFiles(maxAgeMs = 15 * 60 * 1000): void {
    try {
      if (!fs.existsSync(this.tempDir)) return;
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();

      files.forEach((file) => {
        const fullPath = path.join(this.tempDir, file);
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          this.safeDelete(fullPath);
        }
      });
    } catch {
      // Ignore
    }
  }
}

export const tempFileManager = new TempFileManager();
