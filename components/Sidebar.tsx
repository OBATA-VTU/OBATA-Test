import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Smartphone, History, User, LogOut, Settings, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppData();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Fund Wallet', path: '/wallet', icon: Wallet },
    { name: 'Transfer', path: '/transfer', icon: Send },
    { name: 'Services', path: '/services', icon: Smartphone },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (userProfile?.role === 'admin') {
      links.push({ name: 'Admin', path: '/admin', icon: Settings });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Logo className="h-8 w-8 mr-3" />
          <span className="text-xl font-bold text-white">OBATA VTU</span>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button 
            onClick={() => logout()}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};