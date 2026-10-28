import { extractMediaMetadata, createRemoteStream, parseBody, sendJson } from './extractor';

const rawBackendUrl = process.env.VITE_API_URL || process.env.BACKEND_API_URL || 'https://tanzeel-downloader-app-1.onrender.com';
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition, Transfer-Encoding');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed. Use GET or POST.' });
  }

  try {
    let url = req.query?.url;
    let quality = req.query?.quality;
    let format = req.query?.format;
    let title = req.query?.title;

    if (!url && req.url && req.url.includes('?')) {
      try {
        const parsedUrl = new URL(req.url, 'http://localhost');
        url = parsedUrl.searchParams.get('url') || undefined;
        quality = parsedUrl.searchParams.get('quality') || quality;
        format = parsedUrl.searchParams.get('format') || format;
        title = parsedUrl.searchParams.get('title') || title;
      } catch {
        // Fallback
      }
    }

    if (!url && req.method === 'POST') {
      const body = await parseBody(req);
      url = body?.url;
      quality = body?.quality || quality;
      format = body?.format || format;
      title = body?.title || title;
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return sendJson(res, 400, {
        success: false,
        error: 'Please provide a valid video link.',
      });
    }

    // 1. Try live Render backend first
    try {
      const controller = new AbortController();
      // Allow up to 1 hour streaming proxy for long videos
      const timer = setTimeout(() => controller.abort(), 3600000);

      const backendRes = await fetch(`${BACKEND_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.range ? { Range: req.headers.range } : {}),
        },
        body: JSON.stringify({ url, quality, format, title }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (backendRes.ok && backendRes.body) {
        res.statusCode = backendRes.status;
        const allowedHeaders = new Set([
          'content-type',
          'content-length',
          'content-disposition',
          'content-range',
          'accept-ranges',
          'cache-control',
        ]);

        for (const [key, value] of backendRes.headers.entries()) {
          if (allowedHeaders.has(key.toLowerCase())) {
            res.setHeader(key, value);
          }
        }

        const { Readable } = await import('stream');
        const nodeStream = (Readable as any).fromWeb ? (Readable as any).fromWeb(backendRes.body) : backendRes.body;

        nodeStream.on('error', (streamErr: any) => {
          console.error('[Download Stream Pipe Error]:', streamErr?.message);
          if (!res.headersSent) {
            sendJson(res, 500, { success: false, error: 'Download stream interrupted.' });
          }
        });

        nodeStream.pipe(res);
        return;
      } else if (!backendRes.ok && backendRes.status < 500) {
        const errorData = await backendRes.json().catch(() => null);
        if (errorData?.error) {
          return sendJson(res, backendRes.status, errorData);
        }
      }
    } catch (proxyError: any) {
      console.warn('[Download Proxy to Render failed]:', proxyError?.message);
    }

    // 2. Direct extraction fallback (e.g. TikTok, direct media URL)
    try {
      const meta = await extractMediaMetadata(url);
      const safeTitle = (title || meta.title || 'video_download').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const isAudio = format === 'mp3' || quality?.includes('audio') || quality?.includes('mp3');
      const ext = isAudio ? 'mp3' : 'mp4';
      const filename = `${safeTitle}.${ext}`;

      const selectedFormat = meta.formats.find((f) => f.formatId === quality) || meta.formats[0];
      const directUrl = selectedFormat?.url;

      if (directUrl) {
        const remoteRes = await createRemoteStream(directUrl);
        if (remoteRes && remoteRes.stream) {
          res.statusCode = 200;
          res.setHeader('Content-Type', remoteRes.contentType || (isAudio ? 'audio/mpeg' : 'video/mp4'));
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
          if (remoteRes.contentLength > 0) {
            res.setHeader('Content-Length', remoteRes.contentLength.toString());
          }
          remoteRes.stream.pipe(res);
          return;
        }
      }
    } catch (metaErr: any) {
      console.warn('[Direct extraction fallback failed]:', metaErr?.message);
    }

    // 3. Fallback error when neither proxy nor direct link is accessible
    return sendJson(res, 502, {
      success: false,
      error: 'Unable to stream this media. Please ensure the backend server is running or try again shortly.',
    });
  } catch (error: any) {
    console.error('[API Download Error]', error);
    if (!res.headersSent) {
      return sendJson(res, 500, {
        success: false,
        error: error?.message || 'Download stream processing error.',
      });
    }
  }
}
