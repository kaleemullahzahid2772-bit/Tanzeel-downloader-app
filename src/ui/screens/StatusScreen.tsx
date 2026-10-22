import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldAlert, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import type { StatusMedia } from '../../domain/models/StatusMedia';
import { whatsAppStatusProvider } from '../../services/whatsapp/WhatsAppStatusProvider';
import { statusSaverService } from '../../services/whatsapp/StatusSaverService';
import { StatusMediaCard } from '../components/status/StatusMediaCard';
import { StatusPreviewModal } from '../components/status/StatusPreviewModal';

type StatusUIState = 'PERMISSION_REQUIRED' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR';

export const StatusScreen: React.FC = () => {
  const [uiState, setUiState] = useState<StatusUIState>('LOADING');
  const [statuses, setStatuses] = useState<StatusMedia[]>([]);
  const [selectedItem, setSelectedItem] = useState<StatusMedia | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    initPermissionAndLoad();
  }, []);

  const initPermissionAndLoad = async () => {
    const hasPermission = await whatsAppStatusProvider.checkAccessPermission();
    if (!hasPermission) {
      setUiState('PERMISSION_REQUIRED');
    } else {
      loadStatuses();
    }
  };

  const handleGrantAccess = async () => {
    setUiState('LOADING');
    await whatsAppStatusProvider.requestAccessPermission();
    await loadStatuses();
  };

  const loadStatuses = async () => {
    setIsRefreshing(true);
    try {
      const items = await whatsAppStatusProvider.scanAvailableStatuses();
      setStatuses(items);

      if (items.length === 0) {
        setUiState('EMPTY');
      } else {
        setUiState('SUCCESS');
      }
    } catch {
      setUiState('ERROR');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = async (item: StatusMedia) => {
    try {
      const savedName = await statusSaverService.saveStatusToDevice(item);
      setStatuses((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isSaved: true } : s))
      );
      if (selectedItem?.id === item.id) {
        setSelectedItem((prev) => (prev ? { ...prev, isSaved: true } : null));
      }
      showToast(`Saved as ${savedName}`);
    } catch {
      showToast('Unable to save status.');
    }
  };

  const handleShare = async (item: StatusMedia) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.displayName,
          text: `Check out this WhatsApp status: ${item.displayName}`,
          url: item.uri,
        });
      } catch {
        // Share cancelled
      }
    } else {
      showToast(`Sharing status: ${item.displayName}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 animate-fadeIn pb-24 select-none text-slate-900">
      
      {/* Screen Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-emerald-100/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shadow-xs">
            <ImageIcon className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">WhatsApp Status</h2>
            <p className="text-xs text-slate-500">Save & share viewable status media directly</p>
          </div>
        </div>

        {uiState !== 'PERMISSION_REQUIRED' && (
          <button
            onClick={loadStatuses}
            disabled={isRefreshing}
            className="p-2.5 px-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 disabled:opacity-50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95"
            title="Refresh statuses"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* State 1: PERMISSION_REQUIRED */}
      {uiState === 'PERMISSION_REQUIRED' && (
        <div className="text-center py-12 px-6 bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-3xl space-y-4 shadow-xl shadow-emerald-950/5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">Storage Access Required</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Allow storage access to view and save WhatsApp Status media stored locally on your device.
            </p>
          </div>

          <button
            onClick={handleGrantAccess}
            className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer block"
          >
            Grant Access
          </button>
        </div>
      )}

      {/* State 2: LOADING */}
      {uiState === 'LOADING' && (
        <div className="text-center py-16 px-4 bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl space-y-3 shadow-xs">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Scanning for WhatsApp statuses...</p>
        </div>
      )}

      {/* State 3: SUCCESS (Grid Display) */}
      {uiState === 'SUCCESS' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {statuses.map((item) => (
            <StatusMediaCard
              key={item.id}
              item={item}
              onPreview={(media) => setSelectedItem(media)}
              onQuickSave={(media, e) => {
                e.stopPropagation();
                handleSave(media);
              }}
            />
          ))}
        </div>
      )}

      {/* State 4: EMPTY */}
      {uiState === 'EMPTY' && (
        <div className="text-center py-16 px-4 bg-white/85 backdrop-blur-md border border-emerald-100 rounded-3xl space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 mx-auto flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No WhatsApp Statuses Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Open WhatsApp and view statuses first, then return here and tap Refresh.
          </p>

          <button
            onClick={loadStatuses}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            Refresh
          </button>
        </div>
      )}

      {/* State 5: ERROR */}
      {uiState === 'ERROR' && (
        <div className="text-center py-12 px-4 bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
          <h3 className="font-bold text-sm text-rose-800">Unable to Load Status Media</h3>
          <p className="text-xs text-slate-600">Something went wrong while scanning device storage.</p>
          <button
            onClick={loadStatuses}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Preview Modal */}
      <StatusPreviewModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={handleSave}
        onShare={handleShare}
      />
    </div>
  );
};
