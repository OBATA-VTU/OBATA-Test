import React, { useState } from 'react';
import { Smartphone, Zap, Tv, LogIn, ArrowRight, LayoutDashboard, Wallet, PiggyBank, History, Award, Code, User, Menu, X, Bell, LogOut, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export type PageView = 'LANDING' | 'DASHBOARD' | 'PRIVACY' | 'TERMS' | 'ABOUT' | 'SUPPORT';
export type DashboardTab = 'OVERVIEW' | 'SERVICES' | 'WALLET' | 'SAVINGS' | 'HISTORY' | 'RESELLER' | 'REWARDS' | 'API' | 'PROFILE' | 'ADMIN';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: PageView) => void;
  isDashboard?: boolean;
  activeTab?: DashboardTab;
  onDashboardNavigate?: (tab: DashboardTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onNavigate, 
  isDashboard = false,
  activeTab,
  onDashboardNavigate 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const handleLogout = async () => {
      await signOut(auth);
      onNavigate('LANDING');
  };

  const navItems = [
    { id: 'OVERVIEW', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'SERVICES', label: 'Services', icon: Smartphone },
    { id: 'WALLET', label: 'Wallet & Withdraw', icon: Wallet },
    { id: 'SAVINGS', label: 'Kolo Savings', icon: PiggyBank },
    { id: 'HISTORY', label: 'Transactions', icon: History },
    { id: 'RESELLER', label: 'Upgrade Package', icon: Zap },
    { id: 'REWARDS', label: 'Rewards & Coupons', icon: Award },
    { id: 'API', label: 'Developer API', icon: Code },
    { id: 'PROFILE', label: 'My Profile', icon: User },
  ];

  if (userProfile?.isAdmin) {
      navItems.push({ id: 'ADMIN', label: 'Admin Panel', icon: Lock });
  }

  const handleTabClick = (tab: DashboardTab) => {
    if (onDashboardNavigate) {
      onDashboardNavigate(tab);
      setIsMobileMenuOpen(false);
    }
  };

  const displayName = userProfile?.username || userProfile?.email?.split('@')[0] || 'User';

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
             {isDashboard || currentUser ? (
               <>
                 <div className="hidden md:flex items-center space-x-4">
                    <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>
                    <div className="flex items-center space-x-2 bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-amber-500 rounded-full overflow-hidden">
                           {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : null}
                        </div>
                        <span className="text-white text-xs">{displayName}</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 hover:text-red-400 transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                 </div>
                 {/* Mobile Menu Toggle */}
                 <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-slate-300 hover:text-white"
                 >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                 </button>
               </>
             ) : (
               <>
                 <button onClick={() => onNavigate('ABOUT')} className="hidden md:block hover:text-blue-400 transition-colors">About</button>
                 <button onClick={() => onNavigate('SUPPORT')} className="hidden md:block hover:text-blue-400 transition-colors">Support</button>
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

      {/* Dashboard Layout */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full relative">
        {isDashboard && currentUser && (
            <>
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/50 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar py-6 pr-6">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id as DashboardTab)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                                    activeTab === item.id 
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-500' : 'text-slate-500'}`} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Mobile Sidebar (Drawer) */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <aside className="absolute inset-y-0 left-0 w-3/4 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto">
                            <div className="flex items-center space-x-2 mb-8">
                                <Logo className="h-8 w-8" />
                                <span className="text-xl font-bold text-white">Menu</span>
                            </div>
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabClick(item.id as DashboardTab)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                            activeTab === item.id 
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-500' : 'text-slate-500'}`} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-red-400 hover:bg-slate-800"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </aside>
                    </div>
                )}
            </>
        )}

        {/* Main Content Area */}
        <main className={`flex-grow py-8 px-4 sm:px-6 md:pl-8 ${isDashboard ? 'md:w-[calc(100%-16rem)]' : 'w-full'}`}>
            {children}
        </main>
      </div>

      {/* Footer (Only show on landing pages or non-dashboard views usually, but kept for consistency) */}
      {!isDashboard && (
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
      )}
    </div>
  );
};