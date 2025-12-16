import React from 'react';
import { Smartphone, Zap, Tv, LogIn, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export type PageView = 'LANDING' | 'DASHBOARD' | 'PRIVACY' | 'TERMS' | 'ABOUT' | 'SUPPORT';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: PageView) => void;
  isDashboard?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, isDashboard = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('LANDING')}>
            <Logo className="h-10 w-10 md:h-12 md:w-12" />
            
            <div className="hidden sm:block">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                OBATA <span className="text-blue-500">VTU</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8 text-sm font-semibold text-slate-400">
             {isDashboard ? (
               <>
                 <div className="hidden md:flex items-center hover:text-blue-400 transition-colors cursor-pointer">
                    <Smartphone className="w-4 h-4 mr-2" /> Airtime
                 </div>
                 <div className="hidden md:flex items-center hover:text-blue-400 transition-colors cursor-pointer">
                    <Tv className="w-4 h-4 mr-2" /> Cable
                 </div>
                 <div className="flex items-center bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20">
                    <Zap className="w-4 h-4 mr-2 fill-current" /> <span className="hidden sm:inline">Dashboard Active</span>
                 </div>
               </>
             ) : (
               <>
                 <button onClick={() => onNavigate('ABOUT')} className="hover:text-blue-400 transition-colors">About</button>
                 <button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400 transition-colors">Support</button>
                 <button 
                  onClick={() => onNavigate('DASHBOARD')}
                  className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20"
                 >
                    Login <ArrowRight className="ml-2 w-4 h-4" />
                 </button>
               </>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
               <div className="flex items-center space-x-2 mb-4" onClick={() => onNavigate('LANDING')}>
                  <Logo className="h-8 w-8" showRing={false} />
                  <span className="text-xl font-bold text-white">OBATA VTU</span>
               </div>
               <p className="text-slate-500 text-sm">
                 The most reliable platform for Airtime, Data, and Bill payments in Nigeria.
               </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><button onClick={() => onNavigate('ABOUT')} className="hover:text-blue-400">About Us</button></li>
                <li><button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400">Contact Support</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><button onClick={() => onNavigate('PRIVACY')} className="hover:text-blue-400">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate('TERMS')} className="hover:text-blue-400">Terms of Service</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Account</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><button onClick={() => onNavigate('DASHBOARD')} className="hover:text-blue-400">Login / Register</button></li>
                <li><button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400">Help Center</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-600 text-sm">
            <span>&copy; {new Date().getFullYear()} OBATA VTU. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 md:mt-0">
               <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> 100% Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};