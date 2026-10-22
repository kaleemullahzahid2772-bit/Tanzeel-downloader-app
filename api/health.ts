import { sendJson } from './extractor';

const BACKEND_URL = process.env.VITE_API_URL || process.env.BACKEND_API_URL || 'https://tanzeel-downloader-app-1.onrender.com';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/health`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      return sendJson(res, 200, {
        status: 'ok',
        backend: 'connected',
        ...data,
      });
    }
  } catch {}

  return sendJson(res, 200, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
