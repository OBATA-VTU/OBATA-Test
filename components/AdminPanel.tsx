import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  Users, DollarSign, RefreshCw, Lock, Zap, Activity, 
  LayoutDashboard, ShieldCheck, Trash2, Edit, 
  Search, Cpu, Monitor, FileText, Settings, 
  ChevronRight, ArrowLeft, Building2, Megaphone, Globe, Smartphone, Tv, LayoutGrid, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TransactionTerminal } from './TransactionTerminal';

type AdminPageView = 'HUB' | 'CORE' | 'GROWTH' | 'ORACLE';

const ADMIN_SESSION_KEY = 'OBATA_ADMIN_AUTH_SECURE';

export const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminPageView>('HUB');
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  
  const [stats, setStats] = useState({ totalUsers: 0, systemFloat: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingFunding, setPendingFunding] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
        // Stats listener
        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
            setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
            setStats(prev => ({...prev, totalUsers: snap.size}));
        });

        // Transactions listener
        const unsubscribeTxns = onSnapshot(query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(50)), (snap) => {
            const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setTransactions(list);
            setPendingFunding(list.filter((t: any) => t.type === 'FUNDING' && t.method === 'MANUAL' && t.status === 'PENDING'));
        });

        return () => { unsubscribeUsers(); unsubscribeTxns(); };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'OBATA VTU01$') {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        toast.success("Authorized.");
    } else toast.error("Denied.");
  };

  const approveFunding = async (txn: any) => {
      try {
          await updateDoc(doc(db, 'transactions', txn.id), { status: 'SUCCESS' });
          await updateDoc(doc(db, 'users', txn.userId), { walletBalance: increment(txn.amount) });
          toast.success("Funded!");
      } catch (e) { toast.error("Error."); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <Lock className="w-12 h-12 text-blue-500 mx-auto mb-10" />
          <h1 className="text-3xl font-black text-white mb-10 tracking-tighter italic uppercase">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="ENTER KEY" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-6 text-white text-center tracking-[0.5em] outline-none font-mono text-xl" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 shadow-2xl transition-all">Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'HUB') {
      return (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20 text-left">
              <div className="px-2">
                  <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Admin Hub</h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Authorized Management Operations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <button onClick={() => setView('CORE')} className="group bg-slate-900 border border-slate-800 rounded-[3rem] p-10 hover:border-blue-500/50 transition-all duration-500 text-left relative overflow-hidden h-[400px] flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-10 shadow-2xl"><Monitor className="w-8 h-8 text-white" /></div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Core Panel</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Users, Pricing, Funding & Assets</p>
                        </div>
                        <div className="flex items-center text-blue-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">ENTER MANAGEMENT <ChevronRight className="w-4 h-4 ml-2" /></div>
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity"><Monitor className="w-48 h-48" /></div>
                  </button>

                  <button onClick={() => setView('GROWTH')} className="group bg-slate-900 border border-slate-800 rounded-[3rem] p-10 hover:border-emerald-500/50 transition-all duration-500 text-left relative overflow-hidden h-[400px] flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mb-10 shadow-2xl"><Megaphone className="w-8 h-8 text-white" /></div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Growth Center</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Broadcasts & Promotions</p>
                        </div>
                        <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">ENTER MARKETING <ChevronRight className="w-4 h-4 ml-2" /></div>
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity"><Megaphone className="w-48 h-48" /></div>
                  </button>

                  <button onClick={() => setView('ORACLE')} className="group bg-slate-900 border border-slate-800 rounded-[3rem] p-10 hover:border-purple-500/50 transition-all duration-500 text-left relative overflow-hidden h-[400px] flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center mb-10 shadow-2xl"><Cpu className="w-8 h-8 text-white" /></div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">System Oracle</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Connectivity & Diagnostics</p>
                        </div>
                        <div className="flex items-center text-purple-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">ENTER TERMINAL <ChevronRight className="w-4 h-4 ml-2" /></div>
                        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu className="w-48 h-48" /></div>
                  </button>
              </div>
          </div>
      );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 text-left">
          <div className="flex items-center gap-6 px-2">
              <button onClick={() => setView('HUB')} className="p-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-500 hover:text-white transition-all active:scale-90"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{view} Panel</h1>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Management Sequence Active</p>
              </div>
          </div>

          {view === 'CORE' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Sidebar Stats */}
                  <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Total Node Members</p>
                          <h3 className="text-4xl font-black text-white font-mono">{stats.totalUsers}</h3>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Manual Funding Queue</p>
                          <h3 className="text-4xl font-black text-amber-500 font-mono">{pendingFunding.length}</h3>
                      </div>
                      
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Asset Management</h4>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-950 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all"><span>Upload Service Logos</span> <ImageIcon className="w-4 h-4" /></button>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-950 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all"><span>Website Images</span> <LayoutGrid className="w-4 h-4" /></button>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-950 rounded-2xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all"><span>Social Links</span> <LinkIcon className="w-4 h-4" /></button>
                      </div>
                  </div>

                  {/* Main Core Content */}
                  <div className="lg:col-span-8 space-y-8">
                      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                          <h3 className="text-xl font-black text-white italic uppercase mb-8">User Management</h3>
                          <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                              {users.slice(0, 10).map(u => (
                                  <div key={u.id} className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between group">
                                      <div className="flex items-center gap-4">
                                          <img src={u.photoURL} className="w-12 h-12 rounded-xl" />
                                          <div><p className="text-white font-black text-sm uppercase">{u.username}</p><p className="text-[8px] text-slate-600 font-bold uppercase">{u.email}</p></div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-emerald-400 font-black text-lg">₦{u.walletBalance?.toLocaleString()}</p>
                                          <button className="text-[9px] font-black text-blue-500 uppercase hover:text-white transition-colors">Edit Node</button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {pendingFunding.length > 0 && (
                          <div className="bg-slate-900 border-2 border-amber-500/30 rounded-[3rem] p-10 shadow-2xl">
                              <h3 className="text-xl font-black text-white italic uppercase mb-8">Pending Deposits</h3>
                              <div className="space-y-4">
                                  {pendingFunding.map(f => (
                                      <div key={f.id} className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between">
                                          <div><p className="text-white font-black text-sm italic">₦{f.amount}</p><p className="text-[8px] text-slate-500 uppercase font-bold">{f.userEmail}</p></div>
                                          <div className="flex gap-2">
                                              <a href={f.proofUrl} target="_blank" className="bg-slate-800 px-6 py-2 rounded-xl text-[8px] font-black uppercase text-white">View Proof</a>
                                              <button onClick={() => approveFunding(f)} className="bg-blue-600 px-6 py-2 rounded-xl text-[8px] font-black uppercase text-white">Approve</button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {view === 'GROWTH' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">Broadcast Message</h3>
                      <div className="space-y-6">
                          <input type="text" placeholder="Title (e.g Promo Active)" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold" />
                          <textarea rows={6} placeholder="Message Body..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold resize-none" />
                          <button className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Push to All Users</button>
                      </div>
                  </div>
              </div>
          )}

          {view === 'ORACLE' && (
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in">
                  <TransactionTerminal />
              </div>
          )}
      </div>
  );
};

// Helper for atomic increments
const increment = (n: number) => {
    return (prev: any) => (prev || 0) + n;
};