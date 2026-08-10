import { URL } from 'url';

export class SsrfProtectionService {
  private blockedHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254']);

  public validateUrl(rawUrl: string): { isSafe: boolean; errorMessage?: string } {
    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return { isSafe: false, errorMessage: 'Paste a video link to continue.' };
    }

    const trimmed = rawUrl.trim();

    // 1. Block dangerous scheme prefixes
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('file:') ||
      lower.startsWith('data:') ||
      lower.startsWith('ftp:')
    ) {
      return { isSafe: false, errorMessage: 'The video link appears to be invalid.' };
    }

    try {
      const parsed = new URL(trimmed);

      // 2. Enforce HTTP / HTTPS protocol
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isSafe: false, errorMessage: 'Only HTTP and HTTPS links are supported.' };
      }

      // 3. Block URL credentials trick (http://user:pass@host)
      if (parsed.username || parsed.password) {
        return { isSafe: false, errorMessage: 'The video link contains invalid credentials.' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // 4. Block loopback & metadata hostnames
      if (this.blockedHosts.has(hostname)) {
        return { isSafe: false, errorMessage: 'This video link target is restricted.' };
      }

      // 5. Block private IPv4 ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x)
      if (this.isPrivateIpAddress(hostname)) {
        return { isSafe: false, errorMessage: 'This video link target is restricted.' };
      }

      return { isSafe: true };
    } catch {
      return { isSafe: false, errorMessage: 'The video link appears to be invalid.' };
    }
  }

  private isPrivateIpAddress(host: string): boolean {
    // Check if hostname is an IPv4 address
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = host.match(ipv4Regex);
    if (!match) return false;

    const p1 = parseInt(match[1], 10);
    const p2 = parseInt(match[2], 10);

    // 127.0.0.0/8 (Loopback)
    if (p1 === 127) return true;
    // 10.0.0.0/8 (Private)
    if (p1 === 10) return true;
    // 172.16.0.0/12 (Private)
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (p1 === 192 && p2 === 168) return true;
    // 169.254.0.0/16 (Link Local / Cloud Metadata)
    if (p1 === 169 && p2 === 254) return true;

    return false;
  }
}

export const ssrfProtectionService = new SsrfProtectionService();
