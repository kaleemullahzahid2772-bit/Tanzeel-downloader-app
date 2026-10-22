import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export class PlayableVideoService {
  private static cachedVideoBuffer: Buffer | null = null;
  private static cachedAudioBuffer: Buffer | null = null;

  public static getValidMp4Buffer(): Buffer {
    if (this.cachedVideoBuffer && this.cachedVideoBuffer.length > 1000) {
      return this.cachedVideoBuffer;
    }

    const candidates = [
      path.resolve(__dirname, '../assets/video_stream.mp4'),
      path.resolve(__dirname, '../../src/assets/video_stream.mp4'),
      path.resolve(__dirname, '../../../server/src/assets/video_stream.mp4'),
      path.resolve(process.cwd(), 'server/src/assets/video_stream.mp4'),
      path.resolve(process.cwd(), 'server/dist/assets/video_stream.mp4'),
      path.resolve(__dirname, '../assets/sample.mp4'),
      path.resolve(__dirname, '../../src/assets/sample.mp4'),
      path.resolve(process.cwd(), 'server/src/assets/sample.mp4'),
      path.resolve(process.cwd(), 'public/sample.mp4'),
    ];

    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const fileBuffer = fs.readFileSync(p);
          if (fileBuffer && fileBuffer.length > 1000) {
            this.cachedVideoBuffer = fileBuffer;
            return fileBuffer;
          }
        }
      } catch {
        // Continue searching
      }
    }

    return Buffer.alloc(0);
  }

  public static getValidMp3Buffer(): Buffer {
    if (this.cachedAudioBuffer && this.cachedAudioBuffer.length > 500) {
      return this.cachedAudioBuffer;
    }

    const candidates = [
      path.resolve(__dirname, '../assets/audio_stream.mp3'),
      path.resolve(__dirname, '../../src/assets/audio_stream.mp3'),
      path.resolve(__dirname, '../../../server/src/assets/audio_stream.mp3'),
      path.resolve(process.cwd(), 'server/src/assets/audio_stream.mp3'),
      path.resolve(process.cwd(), 'public/audio_sample.mp3'),
    ];

    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const fileBuffer = fs.readFileSync(p);
          if (fileBuffer && fileBuffer.length > 500) {
            this.cachedAudioBuffer = fileBuffer;
            return fileBuffer;
          }
        }
      } catch {
        // Continue searching
      }
    }

    return Buffer.alloc(0);
  }

  public static createPlayableStream(isAudio = false): { stream: Readable; contentLength: number; isExactLength?: boolean } {
    const buffer = isAudio ? this.getValidMp3Buffer() : this.getValidMp4Buffer();
    const contentLength = buffer.length;

    let sent = false;
    const stream = new Readable({
      read() {
        if (sent) {
          this.push(null);
        } else {
          sent = true;
          this.push(buffer);
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
