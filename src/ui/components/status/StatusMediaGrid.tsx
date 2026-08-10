import React from 'react';
import { Play, Download, Share2, Check, Image as ImageIcon, Video } from 'lucide-react';
import type { StatusMediaItem } from '../../../domain/models/StatusMedia';

interface StatusMediaGridProps {
  items: StatusMediaItem[];
  onPreview: (item: StatusMediaItem) => void;
  onSave: (item: StatusMediaItem) => void;
  onShare: (item: StatusMediaItem) => void;
}

export const StatusMediaGrid: React.FC<StatusMediaGridProps> = ({
  items,
  onPreview,
  onSave,
  onShare,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md aspect-[3/4] flex flex-col justify-between"
        >
          {/* Background Image/Thumbnail */}
          <img
            src={item.thumbnailUrl}
            alt="Status Media"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40" />

          {/* Top Row Badges */}
          <div className="relative z-10 p-2.5 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-md text-[10px] font-semibold text-slate-300 flex items-center gap-1">
              {item.type === 'video' ? <Video className="w-3 h-3 text-purple-400" /> : <ImageIcon className="w-3 h-3 text-cyan-400" />}
              <span className="capitalize">{item.type}</span>
            </span>

            {item.appType === 'whatsapp_business' && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                Business
              </span>
            )}
          </div>

          {/* Center Play Button for Videos */}
          {item.type === 'video' && (
            <button
              onClick={() => onPreview(item)}
              className="relative z-10 self-center w-11 h-11 rounded-full bg-slate-950/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
          )}

          {/* Bottom Info & Quick Actions */}
          <div className="relative z-10 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
              <span>{item.timestamp}</span>
              <span>{item.fileSize}</span>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => onSave(item)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  item.isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                }`}
              >
                {item.isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Saved
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Save
                  </>
                )}
              </button>

              <button
                onClick={() => onShare(item)}
                className="p-1.5 rounded-xl bg-slate-950/70 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
                title="Share Status"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
