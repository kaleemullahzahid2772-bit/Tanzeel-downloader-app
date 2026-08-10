import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PLATFORMS_CONFIG } from '../../../services/PlatformDetectorService';
import type { SupportedPlatform } from '../../../domain/models/VideoItem';
import { YoutubeIcon, TiktokIcon, FacebookIcon, InstagramIcon } from '../common/BrandIcons';

interface SupportedPlatformsGridProps {
  onSelectSampleUrl: (url: string) => void;
}

export const SupportedPlatformsGrid: React.FC<SupportedPlatformsGridProps> = ({ onSelectSampleUrl }) => {
  const platformsList: Array<{
    id: SupportedPlatform;
    icon: React.ElementType;
    color: string;
    sampleUrl: string;
  }> = [
    {
      id: 'youtube',
      icon: YoutubeIcon,
      color: 'text-red-500 bg-red-500/10 border-red-500/30',
      sampleUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: 'tiktok',
      icon: TiktokIcon,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      sampleUrl: 'https://tiktok.com/@creator/video/71234567890',
    },
    {
      id: 'facebook',
      icon: FacebookIcon,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      sampleUrl: 'https://facebook.com/watch/?v=1015849382910',
    },
    {
      id: 'instagram',
      icon: InstagramIcon,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
      sampleUrl: 'https://instagram.com/reel/C1234567890/',
    },
  ];

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-slate-300">Supported Platforms</h3>
        <span className="text-xs text-slate-500">Tap card to load sample URL</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {platformsList.map((item) => {
          const config = PLATFORMS_CONFIG[item.id];
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSampleUrl(item.sampleUrl)}
              className="group p-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-purple-500/50 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                  {config.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                  {config.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
