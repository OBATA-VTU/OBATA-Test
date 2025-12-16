import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Shield, Smartphone, Wifi, Zap, CreditCard, ChevronRight, Eye, EyeOff, PiggyBank, Award } from 'lucide-react';
import { DashboardTab } from './Layout';

interface DashboardOverviewProps {
  onNavigate: (tab: DashboardTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [greeting, setGreeting] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const transactions = [
    { id: 1, type: 'Data Purchase', desc: 'MTN 1GB SME', amount: '-₦250.00', date: 'Today, 10:23 AM', status: 'Success', icon: Wifi },
    { id: 2, type: 'Wallet Funding', desc: 'Paystack Top-up', amount: '+₦5,000.00', date: 'Yesterday, 4:15 PM', status: 'Success', icon: CreditCard },
    { id: 3, type: 'Electric Bill', desc: 'Ikeja Electric Token', amount: '-₦2,500.00', date: '20 Oct, 7:12 PM', status: 'Success', icon: Zap },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{greeting}, <span className="text-blue-500">Guest</span></h1>
          <p className="text-slate-400">Welcome back to your dashboard.</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => onNavigate('RESELLER')}>
           <div className="bg-amber-500/10 p-2 rounded-full">
              <Shield className="w-5 h-5 text-amber-500" />
           </div>
           <div className="pr-2">
              <p className="text-xs text-slate-500 uppercase font-bold">Account Type</p>
              <p className="text-sm font-bold text-white">Smart Earner <span className="text-xs font-normal text-amber-500 ml-1">(Upgrade)</span></p>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-24 h-24" />
           </div>
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-blue-100 font-medium">Wallet Balance</p>
                 <button onClick={() => setShowBalance(!showBalance)} className="hover:bg-blue-500/20 p-1 rounded transition-colors">
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 </button>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {showBalance ? '₦50,450.00' : '₦ ***.**'}
              </h2>
              <button onClick={() => onNavigate('WALLET')} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors flex items-center w-fit mt-2">
                 + Fund Wallet
              </button>
           </div>
        </div>

        {/* Kolo Savings Card */}
        <div onClick={() => onNavigate('SAVINGS')} className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-900/20 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PiggyBank className="w-24 h-24" />
           </div>
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-purple-100 font-medium">Kolo Savings</p>
                 <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">15% p.a</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {showBalance ? '₦15,000.00' : '₦ ***.**'}
              </h2>
              <div className="flex items-center text-xs text-purple-200 mt-2">
                 <TrendingUp className="w-3 h-3 mr-1" /> +₦0.20 daily interest
              </div>
           </div>
        </div>

        {/* Commission/Bonus Card */}
         <div onClick={() => onNavigate('REWARDS')} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden group hover:border-emerald-500/30 transition-colors cursor-pointer">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award className="w-24 h-24 text-emerald-500" />
           </div>
           <div className="relative z-10">
              <p className="text-slate-400 font-medium mb-4">Referral & Commission</p>
              <h2 className="text-3xl font-bold mb-2 text-emerald-400">₦1,240.00</h2>
              <button onClick={() => onNavigate('WALLET')} className="text-xs text-slate-500 hover:text-white transition-colors">Click to Withdraw</button>
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
         <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionBtn icon={Smartphone} label="Buy Airtime" color="bg-blue-500" onClick={() => onNavigate('SERVICES')} />
            <QuickActionBtn icon={Wifi} label="Buy Data" color="bg-emerald-500" onClick={() => onNavigate('SERVICES')} />
            <QuickActionBtn icon={Zap} label="Pay Bills" color="bg-amber-500" onClick={() => onNavigate('SERVICES')} />
            <QuickActionBtn icon={PiggyBank} label="Save Now" color="bg-pink-500" onClick={() => onNavigate('SAVINGS')} />
         </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <button onClick={() => onNavigate('HISTORY')} className="text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors">
               View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
         </div>
         <div className="divide-y divide-slate-800">
            {transactions.map((tx) => (
               <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-4">
                     <div className={`p-2 rounded-full ${tx.amount.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                        <tx.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-white font-medium">{tx.type}</p>
                        <p className="text-xs text-slate-500">{tx.desc} • {tx.date}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`font-bold ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-slate-200'}`}>{tx.amount}</p>
                     <p className={`text-xs ${tx.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>{tx.status}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const QuickActionBtn = ({ icon: Icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:scale-[1.02] transition-all group">
     <div className={`p-3 rounded-full ${color}/10 ${color.replace('bg-', 'text-')} mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
     </div>
     <span className="text-sm font-semibold text-slate-300 group-hover:text-white">{label}</span>
  </button>
);