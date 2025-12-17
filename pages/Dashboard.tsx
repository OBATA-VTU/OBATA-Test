import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Smartphone, Wifi, Tv, Zap, Plus, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PromoTypingBanner } from '../components/PromoTypingBanner';

export const Dashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [recentTxns, setRecentTxns] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchTxns = async () => {
        if (!currentUser) return;
        try {
            const q = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid), orderBy('date', 'desc'), limit(3));
            const snap = await getDocs(q);
            setRecentTxns(snap.docs.map(d => ({id: d.id, ...d.data()})));
        } catch(e) { console.error(e); }
    };
    fetchTxns();
  }, [currentUser]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting & Promo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {greeting}, <span className="text-blue-500 capitalize">{userProfile?.username || 'User'}</span>
            </h1>
            <PromoTypingBanner />
        </div>
        <div className="text-slate-400 text-sm">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Wallet Card */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
        </div>
        <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-2">Available Balance</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
                ₦{(userProfile?.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <button 
                onClick={() => navigate('/wallet')}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center"
            >
                <Plus className="w-5 h-5 mr-2" /> Fund Wallet
            </button>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-white font-bold mb-4">Quick Services</h3>
        <div className="grid grid-cols-4 gap-4">
            {[
                { label: 'Airtime', icon: Smartphone, color: 'bg-blue-500', path: '/services/airtime' },
                { label: 'Data', icon: Wifi, color: 'bg-emerald-500', path: '/services/data' },
                { label: 'Cable', icon: Tv, color: 'bg-purple-500', path: '/services/cable' },
                { label: 'Bills', icon: Zap, color: 'bg-amber-500', path: '/services/electricity' },
            ].map(item => (
                <button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
                >
                    <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mb-2 shadow-lg`}>
                        <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-slate-300">{item.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Recent Transactions</h3>
            <button onClick={() => navigate('/history')} className="text-blue-400 text-sm hover:underline">View All</button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {recentTxns.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No recent transactions.</div>
            ) : (
                recentTxns.map((tx) => (
                    <div key={tx.id} className="p-4 border-b border-slate-800 last:border-0 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? <Plus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 -rotate-45" />}
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{tx.description}</p>
                                <p className="text-xs text-slate-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : 'Just now'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold text-sm ${tx.type === 'CREDIT' || tx.type === 'FUNDING' ? 'text-green-500' : 'text-white'}`}>
                                {tx.type === 'CREDIT' || tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase">{tx.status}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};