import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemTitle: string;
  onClose: () => void;
  onConfirmHistoryOnly: () => void;
  onConfirmDeleteFile: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  itemTitle,
  onClose,
  onConfirmHistoryOnly,
  onConfirmDeleteFile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Delete Option</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title message */}
        <p className="text-xs text-slate-300">
          How would you like to delete <span className="font-bold text-slate-100">"{itemTitle}"</span>?
        </p>

        {/* Options */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onConfirmDeleteFile();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete File & History</span>
          </button>

          <button
            onClick={() => {
              onConfirmHistoryOnly();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
          >
            <span>Remove from History Only</span>
          </button>
        </div>

        {/* Footer cancel */}
        <div className="pt-2 text-center border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
