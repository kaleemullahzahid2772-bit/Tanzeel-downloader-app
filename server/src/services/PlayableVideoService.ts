import { Readable } from 'stream';

export class PlayableVideoService {
  public static getValidMp4Buffer(): Buffer {
    return Buffer.alloc(0);
  }

  public static getValidMp3Buffer(): Buffer {
    return Buffer.alloc(0);
  }

  public static createPlayableStream(_isAudio = false): { stream: Readable; contentLength: number; isExactLength?: boolean } {
    const stream = new Readable({
      read() {
        this.push(null);
      },
    });

    return {
      stream,
      contentLength: 0,
      isExactLength: true,
    };
  }
}
