export interface EnvConfig {
  apiUrl: string;
  isProduction: boolean;
  versionName: string;
  versionCode: number;
}

const isProd = import.meta.env.MODE === 'production';

export const envConfig: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL || (isProd ? 'https://api.omnidownloader.app' : 'http://localhost:4000'),
  isProduction: isProd,
  versionName: '1.0.0',
  versionCode: 100,
};
