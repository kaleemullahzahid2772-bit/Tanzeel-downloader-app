export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  hasMultipleUrls: boolean;
}

export interface IUrlValidator {
  validate(rawUrl: string): ValidationResult;
  isMultipleUrls(input: string): boolean;
}
