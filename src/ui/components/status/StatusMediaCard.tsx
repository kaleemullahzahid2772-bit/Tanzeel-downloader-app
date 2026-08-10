import React from 'react';
import { Play, Download, Check } from 'lucide-react';
import type { StatusMedia } from '../../../domain/models/StatusMedia';

interface StatusMediaCardProps {
  item: StatusMedia;
  onPreview: (item: StatusMedia) => void;
  onQuickSave: (item: StatusMedia, e: React.MouseEvent) => void;
}

export const StatusMediaCard: React.FC<StatusMediaCardProps> = ({
  item,
  onPreview,
  onQuickSave,
}) => {
  return (
    <div
      onClick={() => onPreview(item)}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] select-none"
    >
      {/* Media Image / Thumbnail */}
      <img
        src={item.thumbnailUrl || item.uri}
        alt={item.displayName}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Video Indicator Overlay */}
      {item.type === 'VIDEO' && (
        <div className="absolute top-2 left-2 w-7 h-7 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
          <Play className="w-3.5 h-3.5 fill-white ml-0.5 text-white" />
        </div>
      )}

      {/* Bottom Gradient with Save Button */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between">
        <span className="text-[10px] text-slate-300 font-medium px-1 truncate">
          {item.dateFormatted}
        </span>

        <button
          onClick={(e) => onQuickSave(item, e)}
          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
            item.isSaved
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-purple-600/80 hover:bg-purple-500 text-white border-purple-400/30'
          }`}
          title={item.isSaved ? 'Saved' : 'Save Status'}
        >
          {item.isSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
