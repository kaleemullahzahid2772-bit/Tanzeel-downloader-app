import React from 'react';
import { HardDrive, Trash2, Database } from 'lucide-react';
import { useDownloads } from '../../context/DownloadsContext';
import { storageMetricsCalculator } from '../../../services/history/StorageMetricsCalculator';

export const StorageManagementCard: React.FC = () => {
  const { tasks, clearHistory } = useDownloads();
  const metrics = storageMetricsCalculator.calculateMetrics(tasks);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Storage & Usage</h3>
            <p className="text-[11px] text-slate-400">Actual local disk space used by completed downloads</p>
          </div>
        </div>
      </div>

      {/* Usage Stats Box */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Used Storage</span>
          <p className="font-extrabold text-base text-purple-300 font-mono mt-0.5">
            {metrics.totalSizeFormatted}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Downloaded Files</span>
          <p className="font-extrabold text-base text-slate-100 font-mono mt-0.5">
            {metrics.completedFileCount} files
          </p>
        </div>
      </div>

      {/* Explicit Storage Actions */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-200">Clear Download History</h4>
            <p className="text-[10px] text-slate-400">Removes history database records only</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Clear download history records? Local files will be kept.')) {
                clearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="font-bold text-xs text-rose-300">Delete All Downloaded Files</h4>
            <p className="text-[10px] text-slate-400">Permanently removes all saved video files</p>
          </div>
          <button
            onClick={() => {
              if (confirm('This will permanently delete all downloaded files from this app.')) {
                clearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-rose-600/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
