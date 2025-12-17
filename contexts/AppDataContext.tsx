import React, { createContext, useContext, useState } from 'react';
import { Notification } from '../types';

interface AppDataContextType {
  notifications: Notification[];
  addNotification: (note: Omit<Notification, 'id' | 'read' | 'date'>) => void;
  markAsRead: (id: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const addNotification = (note: Omit<Notification, 'id' | 'read' | 'date'>) => {
    const newNote: Notification = {
      ...note,
      id: Math.random().toString(36).substring(7),
      read: false,
      date: { toDate: () => new Date() } as any,
    };
    setNotifications((prev) => [newNote, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
      // In a real app, you'd toggle a class on the document body here
  };

  return (
    <AppDataContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        isLoading,
        setLoading,
        sidebarOpen,
        toggleSidebar,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
