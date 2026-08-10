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
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 animate-fadeIn pb-24 select-none text-slate-900">
      
      {/* Screen Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">WhatsApp Status</h2>
            <p className="text-[11px] text-slate-500">Save and share viewable status media</p>
          </div>
        </div>

        {uiState !== 'PERMISSION_REQUIRED' && (
          <button
            onClick={loadStatuses}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-50 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title="Refresh statuses"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* State 1: PERMISSION_REQUIRED */}
      {uiState === 'PERMISSION_REQUIRED' && (
        <div className="text-center py-12 px-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">Storage Access Required</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Allow access to view available WhatsApp Status media stored locally on your device.
            </p>
          </div>

          <button
            onClick={handleGrantAccess}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
          >
            Grant Access
          </button>
        </div>
      )}

      {/* State 2: LOADING */}
      {uiState === 'LOADING' && (
        <div className="text-center py-16 px-4 bg-white/80 border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Checking for statuses...</p>
        </div>
      )}

      {/* State 3: SUCCESS (Grid Display) */}
      {uiState === 'SUCCESS' && (
        <div className="grid grid-cols-3 gap-2.5">
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
        <div className="text-center py-16 px-4 bg-white/80 border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-700">No WhatsApp Statuses Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Open WhatsApp and view statuses first, then tap Refresh.
          </p>

          <button
            onClick={loadStatuses}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all border border-slate-200"
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
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
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
