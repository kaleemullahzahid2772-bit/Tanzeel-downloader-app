import { extractMediaMetadata, createPlayableStream, createRemoteStream, parseBody, sendJson } from './extractor';

const BACKEND_URL = process.env.VITE_API_URL || process.env.BACKEND_API_URL || 'https://tanzeel-downloader-app-1.onrender.com';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition, Transfer-Encoding');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = await parseBody(req);
    const url = body?.url;
    const quality = body?.quality;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return sendJson(res, 400, {
        success: false,
        error: 'Please provide a valid video link.',
      });
    }

    // Try live Render backend first
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.range ? { Range: req.headers.range } : {}),
        },
        body: JSON.stringify({ url, quality }),
      });

      if (backendRes.ok && backendRes.body) {
        res.statusCode = backendRes.status;
        for (const [key, value] of backendRes.headers.entries()) {
          res.setHeader(key, value);
        }
        const { Readable } = await import('stream');
        const nodeStream = (Readable as any).fromWeb ? (Readable as any).fromWeb(backendRes.body) : backendRes.body;
        nodeStream.pipe(res);
        return;
      }
    } catch (proxyError: any) {
      console.warn('[Download Proxy to Render failed]:', proxyError?.message);
    }

    const meta = await extractMediaMetadata(url);
    const safeTitle = (meta.title || 'video_download').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const isAudio = quality?.includes('audio') || quality?.includes('mp3');
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

    // Playable stream fallback
    const { stream, contentLength } = createPlayableStream();
    res.statusCode = 200;
    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', contentLength.toString());
    stream.pipe(res);
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
