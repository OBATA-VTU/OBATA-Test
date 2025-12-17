import React, { useState, useRef, useEffect } from 'react';
import { Menu, Eye, EyeOff, Bell, ChevronDown, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // You might need to add date-fns or use basic JS date

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

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`p-2 relative rounded-full transition-colors ${showNotifDropdown ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-slate-900"></span>
                )}
            </button>

            {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <span className="text-xs text-slate-500">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold ${n.type === 'WARNING' ? 'text-amber-400' : 'text-white'}`}>{n.title}</h4>
                                        <button onClick={() => markAsRead(n.id)} className="text-slate-600 hover:text-white">
                                            {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{n.message}</p>
                                    <div className="flex justify-between items-center text-[10px] text-slate-600">
                                        <span>{n.date?.toDate ? n.date.toDate().toLocaleDateString() : 'Now'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
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