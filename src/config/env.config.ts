export interface EnvConfig {
  apiUrl: string;
  isProduction: boolean;
  versionName: string;
  versionCode: number;
}

const isProd = import.meta.env.MODE === 'production';

const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When testing locally in the browser, always use relative path '' to leverage Vite proxy / local server
    if (host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }
  return import.meta.env.VITE_API_URL || '';
};

export const envConfig: EnvConfig = {
  apiUrl: getApiUrl(),
  isProduction: isProd,
  versionName: '1.1.0',
  versionCode: 110,
};
