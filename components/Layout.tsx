import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppData } from '../contexts/AppDataContext';

export const Layout: React.FC = () => {
  const { theme } = useAppData();

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto pb-20">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
};