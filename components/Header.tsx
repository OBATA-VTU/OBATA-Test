import React, { useState, useRef, useEffect } from 'react';
import { Menu, Eye, EyeOff, Bell, ChevronDown, Check, X, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { userProfile } = useAuth();
  const { toggleSidebar, notifications, unreadCount, markAsRead } = useAppData();
  const [showBalance, setShowBalance] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setShowNotifDropdown(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 lg:h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Wallet Balance Widget */}
        <div className="hidden md:flex items-center bg-slate-800/50 rounded-2xl px-5 py-2 border border-slate-700 shadow-inner">
            <div className="bg-blue-600/20 p-1.5 rounded-lg mr-3"><Zap className="w-4 h-4 text-blue-500 fill-current" /></div>
            <span className="text-[10px] text-slate-500 mr-3 uppercase font-black tracking-widest">Balance:</span>
            <span className="text-white font-mono font-black text-sm mr-4">
                {showBalance ? `₦${(userProfile?.walletBalance || 0).toLocaleString()}` : '₦ ****.**'}
            </span>
            <button onClick={() => setShowBalance(!showBalance)} className="text-slate-600 hover:text-white transition-colors">
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Account Protected</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`p-2.5 relative rounded-xl border border-slate-800 transition-colors ${showNotifDropdown ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-slate-900"></span>
                )}
            </button>

            {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in z-50">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <h3 className="font-black text-white text-xs uppercase tracking-widest">Alerts</h3>
                        <span className="text-[9px] font-black bg-blue-600 px-2 py-0.5 rounded-full text-white">{unreadCount} New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-20">System clear</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-5 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-600/5' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-xs font-black uppercase ${n.type === 'WARNING' ? 'text-amber-500' : 'text-white'}`}>{n.title}</h4>
                                        <button onClick={() => markAsRead(n.id)} className="text-slate-600 hover:text-white">
                                            {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-bold">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="flex items-center pl-6 border-l border-slate-800 cursor-pointer group" onClick={() => navigate('/profile')}>
            <img 
                src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.username}&background=0EA5E9&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl border border-slate-700 group-hover:border-blue-500 transition-colors"
            />
            <div className="hidden md:block ml-4 text-left">
                <p className="text-[12px] font-black text-white leading-none uppercase tracking-tighter">{userProfile?.username}</p>
                <p className="text-[9px] text-slate-500 leading-none mt-1.5 uppercase font-bold">{userProfile?.role} Account</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-600 ml-3 hidden md:block group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};