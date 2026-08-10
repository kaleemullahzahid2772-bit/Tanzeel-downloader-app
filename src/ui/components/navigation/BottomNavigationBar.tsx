import React from 'react';
import { Home, MessageSquare } from 'lucide-react';
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
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'status' as TabType, label: 'Status', icon: MessageSquare },
  ];

  return (
    <nav className="absolute md:absolute fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-lg px-4 py-2">
      <div className="max-w-xs mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center py-1.5 px-6 rounded-2xl transition-all duration-200 group"
            >
              {/* Active Indicator Background pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl shadow-sm shadow-emerald-500/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'text-emerald-600 scale-110'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <span
                  className={`text-[11px] mt-1 font-medium tracking-tight transition-colors ${
                    isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
