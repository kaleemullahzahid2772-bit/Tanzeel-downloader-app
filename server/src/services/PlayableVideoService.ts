import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export class PlayableVideoService {
  private static cachedBuffer: Buffer | null = null;

  public static getValidMp4Buffer(): Buffer {
    if (this.cachedBuffer && this.cachedBuffer.length > 1000) {
      return this.cachedBuffer;
    }

    try {
      const assetPath = path.resolve(__dirname, '../assets/video_stream.mp4');
      if (fs.existsSync(assetPath)) {
        const fileBuffer = fs.readFileSync(assetPath);
        if (fileBuffer && fileBuffer.length > 1000) {
          this.cachedBuffer = fileBuffer;
          return fileBuffer;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback valid ftyp atom box header
    return Buffer.from([
      0x00, 0x00, 0x00, 0x1c, // length 28
      0x66, 0x74, 0x79, 0x70, // 'ftyp'
      0x69, 0x73, 0x6f, 0x6d, // 'isom'
      0x00, 0x00, 0x02, 0x00, // version
      0x69, 0x73, 0x6f, 0x6d, // 'isom'
      0x69, 0x73, 0x6f, 0x32, // 'iso2'
      0x6d, 0x70, 0x34, 0x31  // 'mp41'
    ]);
  }

  public static createPlayableStream(_requestedSizeBytes?: number): { stream: Readable; contentLength: number; isExactLength?: boolean } {
    const videoBuffer = this.getValidMp4Buffer();
    const contentLength = videoBuffer.length;

    let sent = false;

    const stream = new Readable({
      read() {
        if (sent) {
          this.push(null);
        } else {
          sent = true;
          this.push(videoBuffer);
        }
      },
    });

    return {
      stream,
      contentLength,
      isExactLength: true,
    };
  }
}
