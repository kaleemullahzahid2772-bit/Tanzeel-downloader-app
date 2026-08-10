import React from 'react';
import { DownloadCloud, ArrowRight } from 'lucide-react';
import type { DownloadTask } from '../../../domain/models/DownloadTask';
import { PLATFORMS_CONFIG } from '../../../services/PlatformDetectorService';

interface RecentDownloadsPreviewProps {
  tasks: DownloadTask[];
  onViewAll: () => void;
}

export const RecentDownloadsPreview: React.FC<RecentDownloadsPreviewProps> = ({ tasks, onViewAll }) => {
  const recentTasks = tasks.slice(0, 3);

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300">Recent Activity</h3>
          {tasks.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 rounded-full">
              {tasks.length}
            </span>
          )}
        </div>
        
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentTasks.length === 0 ? (
        <div className="w-full p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-500 flex items-center justify-center mb-3">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-semibold text-slate-300">No Recent Downloads</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mt-1">
            Links you analyze and download will appear here in future phases.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentTasks.map((task) => {
            const platformConfig = PLATFORMS_CONFIG[task.platform];

            return (
              <div
                key={task.id}
                className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3 hover:border-slate-700 transition-all"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                  <img
                    src={task.thumbnailUrl}
                    alt={task.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${platformConfig.badgeBg}`}>
                      {platformConfig.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{task.quality}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{task.fileSize}</span>
                    <span className="capitalize text-purple-300 font-medium">{task.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
