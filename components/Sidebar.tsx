import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Smartphone, History, User, LogOut, Shield, Send, CreditCard, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppData();
  const location = useLocation();

  const links = [
    { name: 'Home View', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Money', path: '/wallet', icon: CreditCard },
    { name: 'Transfer Cash', path: '/transfer', icon: Send },
    { name: 'Our Services', path: '/services', icon: Smartphone },
    { name: 'My History', path: '/history', icon: History },
    { name: 'My Account', path: '/profile', icon: User },
  ];

  if (userProfile?.role === 'admin') {
      links.push({ name: 'Control Panel', path: '/admin', icon: Shield });
  }

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <Logo className="h-9 w-9 mr-3" />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">OBATA <span className="text-blue-500">VTU</span></span>
        </div>

        <nav className="p-6 space-y-3">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center px-5 py-4 rounded-2xl transition-all font-bold text-[13px] uppercase tracking-wide border ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 border-blue-500' 
                    : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon className={`w-5 h-5 mr-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl flex items-center gap-3 border border-slate-800">
             <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><HelpCircle className="w-5 h-5" /></div>
             <div>
                <p className="text-[10px] font-black text-white uppercase">Need Help?</p>
                <p className="text-[9px] text-slate-500 font-bold">Contact Support</p>
             </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center w-full px-5 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-colors font-bold text-[12px] uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5 mr-4" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};