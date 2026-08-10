import type { IUrlValidator, ValidationResult } from '../../domain/interfaces/IUrlValidator';

export class UrlValidator implements IUrlValidator {
  public validate(rawUrl: string): ValidationResult {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return {
        isValid: false,
        errorMessage: 'Paste a video link to continue.',
        hasMultipleUrls: false,
      };
    }

    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return {
        isValid: false,
        errorMessage: 'Paste a video link to continue.',
        hasMultipleUrls: false,
      };
    }

    // Check for multiple URLs
    if (this.isMultipleUrls(trimmed)) {
      return {
        isValid: false,
        errorMessage: 'Please enter one video link at a time.',
        hasMultipleUrls: true,
      };
    }

    // Basic URL parsing validation
    try {
      // Add scheme if user typed www. without protocol
      const target = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`;
      const parsed = new URL(target);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
          isValid: false,
          errorMessage: 'Please enter a valid video link.',
          hasMultipleUrls: false,
        };
      }

      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        return {
          isValid: false,
          errorMessage: 'The video link appears to be invalid.',
          hasMultipleUrls: false,
        };
      }

      return {
        isValid: true,
        errorMessage: null,
        hasMultipleUrls: false,
      };
    } catch {
      return {
        isValid: false,
        errorMessage: 'The video link appears to be invalid.',
        hasMultipleUrls: false,
      };
    }
  }

  public isMultipleUrls(input: string): boolean {
    const urlMatches = input.match(/(https?:\/\/|www\.)[^\s]+/gi);
    if (urlMatches && urlMatches.length > 1) {
      return true;
    }
    // Also check for newlines containing multiple URL-like strings
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return lines.length > 1;
  }
}

export const urlValidator = new UrlValidator();
