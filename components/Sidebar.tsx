import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Smartphone, History, User, LogOut, Shield, Send, CreditCard, ChevronRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppData();
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Money', path: '/wallet', icon: CreditCard },
    { name: 'Send Cash', path: '/transfer', icon: Send },
    { name: 'Buy Services', path: '/services/hub', icon: Smartphone },
    { name: 'Records', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (userProfile?.role === 'admin') {
      links.push({ name: 'Admin Hub', path: '/admin', icon: Shield });
  }

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-900 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-24 flex items-center px-8">
          <Logo className="h-10 w-10 mr-3" />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">OBATA <span className="text-blue-500">VTU</span></span>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/services/hub' && location.pathname.startsWith('/services'));
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-[13px] uppercase tracking-wide group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center">
                    <link.icon className={`w-5 h-5 mr-4 transition-colors ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-500'}`} />
                    {link.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 space-y-4">
           <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <div>
                  <p className="text-[10px] font-black text-white uppercase">Need Support?</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Contact Admin</p>
              </div>
           </div>
          <button 
            onClick={() => logout()}
            className="flex items-center w-full px-5 py-4 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all font-bold text-[12px] uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5 mr-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};