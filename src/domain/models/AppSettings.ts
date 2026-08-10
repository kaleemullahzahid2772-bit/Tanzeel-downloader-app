export type AppTheme = 'system' | 'light' | 'dark';
export type DefaultQuality = '1080p' | '720p' | '480p' | 'audio';
export type DefaultFormat = 'mp4' | 'mp3';

export interface AppSettings {
  theme: AppTheme;
  defaultQuality: DefaultQuality;
  defaultFormat: DefaultFormat;
  downloadLocation: string;
  wifiOnly: boolean;
  autoClearHistory: boolean;
  notifications: boolean;
  appVersion: string;
}
