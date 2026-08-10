import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Share2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit3,
} from 'lucide-react';
import type { DownloadTaskItem } from '../../../domain/models/DownloadTaskItem';
import { TaskState } from '../../../domain/models/TaskState';
import { useDownloads } from '../../context/DownloadsContext';
import { backendApiClient } from '../../../services/api/BackendApiClient';

interface DownloadTaskCardProps {
  task: DownloadTaskItem;
  isBulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpenRename?: (task: DownloadTaskItem) => void;
  onOpenDelete?: (task: DownloadTaskItem) => void;
}

export const DownloadTaskCard: React.FC<DownloadTaskCardProps> = ({
  task,
  isBulkMode = false,
  isSelected = false,
  onToggleSelect,
  onOpenRename,
  onOpenDelete,
}) => {
  const { pauseTask, resumeTask, cancelTask, retryTask, removeTask } = useDownloads();

  const isDownloading = task.state === TaskState.DOWNLOADING;
  const isPaused = task.state === TaskState.PAUSED;
  const isCompleted = task.state === TaskState.COMPLETED;
  const isFailed = task.state === TaskState.FAILED;
  const isQueued = task.state === TaskState.QUEUED || task.state === TaskState.ANALYZING;

  const loadedMb = (task.downloadedBytes / (1024 * 1024)).toFixed(1);
  const totalMb = task.totalBytes > 0 ? (task.totalBytes / (1024 * 1024)).toFixed(1) : '0';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: task.title,
          text: `Check out this downloaded video: ${task.title}`,
          url: task.url,
        });
      } catch {
        // Share cancelled
      }
    } else {
      alert(`Sharing URL: ${task.url}`);
    }
  };

  const handleOpen = async () => {
    try {
      const blob = await backendApiClient.downloadMedia(task.url, task.quality);
      if (blob && typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blobUrl = URL.createObjectURL(blob);
        const cleanTitle = (task.title || 'video').replace(/[^a-zA-Z0-9_\-]/g, '_');
        const ext = task.format || 'mp4';
        const filename = `${cleanTitle}.${ext}`;

        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
      }
    } catch {
      window.open(task.url, '_blank');
    }
  };

  return (
    <div
      onClick={() => isBulkMode && onToggleSelect && onToggleSelect(task.id)}
      className={`bg-slate-900/80 border rounded-2xl p-4 shadow-lg transition-all space-y-3 select-none ${
        isSelected
          ? 'border-purple-500 bg-purple-500/5 ring-2 ring-purple-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Metadata Row */}
      <div className="flex items-start gap-3">
        {/* Bulk Checkbox */}
        {isBulkMode && (
          <div className="pt-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect && onToggleSelect(task.id)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500/20"
            />
          </div>
        )}

        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 shrink-0 overflow-hidden relative flex items-center justify-center">
          {task.thumbnailUrl ? (
            <img src={task.thumbnailUrl} alt={task.title} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-6 h-6 text-slate-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-sm text-slate-100 truncate">{task.title || 'Video Download'}</h4>
            {isCompleted && onOpenRename && !isBulkMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRename(task);
                }}
                className="p-1 rounded text-slate-500 hover:text-purple-400"
                title="Rename file"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold font-mono capitalize">
              {task.platform}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {task.quality} • {task.format.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Delete Action */}
        {!isBulkMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenDelete) {
                onOpenDelete(task);
              } else {
                removeTask(task.id);
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete download"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress & State Section */}
      {(isDownloading || isPaused || isQueued) && (
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isPaused ? 'bg-amber-400' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
              }`}
              style={{ width: `${task.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              {isQueued && 'Queued / Analyzing...'}
              {isPaused && 'Paused'}
              {isDownloading && `${loadedMb} MB / ${totalMb} MB`}
            </span>
            <span>{task.progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Completed Notice */}
      {isCompleted && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Download Complete • {loadedMb} MB</span>
        </div>
      )}

      {/* Failed Notice */}
      {isFailed && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{task.errorMessage || 'Download failed'}</span>
        </div>
      )}

      {/* Action Buttons Row */}
      {!isBulkMode && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          {isDownloading && (
            <button
              onClick={() => pauseTask(task.id)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={() => resumeTask(task.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {(isDownloading || isPaused || isQueued) && (
            <button
              onClick={() => cancelTask(task.id)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-500/20 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          {isFailed && (
            <button
              onClick={() => retryTask(task.id)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          {isCompleted && (
            <>
              <button
                onClick={handleOpen}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/20 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
