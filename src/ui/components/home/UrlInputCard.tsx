import React from 'react';
import { Clipboard, X, AlertCircle, Link2, Sparkles } from 'lucide-react';
import { platformDetectorService, PLATFORMS_CONFIG } from '../../../services/PlatformDetectorService';

interface UrlInputCardProps {
  urlInput: string;
  setUrlInput: (val: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
}

export const UrlInputCard: React.FC<UrlInputCardProps> = ({
  urlInput,
  setUrlInput,
  isAnalyzing,
  onAnalyze,
  errorMsg,
  setErrorMsg,
}) => {
  const detectedPlatform = platformDetectorService.detectPlatform(urlInput);
  const platformConfig = PLATFORMS_CONFIG[detectedPlatform];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        setErrorMsg(null);
      }
    } catch {
      setErrorMsg('Clipboard access permission denied. Please paste manually.');
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setErrorMsg(null);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-purple-950/20 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Video Link Analyzer</span>
        </div>

        {/* Platform Badge */}
        {urlInput.trim().length > 0 && (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${platformConfig.badgeBg}`}>
            {platformConfig.name}
          </span>
        )}
      </div>

      {/* Input Field Container */}
      <div className="relative flex items-center mb-3">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setErrorMsg(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isAnalyzing) {
              onAnalyze();
            }
          }}
          placeholder="Paste video link from YouTube, TikTok, Facebook..."
          className="w-full pl-4 pr-24 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {urlInput ? (
            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePaste}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Message */}
      {errorMsg && (
        <div className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || !urlInput.trim()}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing Link Metadata...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Analyze Link</span>
          </>
        )}
      </button>
    </div>
  );
};
