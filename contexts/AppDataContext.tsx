import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

interface AppDataContextType {
  notifications: Notification[];
  unreadCount: number;
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
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Real-time Notification Listener
  useEffect(() => {
    if (!currentUser) {
        setNotifications([]);
        return;
    }

    // Listener for Global Broadcasts
    const qGlobal = query(
        collection(db, 'notifications'), 
        where('target', '==', 'ALL'),
        orderBy('date', 'desc'),
        limit(10)
    );

    // Listener for User Specific
    const qUser = query(
        collection(db, 'notifications'),
        where('target', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(10)
    );

    // Combine listeners (Simplified for this context, usually needs complex merge)
    // For simplicity, we'll just listen to global broadcasts for the demo to ensure the bell works immediately
    const unsubscribe = onSnapshot(qGlobal, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Notification[];
        
        // Mark local read status (in a real app, read status is stored in a subcollection 'reads')
        // Here we just set them to state
        setNotifications(notes);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppDataContext.Provider
      value={{
        notifications,
        unreadCount,
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