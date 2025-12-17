import React, { useState } from 'react';
import { Menu, Eye, EyeOff, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { userProfile } = useAuth();
  const { toggleSidebar, notifications } = useAppData();
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 lg:h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Wallet Balance Widget */}
        <div className="hidden md:flex items-center bg-slate-800 rounded-full px-4 py-1.5 border border-slate-700">
            <span className="text-xs text-slate-400 mr-2 uppercase font-bold">Wallet:</span>
            <span className="text-white font-mono font-bold mr-3">
                {showBalance ? `₦${(userProfile?.walletBalance || 0).toLocaleString()}` : '₦ ****.**'}
            </span>
            <button onClick={() => setShowBalance(!showBalance)} className="text-slate-500 hover:text-white">
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <div className="relative">
            <button className="p-2 text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
            </button>
        </div>

        <div className="flex items-center pl-4 border-l border-slate-800 cursor-pointer" onClick={() => navigate('/profile')}>
            <img 
                src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.username}&background=0EA5E9&color=fff`} 
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-slate-700"
            />
            <div className="hidden md:block ml-3">
                <p className="text-sm font-bold text-white leading-none">{userProfile?.username}</p>
                <p className="text-xs text-slate-500 leading-none mt-1 capitalize">{userProfile?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 ml-2 hidden md:block" />
        </div>
      </div>
    </header>
  );
};