import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, orderBy, limit, onSnapshot, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  Users, DollarSign, RefreshCw, Lock, Zap, Activity, 
  ShieldCheck, Trash2, Edit, Search, Cpu, Monitor, 
  FileText, Settings, ChevronRight, ArrowLeft, Building2, 
  Megaphone, Globe, LayoutGrid, Image as ImageIcon, Link as LinkIcon,
  CreditCard, TrendingUp, Heart, Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TransactionTerminal } from './TransactionTerminal';

type AdminPageView = 'HUB' | 'CORE' | 'GROWTH' | 'ORACLE';

const ADMIN_SESSION_KEY = 'OBATA_ADMIN_HUB_AUTH';

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
        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
            setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
            setStats(prev => ({...prev, totalUsers: snap.size}));
        });

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
        toast.success("Welcome Back, Admin.");
    } else toast.error("Unauthorized Access.");
  };

  const approveFunding = async (txn: any) => {
      try {
          await updateDoc(doc(db, 'transactions', txn.id), { status: 'SUCCESS' });
          await updateDoc(doc(db, 'users', txn.userId), { walletBalance: increment(txn.amount) });
          toast.success("Funding Approved!");
      } catch (e) { toast.error("System Error."); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-14 rounded-[3.5rem] w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <div className="bg-blue-600/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-blue-500/20 rotate-3">
            <Lock className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">Control Hub</h1>
          <p className="text-slate-500 mb-10 font-bold text-[10px] uppercase tracking-widest">Enter Authorization Password</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-6 text-white text-center tracking-[0.5em] outline-none transition-all font-mono text-xl"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs">
                Login to Hub
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'HUB') {
      return (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20 text-left">
              <div className="px-2">
                  <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Admin Hub</h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Central Management Operation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <button onClick={() => setView('CORE')} className="group bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 hover:border-blue-500 transition-all duration-500 text-left relative overflow-hidden h-[420px] flex flex-col justify-between shadow-2xl">
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform"><Monitor className="w-8 h-8 text-white" /></div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">Core Panel</h2>
                            <p className="text-slate-400 text-xs font-bold leading-relaxed">Manage members, update service pricing, process manual funding, and manage website brand assets.</p>
                        </div>
                        <div className="flex items-center text-blue-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">Launch Core Management <ChevronRight className="w-4 h-4 ml-2" /></div>
                        <Monitor className="absolute -right-8 -bottom-8 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity" />
                  </button>

                  <button onClick={() => setView('GROWTH')} className="group bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 hover:border-emerald-500 transition-all duration-500 text-left relative overflow-hidden h-[420px] flex flex-col justify-between shadow-2xl">
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform"><Megaphone className="w-8 h-8 text-white" /></div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">Growth Center</h2>
                            <p className="text-slate-400 text-xs font-bold leading-relaxed">Boost your business with direct broadcasts, promo messages, and dynamic social link management.</p>
                        </div>
                        <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">Launch Growth Tools <ChevronRight className="w-4 h-4 ml-2" /></div>
                        <Megaphone className="absolute -right-8 -bottom-8 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity" />
                  </button>

                  <button onClick={() => setView('ORACLE')} className="group bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 hover:border-purple-500 transition-all duration-500 text-left relative overflow-hidden h-[420px] flex flex-col justify-between shadow-2xl">
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform"><Cpu className="w-8 h-8 text-white" /></div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-3">The Oracle</h2>
                            <p className="text-slate-400 text-xs font-bold leading-relaxed">Advanced debugging tools to sync services, test connectivity, and monitor background logs.</p>
                        </div>
                        <div className="flex items-center text-purple-500 text-[10px] font-black uppercase group-hover:text-white transition-colors">Launch Logic Terminal <ChevronRight className="w-4 h-4 ml-2" /></div>
                        <Cpu className="absolute -right-8 -bottom-8 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity" />
                  </button>
              </div>
          </div>
      );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 text-left">
          <div className="flex items-center gap-6 px-2">
              <button onClick={() => setView('HUB')} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-90"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{view} Operations</h1>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Authorized Management Sequence Active</p>
              </div>
          </div>

          {view === 'CORE' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-8">
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                          <Users className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5" />
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total System Members</p>
                          <h3 className="text-5xl font-black text-white font-mono tracking-tighter">{stats.totalUsers}</h3>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                          <CreditCard className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5" />
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Unprocessed Funding</p>
                          <h3 className="text-5xl font-black text-amber-500 font-mono tracking-tighter">{pendingFunding.length}</h3>
                      </div>
                      
                      <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-xl space-y-6">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-4">Branding Assets</h4>
                        {/* Fix: Added Smartphone to lucide-react imports */}
                        <button className="w-full flex items-center justify-between p-5 bg-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500 border border-transparent transition-all"><span>Service Logos</span> <Smartphone className="w-4 h-4" /></button>
                        <button className="w-full flex items-center justify-between p-5 bg-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500 border border-transparent transition-all"><span>Homepage Banners</span> <ImageIcon className="w-4 h-4" /></button>
                        <button className="w-full flex items-center justify-between p-5 bg-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500 border border-transparent transition-all"><span>Support Footer</span> <Heart className="w-4 h-4" /></button>
                      </div>
                  </div>

                  <div className="lg:col-span-8 space-y-10">
                      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                          <div className="flex justify-between items-center mb-10">
                             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Member Management</h3>
                             <div className="relative w-64">
                                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                                <input type="text" placeholder="Search Email/User" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500" />
                             </div>
                          </div>
                          <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
                              {users.filter(u => u.email?.includes(searchTerm) || u.username?.includes(searchTerm)).map(u => (
                                  <div key={u.id} className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex flex-wrap items-center justify-between gap-6 group hover:border-blue-500/50 transition-all">
                                      <div className="flex items-center gap-5">
                                          <img src={u.photoURL} className="w-14 h-14 rounded-2xl border border-slate-800 shadow-xl" />
                                          <div>
                                              <p className="text-white font-black text-sm uppercase">{u.username}</p>
                                              <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">{u.email}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-8">
                                          <div className="text-right">
                                              <p className="text-emerald-400 font-black text-lg font-mono">₦{u.walletBalance?.toLocaleString()}</p>
                                              <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest">{u.role}</p>
                                          </div>
                                          <div className="flex gap-2">
                                              <button className="p-3 bg-slate-900 hover:bg-white hover:text-black rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                                              <button className="p-3 bg-slate-900 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {pendingFunding.length > 0 && (
                          <div className="bg-slate-900 border-2 border-amber-500/30 rounded-[3rem] p-10 shadow-2xl animate-fade-in">
                              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center"><TrendingUp className="w-6 h-6 mr-3 text-amber-500" /> Pending Wallet Credits</h3>
                              <div className="space-y-4">
                                  {pendingFunding.map(f => (
                                      <div key={f.id} className="bg-slate-950 p-6 rounded-[2.2rem] border border-slate-800 flex flex-wrap items-center justify-between gap-6">
                                          <div>
                                              <p className="text-white font-black text-xl italic font-mono tracking-tighter">₦{f.amount?.toLocaleString()}</p>
                                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{f.userEmail}</p>
                                          </div>
                                          <div className="flex gap-4">
                                              <a href={f.proofUrl} target="_blank" className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Proof Image</a>
                                              <button onClick={() => approveFunding(f)} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Confirm Credit</button>
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
              <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 shadow-2xl">
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center"><Megaphone className="w-8 h-8 mr-4 text-emerald-500" /> Global Announcement</h3>
                      <div className="space-y-8">
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Headline</label>
                              <input type="text" placeholder="e.g. Flash Sales are live!" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white font-bold outline-none focus:border-emerald-500 transition-all" />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Message Content</label>
                              <textarea rows={8} placeholder="Enter the message you want all users to see on their dashboard..." className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-white font-medium resize-none outline-none focus:border-emerald-500 transition-all shadow-inner" />
                          </div>
                          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all">Broadcast to All Devices</button>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center"><LinkIcon className="w-5 h-5 mr-3 text-blue-500" /> Footer Links</h4>
                            <div className="space-y-4">
                                <input type="text" placeholder="WhatsApp Number" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white" />
                                <input type="text" placeholder="Instagram URL" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white" />
                                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase">Update Links</button>
                            </div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl">
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-3 text-purple-500" /> Reseller Fees</h4>
                            <div className="space-y-4">
                                <input type="number" placeholder="Upgrade Fee (₦)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white" />
                                <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-[10px] uppercase">Update Fee</button>
                            </div>
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