import type { ISettingsRepository } from '../../domain/interfaces/ISettingsRepository';
import type { AppSettings } from '../../domain/models/AppSettings';
import { localStorageService } from '../storage/LocalStorageService';

const SETTINGS_KEY = 'omnidownloader_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  defaultQuality: '1080p',
  defaultFormat: 'mp4',
  downloadLocation: '/storage/emulated/0/Download/OmniDownloader',
  wifiOnly: false,
  autoClearHistory: false,
  notifications: true,
  appVersion: '1.0.0 (Phase 1 Build)',
};

export class SettingsRepositoryImpl implements ISettingsRepository {
  public getSettings(): AppSettings {
    return localStorageService.get<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: AppSettings): void {
    localStorageService.set(SETTINGS_KEY, settings);
  }
}

export const settingsRepository = new SettingsRepositoryImpl();
