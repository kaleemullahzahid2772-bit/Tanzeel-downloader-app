import type { IUrlNormalizer } from '../../domain/interfaces/IUrlNormalizer';

// List of tracking query parameters that can be safely removed without breaking media URLs
const SAFE_TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'igshid',
  'si',
]);

export class UrlNormalizer implements IUrlNormalizer {
  public normalize(rawUrl: string): string {
    if (!rawUrl) return '';

    let trimmed = rawUrl.trim();

    // Auto-prefix https:// if missing
    if (!trimmed.match(/^https?:\/\//i)) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);

      // Clean query parameters safely
      const cleanedParams = new URLSearchParams();
      parsed.searchParams.forEach((val, key) => {
        if (!SAFE_TRACKING_PARAMS.has(key.toLowerCase())) {
          cleanedParams.append(key, val);
        }
      });

      parsed.search = cleanedParams.toString() ? `?${cleanedParams.toString()}` : '';

      return parsed.toString();
    } catch {
      return trimmed;
    }
  }
}

export const urlNormalizer = new UrlNormalizer();
