import React, { useState, useEffect } from 'react';
import { Download, Clipboard, X, AlertCircle, CheckCircle2, WifiOff, Heart, Copy, Check, Info, Share2, Link as LinkIcon, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDownloads } from '../context/DownloadsContext';
import { platformDetectorService } from '../../services/PlatformDetectorService';
import { networkStatusService } from '../../services/network/NetworkStatusService';
import { TaskState } from '../../domain/models/TaskState';
import { PlatformType } from '../../domain/models/PlatformType';
import { YoutubeIcon, TiktokIcon, InstagramIcon, FacebookIcon } from '../components/common/BrandIcons';
import { PwaInstallBanner } from '../components/common/PwaInstallBanner';
import type { TabType } from '../components/navigation/BottomNavigationBar';

interface DownloadSelection {
  type: 'video' | 'audio';
  quality: string;
  format: 'mp4' | 'mp3';
}

const QUALITY_OPTIONS: Array<{
  id: string;
  label: string;
  type: 'video' | 'audio';
  quality: string;
  format: 'mp4' | 'mp3';
  badge: string;
}> = [
  { id: '1080p', label: '1080p', type: 'video', quality: '1080p', format: 'mp4', badge: 'Full HD' },
  { id: '720p', label: '720p', type: 'video', quality: '720p', format: 'mp4', badge: 'HD' },
  { id: '480p', label: '480p', type: 'video', quality: '480p', format: 'mp4', badge: 'SD' },
  { id: 'mp3', label: 'MP3', type: 'audio', quality: 'mp3', format: 'mp3', badge: 'Audio' },
];

