import React, { createContext, useContext, useEffect, useState } from 'react';
import type { DownloadTaskItem } from '../../domain/models/DownloadTaskItem';
import { TaskState } from '../../domain/models/TaskState';
import { downloadManager } from '../../services/downloader/DownloadManager';

interface DownloadsContextType {
  tasks: DownloadTaskItem[];
  activeFilter: TaskState | 'all';
  setActiveFilter: (filter: TaskState | 'all') => void;
  startDownload: (url: string) => Promise<string>;
  pauseTask: (id: string) => void;
  resumeTask: (id: string) => void;
  cancelTask: (id: string) => void;
  retryTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearHistory: () => void;
  filteredTasks: DownloadTaskItem[];
  activeTask?: DownloadTaskItem;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<DownloadTaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<TaskState | 'all'>('all');

  useEffect(() => {
    const unsubscribe = downloadManager.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return unsubscribe;
  }, []);

  const startDownload = async (url: string) => {
    return downloadManager.startDownload(url);
  };

  const pauseTask = (id: string) => downloadManager.pauseDownload(id);
  const resumeTask = (id: string) => downloadManager.resumeDownload(id);
  const cancelTask = (id: string) => downloadManager.cancelDownload(id);
  const retryTask = (id: string) => downloadManager.retryDownload(id);
  const removeTask = (id: string) => downloadManager.removeTask(id);
  const clearHistory = () => downloadManager.clearAll();

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.state === activeFilter;
  });

  const activeTask = tasks.find(
    (t) =>
      t.state === TaskState.DOWNLOADING ||
      t.state === TaskState.ANALYZING ||
      t.state === TaskState.QUEUED
  );

  return (
    <DownloadsContext.Provider
      value={{
        tasks,
        activeFilter,
        setActiveFilter,
        startDownload,
        pauseTask,
        resumeTask,
        cancelTask,
        retryTask,
        removeTask,
        clearHistory,
        filteredTasks,
        activeTask,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads must be used within a DownloadsProvider');
  }
  return context;
};
