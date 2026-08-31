import { extractMediaMetadata } from './extractor';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please paste a valid video URL.',
      });
    }

    const metadata = await extractMediaMetadata(url);

    return res.status(200).json({
      success: true,
      ...metadata,
    });
  } catch (error: any) {
    console.error('[API Analyze Error]', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze video URL.',
    });
  }
}