interface HomeScreenProps {
  onNavigateTab?: (tab: TabType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab: _onNavigateTab }) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Support Modal & About Modal State & Toast State & Options Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState<boolean>(false);
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

  const handleDownloadClick = () => {
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
    setIsOptionsModalOpen((prev) => !prev);
  };

  const handleConfirmDownload = async (selection: DownloadSelection) => {
    setIsOptionsModalOpen(false);
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    try {
      const newId = await startDownload(trimmed, {
        quality: selection.quality,
        format: selection.format,
      });
      setCurrentTaskId(newId);
      showToast(`Downloading ${selection.type.toUpperCase()} (${selection.quality})...`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to download media.');
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

  const detectedPlatform = urlInput.trim() ? platformDetectorService.detect(urlInput.trim()) : null;

  const renderInputIcon = () => {
    if (detectedPlatform === PlatformType.YOUTUBE) {
      return <YoutubeIcon className="w-5 h-5 text-red-600 shrink-0" />;
    }
    if (detectedPlatform === PlatformType.TIKTOK) {
      return <TiktokIcon className="w-5 h-5 text-slate-900 shrink-0" />;
    }
    if (detectedPlatform === PlatformType.INSTAGRAM) {
      return <InstagramIcon className="w-5 h-5 text-pink-600 shrink-0" />;
    }
    if (detectedPlatform === PlatformType.FACEBOOK) {
      return <FacebookIcon className="w-5 h-5 text-blue-600 shrink-0" />;
    }
    return <LinkIcon className="w-5 h-5 text-emerald-700 shrink-0" />;
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-1 py-2 max-w-xl mx-auto animate-fadeIn select-none relative min-h-[70vh] text-slate-900 space-y-4 sm:space-y-6">
      
      {/* Top Header Row (Info Left, Logo Center, Share & Heart Right) */}
      <div className="w-full relative flex items-center justify-between z-30 pt-1 pb-2 min-h-[56px]">
        {/* Info Icon Button (Left Badge) */}
        <div className="flex items-center z-10">
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md shadow-xs border border-emerald-100/90 flex items-center justify-center text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 active:scale-95 transition-all cursor-pointer"
            title="About Tanzeel Pro"
          >
            <Info className="w-5 h-5 text-emerald-800" />
          </button>
        </div>

        {/* Absolutely Centered Logo & App Title Header */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-0 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-2.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-emerald-100/90 shadow-xs hover:border-emerald-300 transition-all">
            <div className="w-8 h-8 rounded-xl p-[1.5px] bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 shadow-xs flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[9px] p-0.5 flex items-center justify-center">
                <img src="/logo.png" alt="Tanzeel Pro Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-950 font-black tracking-[0.16em] text-xs sm:text-sm">TANZEEL</span>
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs tracking-wider">PRO</span>
            </div>
          </div>
        </div>

        {/* Right Action Icons (Share & Heart Button) */}
        <div className="flex items-center gap-2 z-10">
          {/* Share Button (Mint Glass) */}
          <button
            onClick={handleShareApp}
            className="w-10 h-10 rounded-2xl bg-emerald-100/70 backdrop-blur-md border border-emerald-200/80 shadow-xs flex items-center justify-center text-emerald-900 hover:bg-emerald-200/80 active:scale-95 transition-all cursor-pointer"
            title="Share App"
          >
            <Share2 className="w-4 h-4 text-emerald-900" />
          </button>

          {/* Heart Button (White Glass) */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md shadow-xs border border-emerald-100/90 flex items-center justify-center text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 active:scale-95 transition-all group cursor-pointer"
            title="Support TANZEEL App 💚"
          >
            <Heart className="w-4.5 h-4.5 fill-emerald-800 text-emerald-800 group-hover:scale-110 transition-transform" />
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
          <span>Offline Mode — Local downloads remain viewable.</span>
        </div>
      )}

      {/* PWA Install Banner (When Installable) */}
      <PwaInstallBanner />

      {/* Main Content Card */}
      <div className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl sm:rounded-[40px] p-6 sm:p-9 shadow-2xl shadow-emerald-950/8 border border-white/90 ring-1 ring-emerald-100/70 max-w-xl mx-auto relative overflow-hidden my-auto space-y-4 sm:space-y-5">
        
        {/* Top Gold Border Line Accent */}
        <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-[3px] bg-gradient-to-r from-transparent via-amber-400/90 to-transparent opacity-80" />

        {/* Clean, Simple & Modern Header */}
        <div className="text-center pt-2 pb-1 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Video Downloader
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium text-center max-w-sm mx-auto leading-relaxed">
            Paste any video link to download in HD quality • Fast & Free
          </p>

          {/* Downloads Served Counter Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 rounded-full text-[11px] font-bold shadow-2xs mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>⚡ 1,247+ downloads served • 100% Free & No Ads</span>
          </div>
        </div>

        {/* Link Input Field (Pill Shape with Real-time Platform Detection) */}
        <div className="w-full pt-1">
          <div className="relative w-full rounded-full border-2 border-emerald-500/35 bg-white px-4 sm:px-5 py-3 sm:py-3.5 flex items-center gap-3 shadow-xs focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
            {renderInputIcon()}
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
                  handleDownloadClick();
                }
              }}
              placeholder="Paste video link here..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
            />

            <div className="shrink-0 flex items-center gap-1.5">
              {urlInput ? (
                <button
                  onClick={() => {
                    setUrlInput('');
                    setErrorMessage(null);
                    setCurrentTaskId(null);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePaste}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  title="Paste link from clipboard"
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
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-200 shadow-sm shadow-emerald-500/50"
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
              <span>Download complete!</span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500 text-center mt-3 animate-pulse flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Waiting for a valid video link...</span>
            </p>
          )}
        </div>

        {/* Format Selection Vertical Slide-up Stack */}
        <AnimatePresence>
          {isOptionsModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 15, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full max-w-[260px] sm:max-w-[280px] mx-auto flex flex-col items-center gap-2 pt-2 pb-1 overflow-hidden"
            >
              <div className="flex items-center justify-between w-full px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Select Quality</span>
                <button
                  onClick={() => setIsOptionsModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full flex flex-col gap-2">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleConfirmDownload({ type: opt.type, quality: opt.quality, format: opt.format })}
                    className="w-full py-2.5 sm:py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500 text-white font-black text-sm sm:text-base tracking-wider shadow-lg shadow-slate-950/20 active:scale-95 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="group-hover:text-emerald-400 transition-colors font-mono">{opt.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Giant Circular Download Button with Ambient Glow */}
        <div className="pt-2 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity duration-300" />
            <button
              onClick={handleDownloadClick}
              disabled={isBusy || !urlInput.trim() || !isOnline}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center border-4 border-white/80 group"
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

      </div>

      {/* Clean Developer Footer at Bottom with Kaleemullah Zahid Link */}
      <div className="w-full text-center py-2">
        <p className="text-xs text-slate-500 font-medium">
          Designed & Developed by{' '}
          <a
            href="https://www.kaleemullahzahid.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors inline-flex items-center gap-0.5"
          >
            <span>Kaleem Ullah Zahid</span>
            <ExternalLink className="w-3 h-3 text-emerald-700" />
          </a>
        </p>
      </div>

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
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                Support TANZEEL App 💚
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium px-1">
                Thank you for using Tanzeel Pro! For queries, feedback, or collaborations, feel free to reach out.
              </p>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 text-left space-y-2.5 text-slate-800 shadow-inner">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>💚 Contact & Developer Info</span>
              </div>
              <div className="text-xs space-y-2 pt-1">
                <div className="break-all flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500 font-sans">Email: </span>
                  <a
                    href="mailto:support@tanzeel.pro"
                    className="font-bold text-emerald-800 hover:underline font-mono"
                  >
                    support@tanzeel.pro
                  </a>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                  <span className="text-slate-500 font-sans">Developer: </span>
                  <a
                    href="https://www.kaleemullahzahid.online/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-800 hover:text-emerald-950 hover:underline inline-flex items-center gap-1 font-sans"
                  >
                    <span>Kaleem Ullah Zahid</span>
                    <ExternalLink className="w-3 h-3 text-emerald-700" />
                  </a>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] font-medium text-slate-500">
              Thank you for your love and support!
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopyText('support@tanzeel.pro', 'Email')}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>COPY EMAIL</span>
              </button>

              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Tanzeel Pro Modal (Top Left Info Button) */}
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
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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

            {/* Feature Highlights Moved From Main UI to Info Modal */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/50 border border-amber-200/80 text-center flex flex-col items-center justify-center shadow-2xs">
                <span className="text-base sm:text-lg">⚡</span>
                <span className="text-[11px] font-extrabold text-amber-950 mt-1 font-arabic">الٹرا فاسٹ</span>
                <span className="text-[9px] text-amber-800 font-semibold">Ultra Fast</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/50 border border-emerald-200/80 text-center flex flex-col items-center justify-center shadow-2xs">
                <span className="text-base sm:text-lg">🎬</span>
                <span className="text-[11px] font-extrabold text-emerald-950 mt-1 font-arabic">فل ایچ ڈی</span>
                <span className="text-[9px] text-emerald-800 font-semibold">Full HD</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-gradient-to-b from-teal-50 to-teal-100/50 border border-teal-200/80 text-center flex flex-col items-center justify-center shadow-2xs">
                <span className="text-base sm:text-lg">🛡️</span>
                <span className="text-[11px] font-extrabold text-teal-950 mt-1 font-arabic">100٪ فری</span>
                <span className="text-[9px] text-teal-800 font-semibold">100% Free</span>
              </div>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-slate-800 shadow-inner">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Key Features</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 pt-0.5 leading-tight font-medium">
                <li>• Multi-platform video download support</li>
                <li>• Download Full HD & high quality MP4 & MP3 audio</li>
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

            <div className="text-center pt-1 space-y-1">
              <p className="text-[11px] text-slate-500 font-medium">
                Version 1.2.0 · Developed by{' '}
                <a
                  href="https://www.kaleemullahzahid.online/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Kaleem Ullah Zahid
                </a>
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all text-center cursor-pointer"
              >
                GOT IT
              </button>
            </div>

          </div>
        </div>
      )}

      {/* End Main Container */}
    </div>
  );
};
