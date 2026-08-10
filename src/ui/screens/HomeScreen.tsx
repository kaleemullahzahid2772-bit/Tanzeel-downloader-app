import React, { useState, useEffect } from 'react';
import { Download, Clipboard, X, AlertCircle, CheckCircle2, WifiOff, Heart, Copy, Check, Info } from 'lucide-react';
import { useDownloads } from '../context/DownloadsContext';
import { platformDetectorService } from '../../services/PlatformDetectorService';
import { networkStatusService } from '../../services/network/NetworkStatusService';
import { TaskState } from '../../domain/models/TaskState';
import type { TabType } from '../components/navigation/BottomNavigationBar';

interface HomeScreenProps {
  onNavigateTab?: (tab: TabType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab: _onNavigateTab }) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Support Modal & About Modal State & Toast State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { startDownload, tasks } = useDownloads();

  useEffect(() => {
    const unsubscribe = networkStatusService.subscribe((online) => {
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  const activeTask = currentTaskId
    ? tasks.find((t) => t.id === currentTaskId)
    : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    } catch {
      showToast('Failed to copy to clipboard');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setErrorMessage(null);
        setCurrentTaskId(null);
      }
    } catch {
      setErrorMessage('Clipboard permission denied. Please paste manually.');
    }
  };

  const handleDownload = async () => {
    if (!isOnline) {
      setErrorMessage('No internet connection. Please check your network and try again.');
      return;
    }

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Paste a video link to continue.');
      return;
    }

    if (!platformDetectorService.isValidUrl(trimmed)) {
      setErrorMessage('Please enter a valid video link (http:// or https://).');
      return;
    }

    setErrorMessage(null);
    try {
      const newId = await startDownload(trimmed);
      setCurrentTaskId(newId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to analyze or download video.');
    }
  };

  const isBusy =
    activeTask?.state === TaskState.ANALYZING ||
    activeTask?.state === TaskState.QUEUED ||
    activeTask?.state === TaskState.DOWNLOADING;

  const loadedMb = activeTask ? (activeTask.downloadedBytes / (1024 * 1024)).toFixed(1) : '0';
  const totalMb =
    activeTask && activeTask.totalBytes > 0
      ? (activeTask.totalBytes / (1024 * 1024)).toFixed(1)
      : '0';

  const speedMb =
    activeTask && activeTask.speedBytesPerSec > 0
      ? (activeTask.speedBytesPerSec / (1024 * 1024)).toFixed(1)
      : '0';

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-1 py-2 max-w-md mx-auto animate-fadeIn select-none relative min-h-[70vh] text-slate-900">
      
      {/* Top Controls Bar (Info Button Left, Heart Button Right) */}
      <div className="w-full flex items-center justify-between z-30 pt-1">
        {/* Info Icon Button in Top-Left Corner */}
        <button
          onClick={() => setIsAboutModalOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center group"
          title="About Tanzeel Pro"
        >
          <Info className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
        </button>

        {/* Support Heart Button in Top-Right Corner */}
        <button
          onClick={() => setIsSupportModalOpen(true)}
          className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center group"
          title="Support TANZEEL App 💚"
        >
          <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-600 group-hover:fill-emerald-500 transition-colors" />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-emerald-300 border border-emerald-500/40 rounded-2xl px-5 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="w-full my-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Offline Mode — Local downloads & WhatsApp statuses remain viewable.</span>
        </div>
      )}

      {/* 1. App Logo / Branding Section (Tanzeel Pro Light Mode) */}
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        <img
          src="/logo.png"
          alt="Tanzeel Pro Logo"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-lg shadow-slate-200 mb-2.5 border border-slate-200/80 bg-white p-1"
        />
        <h1 className="font-extrabold text-2.5xl tracking-tight text-slate-900">
          Tanzeel Pro
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Status Saver & Video Downloader</p>
      </div>

      {/* 2. Main Downloader Card (Positioned in the MIDDLE) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 space-y-4 my-auto">
        
        {/* Link Input Field */}
        <div className="relative w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setErrorMessage(null);
                setCurrentTaskId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isBusy) {
                  handleDownload();
                }
              }}
              placeholder="Paste video link here..."
              className="w-full pl-4 pr-24 py-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm shadow-inner focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />

            <div className="absolute right-2.5 flex items-center">
              {urlInput ? (
                <button
                  onClick={() => {
                    setUrlInput('');
                    setErrorMessage(null);
                    setCurrentTaskId(null);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePaste}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-all active:scale-95"
                  title="Paste link"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Alert Message */}
          {(errorMessage || activeTask?.state === TaskState.FAILED) && (
            <div className="mt-2 text-xs text-rose-600 px-1 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errorMessage || activeTask?.errorMessage || 'Unable to analyze or download video.'}</span>
            </div>
          )}
        </div>

        {/* Large Prominent Download Button */}
        <button
          onClick={handleDownload}
          disabled={isBusy || !urlInput.trim() || !isOnline}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        >
          {activeTask?.state === TaskState.ANALYZING || activeTask?.state === TaskState.QUEUED ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : activeTask?.state === TaskState.DOWNLOADING ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Downloading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>DOWNLOAD</span>
            </div>
          )}
        </button>

        {/* Real Progress Line (Active Downloading State) */}
        {activeTask?.state === TaskState.DOWNLOADING && (
          <div className="w-full pt-2 space-y-1.5 animate-fadeIn">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-200 shadow-sm shadow-emerald-500/50"
                style={{ width: `${activeTask.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-700 px-0.5">
              <span>
                Downloading... {loadedMb} MB / {totalMb} MB {parseFloat(speedMb) > 0 ? `• ${speedMb} MB/s` : ''}
              </span>
              <span className="font-bold">{activeTask.progressPercent}%</span>
            </div>
          </div>
        )}

        {/* Real Download Completion Status Notice */}
        {activeTask?.state === TaskState.COMPLETED && (
          <div className="w-full pt-1 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-sm animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Download complete</span>
          </div>
        )}

      </div>

      <div className="pb-4" />

      {/* 3. Support TANZEEL App Modal */}
      {isSupportModalOpen && (
        <div
          onClick={() => setIsSupportModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 animate-scaleUp relative border border-slate-100"
          >
            {/* Modal Close Icon Button */}
            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title & Subtitle */}
            <div className="text-center space-y-1.5 pt-1">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                Support TANZEEL App 💚
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium px-1">
                If TANZEEL is useful to you, a small tip can help keep it running — completely optional 💚
              </p>
            </div>

            {/* Raast Information Box */}
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 text-left space-y-2 text-slate-800 shadow-inner">
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <span>💚 Donate via Raast ID</span>
              </div>
              <div className="text-xs space-y-1 font-mono pt-1">
                <div>
                  <span className="text-slate-500 font-sans">Raast ID: </span>
                  <span className="font-bold text-slate-900">03274816872</span>
                </div>
                <div className="break-all">
                  <span className="text-slate-500 font-sans">Email: </span>
                  <span className="font-medium text-slate-900">kaleemullahzahid2772@gmail.com</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">Nick: </span>
                  <span className="font-semibold text-slate-900">Kaleem Ullah Zahid</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] font-medium text-slate-500">
              Thank you for your support!
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopyText('kaleemullahzahid2772@gmail.com', 'Email')}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>COPY EMAIL</span>
              </button>

              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all"
              >
                CLOSE
              </button>

              <button
                onClick={() => handleCopyText('03274816872', 'Raast ID')}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>COPY RAAST</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. About Tanzeel Pro Modal */}
      {isAboutModalOpen && (
        <div
          onClick={() => setIsAboutModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-sm w-full space-y-3.5 animate-scaleUp relative border border-slate-100 max-h-[85vh] overflow-y-auto text-left"
          >
            {/* Modal Close Icon Button */}
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Description */}
            <div className="text-center space-y-1 pt-1">
              <h2 className="text-xl font-extrabold text-emerald-950">
                About Tanzeel Pro
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium px-1">
                Tanzeel is a fast, clean, and high-speed video downloader built for high quality media extraction.
              </p>
            </div>

            {/* Key Features Card */}
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-slate-800 shadow-inner">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Key Features</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 pt-0.5 leading-tight font-medium">
                <li>• YouTube, Instagram, Twitter, TikTok, Facebook support</li>
                <li>• Download Full HD & high quality MP4 videos</li>
                <li>• Clean, ad-free experience</li>
                <li>• Install as app on your device (PWA)</li>
              </ul>
            </div>

            {/* Our Projects Card */}
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5 text-slate-800 shadow-inner">
              <div className="text-xs font-bold text-emerald-900">
                Our Projects
              </div>

              <div className="space-y-2">
                {/* Project 1 */}
                <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                    Q
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Quoriam.com</div>
                    <div className="text-[11px] text-slate-500 font-medium">Knowledge & Learning Platform</div>
                  </div>
                </div>

                {/* Project 2 */}
                <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Al-Ulama.org</div>
                    <div className="text-[11px] text-slate-500 font-medium">Islamic Scholarly Resources</div>
                  </div>
                </div>

                {/* Project 3 */}
                <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    S
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Sudoor.org</div>
                    <div className="text-[11px] text-slate-500 font-medium">Digital Services & Tools</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Version / Credit */}
            <div className="text-center pt-1">
              <p className="text-[11px] text-slate-500 font-medium">
                Version 1.1.0 · A project by Al-Ulama & Sudoor.org
              </p>
            </div>

            {/* GOT IT Button */}
            <div className="pt-1">
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all text-center"
              >
                GOT IT
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
