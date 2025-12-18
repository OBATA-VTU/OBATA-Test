
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Added Loader2 to the imports
import { Wallet, Smartphone, Wifi, Tv, Zap, Plus, ArrowRight, Clock, Eye, EyeOff, TrendingUp, ArrowUpRight, Activity, ShieldCheck, Server, Globe, History, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PromoTypingBanner } from '../components/PromoTypingBanner';
import { ReceiptModal } from '../components/ReceiptModal';

export const Dashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    if (!currentUser) return;

    // Use live listener for transactions
    const q = query(
        collection(db, 'transactions'), 
        where('userId', '==', currentUser.uid), 
        orderBy('date', 'desc'), 
        limit(5)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
        setRecentTxns(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setIsLoadingTxns(false);
    }, (err) => {
        console.error("History fetch error:", err);
        setIsLoadingTxns(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <ReceiptModal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} response={selectedTxn} loading={false} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-1">
        <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 text-left uppercase italic tracking-tighter">
            {greeting}, <span className="text-blue-500 capitalize">{userProfile?.username || 'User'}</span>
            </h1>
            <PromoTypingBanner />
        </div>
        <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <Clock className="w-3.5 h-3.5 mr-2 text-blue-500" />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl group transition-all duration-500 hover:border-blue-500/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/10">
                  <Wallet className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-slate-500 font-black tracking-widest text-[10px] uppercase">My Wallet</span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="bg-slate-950 hover:bg-slate-800 text-slate-500 p-3 rounded-2xl transition-all active:scale-95"
              >
                {!showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="mb-12 text-left">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-blue-500">₦</span>
                <h2 className="text-6xl font-black text-white tracking-tighter leading-none font-mono">
                  {showBalance ? (userProfile?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '•••••••'}
                </h2>
              </div>
              <div className="mt-6 flex items-center text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 w-fit px-4 py-1.5 rounded-full border border-emerald-500/10">
                <TrendingUp className="w-3.5 h-3.5 mr-2" />
                <span>Verified Account Level 1</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/wallet')}
                className="flex-1 min-w-[160px] bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
              >
                Add Money
              </button>
              <button 
                onClick={() => navigate('/transfer')}
                className="flex-1 min-w-[160px] bg-slate-950 border border-slate-800 hover:bg-slate-900 text-white px-8 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
              >
                Send Cash
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden group">
           <div className="text-left space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 font-black text-[9px] uppercase tracking-widest">Network Speed</p>
                <div className="flex items-center text-emerald-500 text-[9px] font-black tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-2"></div>
                    STABLE
                </div>
              </div>
              
              <div className="space-y-4">
                  {[
                      { icon: Server, label: 'API HUB', status: 'Stable', lat: '12ms' },
                      { icon: Globe, label: 'GATEWAY', status: 'Active', lat: '45ms' },
                  ].map((node, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-3xl border border-slate-800">
                          <div className="flex items-center space-x-4">
                              <node.icon className="w-5 h-5 text-blue-500" />
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{node.label}</span>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-black text-emerald-400">{node.status}</p>
                              <p className="text-[8px] text-slate-600 font-bold">{node.lat}</p>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
           <Zap className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5 text-blue-500" />
        </div>
      </div>

      <div className="text-left">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-6 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Airtime', icon: Smartphone, color: 'bg-blue-600', path: '/services/airtime', desc: 'Recharge' },
                { label: 'Data', icon: Wifi, color: 'bg-emerald-600', path: '/services/data', desc: 'Bundles' },
                { label: 'Cable', icon: Tv, color: 'bg-purple-600', path: '/services/cable', desc: 'TV Subs' },
                { label: 'Bills', icon: Zap, color: 'bg-amber-600', path: '/services/electricity', desc: 'Electric' },
            ].map(item => (
                <button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-start p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] hover:border-blue-500/50 transition-all duration-300"
                >
                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-black text-white italic uppercase tracking-tighter">{item.label}</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{item.desc}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl text-left">
        <div className="p-10 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">History</h3>
            <button onClick={() => navigate('/history')} className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center hover:text-white transition-colors">
              VIEW RECORDS <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
        <div className="divide-y divide-slate-800/50">
            {isLoadingTxns ? (
                <div className="p-20 text-center flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syncing Records...</p>
                </div>
            ) : recentTxns.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center opacity-20">
                    <History className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Empty Workspace</p>
                </div>
            ) : (
                recentTxns.map((tx) => (
                    <div key={tx.id} onClick={() => setSelectedTxn(tx)} className="p-8 hover:bg-slate-950/50 transition-all flex justify-between items-center cursor-pointer group border-l-4 border-transparent hover:border-blue-500">
                        <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-2xl mr-5 flex items-center justify-center transition-transform group-hover:scale-105 ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? <Plus className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-white font-black text-sm uppercase group-hover:text-blue-400 transition-colors">{tx.description || tx.type}</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                    {tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : 'Pending Trace'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-lg font-mono ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                            </p>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${tx.status === 'SUCCESS' ? 'text-emerald-500' : tx.status === 'FAILED' ? 'text-rose-500' : 'text-amber-500'}`}>
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
