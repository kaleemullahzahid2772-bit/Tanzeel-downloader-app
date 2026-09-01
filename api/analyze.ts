import { extractMediaMetadata, parseBody, sendJson } from './extractor';

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
