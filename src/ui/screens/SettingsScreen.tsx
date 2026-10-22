import React from 'react';
import {
  Settings as SettingsIcon,
  Wifi,
  Bell,
  Moon,
  Sun,
  Monitor,
  Video,
  Info,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { StorageManagementCard } from '../components/settings/StorageManagementCard';
import { LegalNoticesCard } from '../components/settings/LegalNoticesCard';
import { PwaInstallCard } from '../components/settings/PwaInstallCard';
import { envConfig } from '../../config/env.config';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 animate-fadeIn pb-28 select-none">
      
      {/* Screen Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-extrabold text-lg text-slate-100 tracking-tight">Settings</h2>
          <p className="text-[11px] text-slate-400">Download preferences, storage & appearance</p>
        </div>
      </div>

      {/* Section 1: Downloads Preferences */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm text-slate-100">Download Preferences</h3>
        </div>

        {/* Default Quality Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-200">Default Quality</h4>
            <p className="text-[10px] text-slate-400">Preferred video resolution when available</p>
          </div>
          <select
            value={settings.defaultQuality}
            onChange={(e) => updateSettings({ defaultQuality: e.target.value as any })}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="1080p">Best Available (1080p)</option>
            <option value="720p">High Definition (720p)</option>
            <option value="480p">Standard (480p)</option>
            <option value="360p">Low Bandwidth (360p)</option>
          </select>
        </div>

        {/* Default Format Selector */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <h4 className="font-bold text-xs text-slate-200">Default Format</h4>
            <p className="text-[10px] text-slate-400">Preferred container format</p>
          </div>
          <select
            value={settings.defaultFormat}
            onChange={(e) => updateSettings({ defaultFormat: e.target.value as any })}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="mp4">MP4 (Video)</option>
            <option value="mp3">MP3 (Audio Only)</option>
          </select>
        </div>

        {/* Wi-Fi Only Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <div>
              <h4 className="font-bold text-xs text-slate-200">Wi-Fi Only Downloads</h4>
              <p className="text-[10px] text-slate-400">Prevent downloads over mobile data</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ wifiOnly: !settings.wifiOnly })}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              settings.wifiOnly ? 'bg-purple-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.wifiOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <div>
              <h4 className="font-bold text-xs text-slate-200">Download Notifications</h4>
              <p className="text-[10px] text-slate-400">Show alert when downloads complete or fail</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ notifications: !settings.notifications })}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              settings.notifications ? 'bg-purple-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.notifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* PWA App Installation */}
      <PwaInstallCard />

      {/* Section 2: Storage & Usage */}
      <StorageManagementCard />

      {/* Section 3: Appearance */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-purple-400" />
          <span>Appearance</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setTheme('system')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              theme === 'system'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              theme === 'light'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Section 4: Legal & Transparency */}
      <LegalNoticesCard />

      {/* Section 5: About */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Info className="w-4 h-4 text-purple-400" />
            <span>Tanzeel Pro</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
            v{envConfig.versionName} ({envConfig.versionCode})
          </span>
        </div>
      </div>
    </div>
  );
};
