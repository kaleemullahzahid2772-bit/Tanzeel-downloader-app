import React, { useState, useEffect } from 'react';
import { Edit3, X, Check } from 'lucide-react';

interface RenameDialogModalProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onConfirmRename: (newTitle: string) => void;
}

export const RenameDialogModal: React.FC<RenameDialogModalProps> = ({
  isOpen,
  currentTitle,
  onClose,
  onConfirmRename,
}) => {
  const [newTitle, setNewTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setNewTitle(currentTitle);
    setErrorMsg(null);
  }, [currentTitle, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setErrorMsg('File title cannot be empty.');
      return;
    }

    // Path traversal check
    if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
      setErrorMsg('File title cannot contain path traversal characters (/, \\, ..).');
      return;
    }

    onConfirmRename(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Rename File</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">File Title</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setErrorMsg(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500/80 transition-all"
            placeholder="Enter file title"
            autoFocus
          />
          {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
