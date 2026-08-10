import React, { useState } from 'react';
import { Download, Trash2, FolderDown, Search, ArrowUpDown, CheckSquare } from 'lucide-react';
import { useDownloads } from '../context/DownloadsContext';
import { DownloadTaskCard } from '../components/downloads/DownloadTaskCard';
import { RenameDialogModal } from '../components/downloads/RenameDialogModal';
import { DeleteConfirmationModal } from '../components/downloads/DeleteConfirmationModal';
import { BulkActionBar } from '../components/downloads/BulkActionBar';
import { historySearchManager } from '../../services/history/HistorySearchManager';
import { downloadHistoryRepository } from '../../data/repositories/DownloadHistoryRepositoryImpl';
import type { HistorySortOption } from '../../domain/models/HistoryItem';
import type { DownloadTaskItem } from '../../domain/models/DownloadTaskItem';
import { TaskState } from '../../domain/models/TaskState';

export const DownloadsScreen: React.FC = () => {
  const { tasks, activeFilter, setActiveFilter, removeTask, clearHistory } = useDownloads();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<HistorySortOption>('NEWEST');

  // Modal States
  const [renameTarget, setRenameTarget] = useState<DownloadTaskItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DownloadTaskItem | null>(null);

  // Bulk Mode States
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Apply Filter, Search & Sorting
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.state === activeFilter;
  });

  const searchedAndSortedTasks = historySearchManager.searchAndSortTasks(
    filteredTasks,
    searchQuery,
    sortOption
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === searchedAndSortedTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(searchedAndSortedTasks.map((t) => t.id)));
    }
  };

  const handleConfirmRename = async (newTitle: string) => {
    if (renameTarget) {
      renameTarget.title = newTitle;
      await downloadHistoryRepository.renameTask(renameTarget.id, newTitle);
      setRenameTarget(null);
    }
  };

  const handleConfirmDeleteFile = () => {
    if (deleteTarget) {
      removeTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleConfirmHistoryOnly = async () => {
    if (deleteTarget) {
      removeTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => removeTask(id));
    setSelectedIds(new Set());
    setIsBulkMode(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5 animate-fadeIn pb-28 select-none">
      
      {/* Screen Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Download className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 tracking-tight">Downloads</h2>
            <p className="text-[11px] text-slate-400">Manage active & completed video files</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <button
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedIds(new Set());
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                isBulkMode
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Multi-select Mode"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Select</span>
            </button>
          )}

          {tasks.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
              title="Clear all download history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Sort Dropdown */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search downloads by name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500/80 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as HistorySortOption)}
              className="pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-purple-500/80 appearance-none font-semibold cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="LARGEST">Size (Largest)</option>
              <option value="SMALLEST">Size (Smallest)</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-purple-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setActiveFilter(TaskState.DOWNLOADING)}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
            activeFilter === TaskState.DOWNLOADING
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveFilter(TaskState.COMPLETED)}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
            activeFilter === TaskState.COMPLETED
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveFilter(TaskState.FAILED)}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
            activeFilter === TaskState.FAILED
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Failed
        </button>
      </div>

      {/* Downloads List */}
      {searchedAndSortedTasks.length > 0 ? (
        <div className="space-y-3">
          {searchedAndSortedTasks.map((task) => (
            <DownloadTaskCard
              key={task.id}
              task={task}
              isBulkMode={isBulkMode}
              isSelected={selectedIds.has(task.id)}
              onToggleSelect={handleToggleSelect}
              onOpenRename={(t) => setRenameTarget(t)}
              onOpenDelete={(t) => setDeleteTarget(t)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center">
            <FolderDown className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="font-bold text-sm text-slate-300">
            {searchQuery ? 'No Matching Downloads Found' : 'No Downloads Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery
              ? `No download matches "${searchQuery}". Try a different keyword.`
              : 'Pasted video links will appear here with real-time download status & actions.'}
          </p>
        </div>
      )}

      {/* Bulk Mode Floating Action Bar */}
      {isBulkMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={searchedAndSortedTasks.length}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleBulkDelete}
          onCancelBulk={() => {
            setIsBulkMode(false);
            setSelectedIds(new Set());
          }}
        />
      )}

      {/* Rename Dialog Modal */}
      <RenameDialogModal
        isOpen={!!renameTarget}
        currentTitle={renameTarget?.title || ''}
        onClose={() => setRenameTarget(null)}
        onConfirmRename={handleConfirmRename}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemTitle={deleteTarget?.title || 'this file'}
        onClose={() => setDeleteTarget(null)}
        onConfirmHistoryOnly={handleConfirmHistoryOnly}
        onConfirmDeleteFile={handleConfirmDeleteFile}
      />
    </div>
  );
};
