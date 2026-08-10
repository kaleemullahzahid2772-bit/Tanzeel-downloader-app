import React from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onCancelBulk: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeleteSelected,
  onCancelBulk,
}) => {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 max-w-md mx-auto animate-fadeIn select-none">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between">
        
        <div className="flex items-center gap-2 text-xs text-slate-200 font-bold">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {selectedCount} Selected
          </span>
          <button
            onClick={onSelectAll}
            className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3" />
            <span>{selectedCount === totalCount ? 'Deselect' : 'Select All'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete ({selectedCount})</span>
          </button>

          <button
            onClick={onCancelBulk}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
            title="Cancel Multi-select"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
