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
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#edf8f2] via-[#e7f4ed] to-[#f2faf6] text-slate-900 flex flex-col items-center justify-between font-sans selection:bg-emerald-500/20 selection:text-emerald-950 relative overflow-x-hidden">
      
      {/* Ambient Gradient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 -right-32 w-[450px] h-[450px] bg-amber-400/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Responsive Application Shell */}
      <div className="w-full max-w-2xl sm:max-w-3xl flex-1 flex flex-col justify-start px-3.5 sm:px-6 md:px-8 pt-4 pb-28 sm:pb-32 relative z-10 transition-all">
        <main className="w-full flex-1 flex flex-col justify-center">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'status' && <StatusScreen />}
        </main>
      </div>

      {/* Floating Glassmorphic Bottom Navigation Dock */}
      <BottomNavigationBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
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
