import { extractMediaMetadata, createPlayableStream, createRemoteStream } from './extractor';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition, Transfer-Encoding');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { url, quality } = req.body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid video link.',
      });
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
    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', contentLength.toString());
    stream.pipe(res);
  } catch (error: any) {
    console.error('[API Download Error]', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error?.message || 'Download stream processing error.',
      });
    }
  }
}
