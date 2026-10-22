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
      className="group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-emerald-500/15 shadow-md hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/10 cursor-pointer transition-all duration-300 hover:scale-[1.03] select-none"
    >
      {/* Media Image / Thumbnail */}
      <img
        src={item.thumbnailUrl || item.uri}
        alt={item.displayName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
        loading="lazy"
      />

      {/* Video Indicator Overlay */}
      {item.type === 'VIDEO' && (
        <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
          <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
        </div>
      )}

      {/* Bottom Gradient with Save Button */}
      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent flex items-center justify-between">
        <span className="text-[10px] text-slate-200 font-medium px-1 truncate max-w-[70%]">
          {item.dateFormatted}
        </span>

        <button
          onClick={(e) => onQuickSave(item, e)}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shadow-md ${
            item.isSaved
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
              : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-950/30'
          }`}
          title={item.isSaved ? 'Saved' : 'Save Status'}
        >
          {item.isSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
