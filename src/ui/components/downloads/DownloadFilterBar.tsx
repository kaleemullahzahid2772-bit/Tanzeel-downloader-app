import React from 'react';
import type { DownloadStatus } from '../../../domain/models/DownloadTask';

interface DownloadFilterBarProps {
  activeFilter: DownloadStatus | 'all';
  setActiveFilter: (filter: DownloadStatus | 'all') => void;
  counts: {
    all: number;
    downloading: number;
    completed: number;
    failed: number;
  };
}

export const DownloadFilterBar: React.FC<DownloadFilterBarProps> = ({
  activeFilter,
  setActiveFilter,
  counts,
}) => {
  const filters: Array<{ id: DownloadStatus | 'all'; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'downloading', label: 'Downloading', count: counts.downloading },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'failed', label: 'Failed', count: counts.failed },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;

        return (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{f.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                isActive ? 'bg-purple-800 text-purple-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
