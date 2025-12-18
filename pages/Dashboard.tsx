import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Fixed path for transactions
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
        console.error("Records sync failed:", err);
        setIsLoadingTxns(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-fade-in pb-10 text-left">
      <ReceiptModal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} response={selectedTxn} loading={false} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">
            {greeting}, <span className="text-blue-500 capitalize">{userProfile?.username || 'Member'}</span>
            </h1>
            <PromoTypingBanner />
        </div>
        <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] flex items-center bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-xl">
            <Clock className="w-4 h-4 mr-3 text-blue-500" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl group hover:border-blue-600/30 transition-all duration-700">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20 shadow-2xl">
                  <Wallet className="w-7 h-7 text-blue-400" />
                </div>
                <span className="text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">My Terminal Balance</span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="bg-slate-950 hover:bg-slate-800 text-slate-500 p-4 rounded-2xl transition-all active:scale-90 shadow-xl"
              >
                {!showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="mb-14">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-blue-500">₦</span>
                <h2 className="text-7xl font-black text-white tracking-tighter leading-none font-mono">
                  {showBalance ? (userProfile?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '•••••••'}
                </h2>
              </div>
              <div className="mt-8 flex items-center text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] bg-emerald-500/5 w-fit px-5 py-2 rounded-full border border-emerald-500/10">
                <ShieldCheck className="w-4 h-4 mr-3" />
                <span>Verified Account Level 1</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => navigate('/wallet')}
                className="flex-1 min-w-[180px] bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 rounded-[2.2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30 active:scale-95 transition-all"
              >
                Add Funds
              </button>
              <button 
                onClick={() => navigate('/transfer')}
                className="flex-1 min-w-[180px] bg-slate-950 border border-slate-800 hover:bg-slate-900 text-white px-10 py-6 rounded-[2.2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl"
              >
                Send Money
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
           <div className="space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Network Heartbeat</p>
                <div className="flex items-center text-emerald-500 text-[10px] font-black tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-3"></div>
                    SYSTEM_STABLE
                </div>
              </div>
              
              <div className="space-y-4">
                  {[
                      { icon: Globe, label: 'OUR SERVERS', status: 'ACTIVE', col: 'text-emerald-400' },
                      { icon: ShieldCheck, label: 'ENCRYPTION', status: 'LOCKED', col: 'text-blue-400' },
                  ].map((node, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 group-hover:border-blue-600/30 transition-all">
                          <div className="flex items-center space-x-5">
                              <node.icon className={`w-6 h-6 ${node.col}`} />
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{node.label}</span>
                          </div>
                          <p className={`text-[10px] font-black ${node.col}`}>{node.status}</p>
                      </div>
                  ))}
              </div>
           </div>
           <Zap className="absolute -bottom-12 -right-12 w-56 h-56 opacity-5 text-blue-500 group-hover:rotate-12 transition-transform duration-1000" />
        </div>
      </div>

      <div className="pt-6">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.6em] mb-8 px-2 italic">Automated Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { label: 'Airtime', icon: Smartphone, color: 'bg-blue-600', path: '/services/airtime', desc: 'Instant Top-Up' },
                { label: 'Data', icon: Wifi, color: 'bg-emerald-600', path: '/services/data', desc: 'Cheap SME Bundles' },
                { label: 'Cable', icon: Tv, color: 'bg-purple-600', path: '/services/cable', desc: 'TV Subscription' },
                { label: 'Electricity', icon: Zap, color: 'bg-amber-600', path: '/services/electricity', desc: 'Utility Tokens' },
            ].map(item => (
                <button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex flex-col items-start p-10 bg-slate-900 border border-slate-800 rounded-[3rem] hover:border-blue-600/40 transition-all duration-500 shadow-xl"
                >
                    <div className={`w-14 h-14 rounded-[1.2rem] ${item.color} flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                        <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white italic uppercase tracking-tighter">{item.label}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2 group-hover:text-blue-400 transition-colors">{item.desc}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl mt-8">
        <div className="p-12 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Activity Records</h3>
            <button onClick={() => navigate('/history')} className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center hover:text-white transition-all">
              VIEW HISTORY <ArrowRight className="w-4 h-4 ml-3" />
            </button>
        </div>
        <div className="divide-y divide-slate-800/50">
            {isLoadingTxns ? (
                <div className="p-24 text-center flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-6" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Synchronizing Records...</p>
                </div>
            ) : recentTxns.length === 0 ? (
                <div className="p-24 text-center flex flex-col items-center opacity-20">
                    <History className="w-16 h-16 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Transactions Found</p>
                </div>
            ) : (
                recentTxns.map((tx) => (
                    <div key={tx.id} onClick={() => setSelectedTxn(tx)} className="p-10 hover:bg-slate-950/50 transition-all flex justify-between items-center cursor-pointer group border-l-[6px] border-transparent hover:border-blue-600">
                        <div className="flex items-center">
                            <div className={`w-14 h-14 rounded-2xl mr-6 flex items-center justify-center transition-transform group-hover:scale-110 ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? <Plus className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="text-white font-black text-base uppercase group-hover:text-blue-400 transition-colors tracking-tight">{tx.description || tx.type}</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1.5 flex items-center gap-3">
                                    {tx.date?.toDate ? tx.date.toDate().toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}) : 'Pending...'}
                                    <span className="text-slate-800">•</span>
                                    REF: {tx.reference?.slice(-8) || tx.id.slice(-8)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-2xl font-mono tracking-tighter ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString()}
                            </p>
                            <p className={`text-[9px] font-black uppercase tracking-widest mt-2 px-3 py-1 rounded-full border inline-block ${tx.status === 'SUCCESS' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : tx.status === 'FAILED' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
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