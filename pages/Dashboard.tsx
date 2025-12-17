import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Smartphone, Wifi, Tv, Zap, Plus, ArrowRight, Clock, Eye, EyeOff, TrendingUp, ArrowUpRight, Activity, ShieldCheck, Server, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PromoTypingBanner } from '../components/PromoTypingBanner';

export const Dashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchTxns = async () => {
        if (!currentUser) return;
        try {
            const q = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'), limit(5));
            const snap = await getDocs(q);
            setRecentTxns(snap.docs.map(d => ({id: d.id, ...d.data()})));
        } catch(e) { console.error(e); }
    };
    fetchTxns();
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Greeting & Promo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-1">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-left">
            {greeting}, <span className="text-blue-500 capitalize">{userProfile?.username || 'User'}</span>
            </h1>
            <PromoTypingBanner />
        </div>
        <div className="text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
            <Clock className="w-3 h-3 mr-2 text-blue-500" />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl group transition-all duration-500 hover:border-blue-500/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] transition-all duration-700 group-hover:bg-blue-600/20"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-[60px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600/20 p-2.5 rounded-2xl border border-blue-500/20">
                  <Wallet className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-slate-400 font-semibold tracking-wide text-sm uppercase">Total Balance</span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white p-2.5 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                {!showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="mb-10 text-left">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl md:text-3xl font-bold text-blue-500">₦</span>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none font-mono">
                  {showBalance ? (userProfile?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '•••••••'}
                </h2>
              </div>
              <div className="mt-4 flex items-center text-emerald-400 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 mr-1.5" />
                <span>+2.4% system growth</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/wallet')}
                className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center group/btn active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2 transition-transform group-hover/btn:rotate-90" /> 
                Add Money
              </button>
              <button 
                onClick={() => navigate('/transfer')}
                className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-750 text-white px-6 py-4 rounded-2xl font-bold border border-slate-700 transition-all flex items-center justify-center active:scale-95"
              >
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Smart Intelligence Hub */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden hover:border-blue-500/30 transition-all duration-500 group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-blue-500" />
           </div>
           <div className="text-left space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Infra Health</p>
                <div className="flex items-center text-emerald-500 text-[10px] font-black tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-2"></div>
                    ONLINE
                </div>
              </div>
              
              <div className="space-y-4">
                  {[
                      { icon: Server, label: 'Uplink Node', status: 'Stable', lat: '12ms' },
                      { icon: Globe, label: 'Proxy Relay', status: 'Active', lat: '45ms' },
                  ].map((node, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                          <div className="flex items-center space-x-3">
                              <node.icon className="w-4 h-4 text-blue-500" />
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{node.label}</span>
                          </div>
                          <div className="text-right">
                              <p className="text-[9px] font-black text-emerald-400 leading-none">{node.status}</p>
                              <p className="text-[8px] text-slate-600 mt-0.5">{node.lat}</p>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="pt-4 border-t border-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Pulse</span>
                    <Activity className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="h-8 flex items-end gap-1 px-1">
                      {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75, 45, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                  </div>
              </div>
           </div>
        </div>
      </div>

      <div className="text-left">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-400 fill-amber-400/20" />
            Quick Services
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Airtime', icon: Smartphone, color: 'from-blue-500 to-indigo-600', path: '/services/airtime', desc: 'Instant Topup' },
                { label: 'Data', icon: Wifi, color: 'from-emerald-500 to-teal-600', path: '/services/data', desc: 'Cheap SME' },
                { label: 'Cable', icon: Tv, color: 'from-purple-500 to-fuchsia-600', path: '/services/cable', desc: 'TV Subs' },
                { label: 'Bills', icon: Zap, color: 'from-amber-500 to-orange-600', path: '/services/electricity', desc: 'Power/Gas' },
            ].map(item => (
                <button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-start p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-slate-600 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`}></div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-base font-bold text-white mb-1">{item.label}</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{item.desc}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl text-left">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
            <button onClick={() => navigate('/history')} className="text-blue-400 text-sm font-bold hover:text-blue-300 flex items-center transition-colors">
              View Records <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
        </div>
        <div className="divide-y divide-slate-800/50">
            {recentTxns.length === 0 ? (
                <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                  <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                    <Clock className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="font-medium">No recent transactions found.</p>
                  <p className="text-xs text-slate-600 mt-1">Start transacting to see history here.</p>
                </div>
            ) : (
                recentTxns.map((tx) => (
                    <div key={tx.id} className="p-6 hover:bg-slate-850 transition-all flex justify-between items-center cursor-pointer group">
                        <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-2xl mr-4 flex items-center justify-center transition-transform group-hover:scale-105 ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? <Plus className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">{tx.description}</p>
                                <p className="text-xs text-slate-500 font-medium flex items-center mt-1">
                                    {tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : 'Just now'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-lg ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                            </p>
                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${tx.status === 'SUCCESS' ? 'text-emerald-500' : tx.status === 'FAILED' ? 'text-rose-500' : 'text-amber-500'}`}>
                                {tx.status}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};