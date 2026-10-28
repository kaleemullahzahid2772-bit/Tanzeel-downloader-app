import { Router, Request, Response, NextFunction } from 'express';
import { mediaExtractorService } from '../services/MediaExtractorService';
import { tempFileManager } from '../services/TempFileManager';

export const downloadRouter = Router();

downloadRouter.all('/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = (req.query.url as string) || req.body?.url;
    const quality = (req.query.quality as string) || req.body?.quality;
    const format = (req.query.format as string) || req.body?.format;
    const title = (req.query.title as string) || req.body?.title;
    const isAudio = format === 'mp3' || quality === 'mp3' || quality?.includes('audio');
    const chosenQuality = isAudio ? 'mp3' : quality;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid video link.',
      });
    }

    // Disable request and response socket timeouts to support long video streaming (1 hour+)
    req.setTimeout(0);
    res.setTimeout(0);

    const mediaResult = await mediaExtractorService.downloadMedia(url, chosenQuality, title);
    const safeFilename = tempFileManager.sanitizeFilename(mediaResult.filename);

    const rangeHeader = req.headers.range;
    let startByte = 0;
    let endByte = mediaResult.contentLength - 1;

    if (rangeHeader && mediaResult.isExactLength) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      startByte = parseInt(parts[0], 10) || 0;
      if (parts[1]) {
        endByte = parseInt(parts[1], 10);
      }

      const chunkLength = endByte - startByte + 1;
      res.status(206);
      res.setHeader(
        'Content-Range',
        `bytes ${startByte}-${endByte}/${mediaResult.contentLength}`
      );
      res.setHeader('Content-Length', chunkLength.toString());
    } else {
      res.status(200);
      if (mediaResult.isExactLength && mediaResult.contentLength > 0) {
        res.setHeader('Content-Length', mediaResult.contentLength.toString());
      } else {
        // Dynamic stream (yt-dlp stdout or remote proxy): omitted Content-Length prevents ERR_CONTENT_LENGTH_MISMATCH
        res.setHeader('Transfer-Encoding', 'chunked');
      }
    }

    res.setHeader('Content-Type', mediaResult.contentType || 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(safeFilename)}"`
    );
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Range, Content-Disposition, Transfer-Encoding'
    );

    mediaResult.stream.pipe(res);

    res.on('close', () => {
      if (mediaResult?.stream && typeof (mediaResult.stream as any).destroy === 'function') {
        (mediaResult.stream as any).destroy();
      }
    });

    mediaResult.stream.on('error', (err) => {
      console.error('[StreamError]', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Download stream interrupted.' });
      }
    });
  } catch (err) {
    next(err);
  }
});
