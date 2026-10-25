import { describe, it, expect } from 'vitest';
import { extractMediaMetadata, parseBody, sendJson } from '../api/extractor';
import analyzeHandler from '../api/analyze';
import healthHandler from '../api/health';

describe('Serverless API Handlers', () => {
  it('healthHandler returns 200 ok with raw mock res', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let body = '';

    const req = { method: 'GET' };
    const res = {
      setHeader(k: string, v: string) { headers[k] = v; },
      set statusCode(c: number) { statusCode = c; },
      get statusCode() { return statusCode; },
      end(data: string) { body = data; },
    };

    await healthHandler(req as any, res as any);
    expect(statusCode).toBe(200);
    const parsed = JSON.parse(body);
    expect(parsed.status).toBe('ok');
  });

  it('analyzeHandler handles YouTube URL successfully', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let body = '';

    const req = {
      method: 'POST',
      body: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    };
    const res = {
      setHeader(k: string, v: string) { headers[k] = v; },
      set statusCode(c: number) { statusCode = c; },
      get statusCode() { return statusCode; },
      end(data: string) { body = data; },
    };

    await analyzeHandler(req as any, res as any);
    expect(statusCode).toBe(200);
    const parsed = JSON.parse(body);
    expect(parsed.success).toBe(true);
    expect(parsed.platform).toBe('youtube');
    expect(parsed.formats.length).toBeGreaterThan(0);
  });

  it('analyzeHandler handles string body JSON safely', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let body = '';

    const req = {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.tiktok.com/@user/video/123456789' }),
    };
    const res = {
      setHeader(k: string, v: string) { headers[k] = v; },
      set statusCode(c: number) { statusCode = c; },
      get statusCode() { return statusCode; },
      end(data: string) { body = data; },
    };

    await analyzeHandler(req as any, res as any);
    expect(statusCode).toBe(200);
    const parsed = JSON.parse(body);
    expect(parsed.success).toBe(true);
    expect(parsed.platform).toBe('tiktok');
  }, 15000);

  it('analyzeHandler handles Pinterest URL', async () => {
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let body = '';

    const req = {
      method: 'POST',
      body: JSON.stringify({ url: 'https://www.pinterest.com/pin/123456789' }),
    };
    const res = {
      setHeader(k: string, v: string) { headers[k] = v; },
      set statusCode(c: number) { statusCode = c; },
      get statusCode() { return statusCode; },
      end(data: string) { body = data; },
    };

    await analyzeHandler(req as any, res as any);
    expect(statusCode).toBe(200);
    const parsed = JSON.parse(body);
    expect(parsed.success).toBe(true);
    expect(parsed.platform).toBe('pinterest');
  }, 15000);

  it('extractMediaMetadata extracts YouTube info with formats', async () => {
    const meta = await extractMediaMetadata('https://youtu.be/dQw4w9WgXcQ');
    expect(meta.platform).toBe('youtube');
    expect(meta.title).toBeDefined();
    expect(meta.formats.length).toBeGreaterThan(0);
  });
});
