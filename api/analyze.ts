import { extractMediaMetadata, parseBody, sendJson } from './extractor';

const BACKEND_URL = process.env.VITE_API_URL || process.env.BACKEND_API_URL || 'https://tanzeel-downloader-app-1.onrender.com';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

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

    if (!url || typeof url !== 'string' || !url.trim()) {
      return sendJson(res, 400, {
        success: false,
        error: 'Please paste a valid video URL.',
      });
    }

    // Forward to live Render backend with 15s timeout for cold start resilience
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const renderRes = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (renderRes.ok) {
        const data = await renderRes.json();
        return sendJson(res, renderRes.status, data);
      }
    } catch (proxyError: any) {
      console.warn('[Proxy to Render failed, fallback to local extractor]:', proxyError?.message);
    }

    // Fallback to local extractor
    const metadata = await extractMediaMetadata(url);

    return sendJson(res, 200, {
      success: true,
      ...metadata,
    });
  } catch (error: any) {
    console.error('[API Analyze Error]', error);
    return sendJson(res, 400, {
      success: false,
      error: error?.message || 'Unable to analyze video link. Please check the URL and try again.',
    });
  }
}
