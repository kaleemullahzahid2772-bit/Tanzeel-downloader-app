import React, { useState, useEffect } from 'react';
import { Download, Clipboard, X, AlertCircle, CheckCircle2, WifiOff, Heart, Copy, Check, Info, Share2, Link as LinkIcon } from 'lucide-react';
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

  const handleShareApp = async () => {
    const shareData = {
      title: 'Tanzeel Pro',
      text: 'Download high quality HD videos from YouTube, TikTok, Instagram & Facebook with Tanzeel Pro!',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Share dismissed
      }
    } else {
      handleCopyText(window.location.href, 'App Link');
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
      
      {/* Top Header Row (Info Left, Logo Center, Share & Heart Right) */}
      <div className="w-full flex items-center justify-between z-30 pt-1 pb-2">
        {/* Info Icon Button (Left Circular Badge) */}
        <button
          onClick={() => setIsAboutModalOpen(true)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-emerald-100/90 flex items-center justify-center text-slate-700 hover:bg-emerald-50 active:scale-95 transition-all"
          title="About Tanzeel Pro"
        >
          <Info className="w-5 h-5 text-emerald-800" />
        </button>

        {/* Center Logo & App Title Header */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-2xl p-[2px] bg-gradient-to-b from-amber-300 via-amber-200 to-emerald-300 shadow-md shadow-emerald-950/10 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] p-0.5 flex items-center justify-center">
              <img src="/logo.png" alt="Tanzeel Pro Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="text-emerald-950 font-extrabold tracking-[0.2em] text-xs sm:text-sm mt-1 flex items-center justify-center gap-1">
            <span>T A N Z E E L</span>
            <span className="text-amber-500 font-bold">•</span>
          </div>
        </div>

        {/* Right Action Icons (Share & Heart Button) */}
        <div className="flex items-center gap-2">
          {/* Share Button (Mint Rounded Square) */}
          <button
            onClick={handleShareApp}
            className="w-10 h-10 rounded-2xl bg-emerald-100/70 border border-emerald-200/60 flex items-center justify-center text-emerald-900 hover:bg-emerald-200/80 active:scale-95 transition-all"
            title="Share App"
          >
            <Share2 className="w-4 h-4 text-emerald-900" />
          </button>

          {/* Heart Button (White Circular Badge) */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-emerald-100/90 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all"
            title="Support TANZEEL App 💚"
          >
            <Heart className="w-5 h-5 fill-emerald-800 text-emerald-800" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-emerald-300 border border-emerald-500/40 rounded-2xl px-5 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-fadeIn">
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

      {/* Main Content White Card (Exact Screenshot Design) */}
      <div className="w-full bg-white rounded-[36px] p-5 sm:p-7 shadow-xl shadow-emerald-950/5 border border-emerald-100/80 max-w-md mx-auto relative overflow-hidden my-auto space-y-3.5">
        
        {/* Top Gold Border Line Accent */}
        <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent opacity-80" />

        {/* 1. Large Arabic Calligraphy Title: سحر التحميل */}
        <div className="text-center pt-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900 font-arabic tracking-wide leading-tight">
            سحر التحميل
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 font-medium text-center mt-2 max-w-xs mx-auto leading-relaxed">
            Paste any video link to download in HD quality. Free, fast, no ads.
          </p>

          {/* Downloads Served Counter Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 rounded-full text-[11px] font-bold mt-2.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>1,247+ downloads served</span>
          </div>
        </div>



        {/* 3. Link Input Field (Pill Shape with Link Icon) */}
        <div className="w-full pt-1">
          <div className="relative w-full rounded-full border-2 border-emerald-500/35 bg-white px-4 py-2.5 sm:py-3 flex items-center gap-2.5 shadow-xs focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
            <LinkIcon className="w-5 h-5 text-emerald-700 shrink-0" />
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
              placeholder="Paste link here..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none"
            />

            <div className="shrink-0 flex items-center">
              {urlInput ? (
                <button
                  onClick={() => {
                    setUrlInput('');
                    setErrorMessage(null);
                    setCurrentTaskId(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePaste}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 active:scale-95 transition-all"
                  title="Paste link"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          {/* Status Message below Input Field */}
          {errorMessage || activeTask?.state === TaskState.FAILED ? (
            <div className="mt-2 text-xs text-rose-600 font-semibold px-1 flex items-center justify-center gap-1.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errorMessage || activeTask?.errorMessage || 'Unable to analyze or download video.'}</span>
            </div>
          ) : activeTask?.state === TaskState.DOWNLOADING ? (
            <div className="w-full pt-3 space-y-1.5 animate-fadeIn">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-200 shadow-sm shadow-emerald-500/50"
                  style={{ width: `${activeTask.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 px-1 font-bold">
                <span>
                  Downloading... {loadedMb} MB / {totalMb} MB {parseFloat(speedMb) > 0 ? `• ${speedMb} MB/s` : ''}
                </span>
                <span>{activeTask.progressPercent}%</span>
              </div>
            </div>
          ) : activeTask?.state === TaskState.COMPLETED ? (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs animate-fadeIn flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Download complete</span>
            </div>
          ) : (
            <p className="text-xs font-bold text-slate-500 text-center mt-3 animate-pulse">
              Waiting for a valid link...
            </p>
          )}
        </div>

        {/* 4. Giant Circular Download Button (Screenshot Design) */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleDownload}
            disabled={isBusy || !urlInput.trim() || !isOnline}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center border-4 border-white/60 group"
            title="Download Video"
          >
            {activeTask?.state === TaskState.ANALYZING || activeTask?.state === TaskState.QUEUED ? (
              <div className="w-9 h-9 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-10 h-10 sm:w-11 sm:h-11 text-white stroke-[2.5] group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>

      </div>

      <div className="pb-4" />

      {/* Support TANZEEL App Modal */}
      {isSupportModalOpen && (
        <div
          onClick={() => setIsSupportModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 animate-scaleUp relative border border-slate-100"
          >
            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                Support TANZEEL App 💚
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium px-1">
                If TANZEEL is useful to you, a small tip can help keep it running — completely optional 💚
              </p>
            </div>

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

      {/* About Tanzeel Pro Modal */}
      {isAboutModalOpen && (
        <div
          onClick={() => setIsAboutModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-sm w-full space-y-3.5 animate-scaleUp relative border border-slate-100 max-h-[85vh] overflow-y-auto text-left"
          >
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <h2 className="text-xl font-extrabold text-emerald-950">
                About Tanzeel Pro
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium px-1">
                Tanzeel is a fast, clean, and high-speed video downloader built for high quality media extraction.
              </p>
            </div>

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

            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5 text-slate-800 shadow-inner">
              <div className="text-xs font-bold text-emerald-900">
                Our Projects
              </div>

              <div className="space-y-2">
                <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                    Q
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Quoriam.com</div>
                    <div className="text-[11px] text-slate-500 font-medium">Knowledge & Learning Platform</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Al-Ulama.org</div>
                    <div className="text-[11px] text-slate-500 font-medium">Islamic Scholarly Resources</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 shadow-xs flex items-center gap-3">
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

            <div className="text-center pt-1">
              <p className="text-[11px] text-slate-500 font-medium">
                Version 1.1.0 · A project by Al-Ulama & Sudoor.org
              </p>
            </div>

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
