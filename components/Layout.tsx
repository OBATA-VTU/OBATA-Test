import React from 'react';
import { Smartphone, Zap, Tv, Globe } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                OBATA VTU
              </h1>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Vending Terminal
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-400">
             <div className="flex items-center hover:text-white transition-colors cursor-pointer">
                <Smartphone className="w-4 h-4 mr-2" /> Airtime & Data
             </div>
             <div className="flex items-center hover:text-white transition-colors cursor-pointer">
                <Tv className="w-4 h-4 mr-2" /> Cable TV
             </div>
             <div className="flex items-center hover:text-white transition-colors cursor-pointer">
                <Zap className="w-4 h-4 mr-2" /> Electricity
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} OBATA VTU. 
          </p>
        </div>
      </footer>
    </div>
  );
};