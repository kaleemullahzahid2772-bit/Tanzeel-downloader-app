import React, { useState } from 'react';
import { BottomNavigationBar } from './ui/components/navigation/BottomNavigationBar';
import type { TabType } from './ui/components/navigation/BottomNavigationBar';
import { HomeScreen } from './ui/screens/HomeScreen';
import { StatusScreen } from './ui/screens/StatusScreen';
import { ThemeProvider } from './ui/context/ThemeContext';
import { SettingsProvider } from './ui/context/SettingsContext';
import { DownloadsProvider } from './ui/context/DownloadsContext';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  return (
    <div className="min-h-screen bg-[#e2f2ea] text-slate-900 flex items-center justify-center p-0 md:p-6 select-none font-sans overflow-x-hidden">
      
      {/* Desktop Outer Background Glows */}
      <div className="fixed inset-0 pointer-events-none hidden md:block overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Realistic Mobile Phone Frame Container (Desktop Centered / Full Screen on Mobile) */}
      <div className="w-full md:max-w-[410px] h-screen md:h-[844px] md:max-h-[92vh] bg-[#edf7f2] md:border-[10px] md:border-white/80 md:rounded-[48px] md:shadow-2xl md:shadow-emerald-950/10 flex flex-col relative overflow-hidden md:ring-1 md:ring-emerald-200/60">
        
        {/* Smartphone Camera Notch Pill (Desktop Only) */}
        <div className="hidden md:flex items-center justify-center pt-2.5 pb-1 bg-[#edf7f2] shrink-0 z-50">
          <div className="w-24 h-4 bg-emerald-100/60 rounded-full border border-emerald-200/60 shadow-inner flex items-center justify-end px-3">
            <div className="w-2 h-2 rounded-full bg-emerald-600/40 border border-emerald-300" />
          </div>
        </div>

        {/* Inner Mobile App Screen Viewport */}
        <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden w-full pb-20 pt-1 bg-[#edf7f2]">
          <main className="flex-1 flex flex-col justify-center px-3 sm:px-4 max-w-lg mx-auto w-full">
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'status' && <StatusScreen />}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNavigationBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <DownloadsProvider>
          <MainAppContent />
        </DownloadsProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
