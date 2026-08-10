import React, { useState } from 'react';
import { X, Clock, Play, FileVideo, Music, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { VideoAnalysisResult } from '../../../domain/models/VideoItem';
import { PLATFORMS_CONFIG } from '../../../services/PlatformDetectorService';

interface AnalysisResultModalProps {
  result: VideoAnalysisResult | null;
  onClose: () => void;
}

export const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const platformConfig = PLATFORMS_CONFIG[result.platform];
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${platformConfig.badgeBg}`}>
              {platformConfig.name}
            </span>
            <span className="text-xs text-slate-400 font-mono">Analyzed Metadata</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Phase 1 Explanatory Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs relative">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-amber-200">Phase 1 Preview Mode</h5>
                <p className="mt-0.5 text-amber-300/90 leading-relaxed text-[11px]">
                  This is a complete architectural preview of the video downloader UI. The actual downloading engine is intentionally disconnected until Phase 3/4.
                </p>
              </div>
            </div>
          </div>

          {/* Video Thumbnail & Duration Overlay */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 shadow-md">
            <img
              src={result.thumbnailUrl}
              alt={result.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <span className="px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                {result.duration}
              </span>

              <span className="px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md font-medium text-slate-300">
                {result.author}
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-purple-600/40 backdrop-blur-sm border border-purple-400/40 flex items-center justify-center text-white shadow-lg">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
            </div>
          </div>

          {/* Video Title */}
          <div>
            <h3 className="text-base font-bold text-slate-100 leading-snug">
              {result.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono truncate">
              {result.url}
            </p>
          </div>

          {/* Available Quality Options */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Output Format & Quality
            </label>

            <div className="grid grid-cols-1 gap-2">
              {result.qualities.map((q, idx) => {
                const isSelected = idx === selectedQualityIndex;
                const Icon = q.isAudioOnly ? Music : FileVideo;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedQualityIndex(idx)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200 ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{q.label}</div>
                        <div className="text-[11px] text-slate-400 uppercase font-mono">{q.format} format</div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-purple-300 font-mono">
                      {q.estimatedSize}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          {/* Phase 1 State Notice Button */}
          <button
            disabled
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Downloader Backend Engine Not Connected (Phase 1)</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
