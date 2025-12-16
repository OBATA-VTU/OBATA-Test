import React from 'react';
import { Smartphone, Zap, Tv } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            {/* Logo Component */}
            <Logo className="h-10 w-10 md:h-12 md:w-12" />
            
            <div className="hidden sm:block">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                OBATA <span className="text-blue-500">VTU</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8 text-sm font-semibold text-slate-400">
             <div className="hidden md:flex items-center hover:text-blue-400 transition-colors cursor-pointer">
                <Smartphone className="w-4 h-4 mr-2" /> Airtime
             </div>
             <div className="hidden md:flex items-center hover:text-blue-400 transition-colors cursor-pointer">
                <Tv className="w-4 h-4 mr-2" /> Cable
             </div>
             <div className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
                <Zap className="w-4 h-4 mr-2 fill-current" /> <span className="hidden sm:inline">Dashboard</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
             <Logo className="h-8 w-8" showRing={false} />
             <span>&copy; {new Date().getFullYear()} OBATA VTU. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};