import React from 'react';
import { Download, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabType = 'home' | 'status';

interface BottomNavigationBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  downloadCount?: number;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Downloader', icon: Download },
    { id: 'status' as TabType, label: 'WhatsApp Status', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/85 backdrop-blur-2xl border border-white/90 shadow-2xl shadow-emerald-950/15 rounded-full p-1.5 flex items-center justify-center ring-1 ring-emerald-500/10">
      <div className="flex items-center gap-1 sm:gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 py-2 px-4 sm:px-6 rounded-full transition-all duration-300 group cursor-pointer"
            >
              {/* Active Indicator Background pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-emerald-600/15 to-teal-500/15 border border-emerald-500/30 rounded-full shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <Icon
                className={`w-4.5 h-4.5 transition-all duration-200 relative z-10 ${
                  isActive
                    ? 'text-emerald-700 scale-110'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              <span
                className={`text-xs tracking-tight transition-colors relative z-10 ${
                  isActive ? 'text-emerald-950 font-bold' : 'text-slate-500 font-semibold group-hover:text-slate-800'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
