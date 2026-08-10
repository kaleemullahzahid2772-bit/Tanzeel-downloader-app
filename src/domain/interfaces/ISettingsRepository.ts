import type { AppSettings } from '../models/AppSettings';

export interface ISettingsRepository {
  getSettings(): AppSettings;
  saveSettings(settings: AppSettings): void;
}
