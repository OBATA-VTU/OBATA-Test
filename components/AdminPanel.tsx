import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  Users, DollarSign, Globe, RefreshCw, Lock, Zap, Activity, 
  LayoutDashboard, UserPlus, ShieldCheck, Terminal, Trash2, Edit, 
  Search, Cpu, Monitor, ShieldAlert, Key, FileText, Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ApiTester } from './ApiTester';
import { TransactionTerminal } from './TransactionTerminal';

type AdminSection = 'MAIN' | 'USERS' | 'ORACLE';

const ADMIN_SESSION_KEY = 'OBATA_ADMIN_AUTH';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('MAIN');
  const [isLoading, setIsLoading] = useState(false);
  const [oracleTab, setOracleTab] = useState<'API' | 'SYNC'>('SYNC');

  const [stats, setStats] = useState({ totalUsers: 0, systemFloat: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const syncAdminData = async () => {
    setIsLoading(true);
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let float = 0;
        const userList: any[] = [];
        usersSnap.forEach(d => {
            const data = d.data();
            float += (data.walletBalance || 0);
            userList.push({ id: d.id, ...data });
        });
        setStats({ totalUsers: usersSnap.size, systemFloat: float });
        setUsers(userList);
    } catch (e) { toast.error("Could not sync management data."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (isAuthenticated) syncAdminData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'OBATA VTU01$') {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        toast.success("Access Granted.");
    } else toast.error("Access Denied.");
  };

  const handleUpdateBalance = async (userId: string, newBalance: number) => {
      try {
          await updateDoc(doc(db, 'users', userId), { walletBalance: newBalance });
          toast.success("Balance updated.");
          syncAdminData();
      } catch (e) { toast.error("Update failed."); }
  };

  const handleDeleteUser = async (userId: string) => {
      if (!confirm("Are you sure? This cannot be undone.")) return;
      try {
          await deleteDoc(doc(db, 'users', userId));
          toast.success("Member removed.");
          syncAdminData();
      } catch (e) { toast.error("Removal failed."); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <div className="bg-blue-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-blue-500/20">
            <Lock className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Control Center</h1>
          <p className="text-slate-500 mb-10 font-bold text-[10px] uppercase tracking-widest">Enter Admin Credentials</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 text-white text-center tracking-widest focus:border-blue-500 outline-none transition-all font-mono text-xl"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">
                Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-in pb-20 text-left">
      <div className="lg:w-72 space-y-3">
        <div className="px-4 mb-10">
            <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Control Center</h2>
        </div>
        
        {[
            { id: 'MAIN', label: 'Management View', icon: LayoutDashboard },
            { id: 'USERS', label: 'Member Registry', icon: Users },
            { id: 'ORACLE', label: 'System Oracle', icon: Cpu }
        ].map(item => (
            <button 
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSection === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-900 hover:text-white'}`}
            >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
            </button>
        ))}

        <div className="pt-10 px-4">
           <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl">
              <div className="flex items-center text-emerald-500 text-[10px] font-black tracking-widest">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-2"></div>
                 SYSTEM_ONLINE
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {activeSection === 'MAIN' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <Users className="absolute -right-8 -bottom-8 w-40 h-40 opacity-5" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Active Members</p>
                    <h3 className="text-5xl font-black text-white font-mono tracking-tighter">{stats.totalUsers}</h3>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <DollarSign className="absolute -right-8 -bottom-8 w-40 h-40 opacity-5" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total System Float</p>
                    <h3 className="text-5xl font-black text-emerald-400 font-mono tracking-tighter">₦{stats.systemFloat.toLocaleString()}</h3>
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
               <h3 className="text-xl font-black text-white mb-10 tracking-tight flex items-center uppercase italic">Recent Transactions</h3>
               <div className="text-slate-500 text-center py-20 bg-slate-950/50 rounded-[2rem] border border-dashed border-slate-800">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Live Events...</p>
               </div>
            </div>
          </div>
        )}

        {activeSection === 'USERS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-2xl animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Member Registry</h2>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" placeholder="Search members..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-20 text-slate-700 font-bold uppercase tracking-widest text-[10px]">No members found</div>
                    ) : (
                        filteredUsers.map(u => (
                            <div key={u.id} className="bg-slate-950 border border-slate-900 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
                                <div className="flex items-center space-x-4">
                                    <img src={u.photoURL} className="w-12 h-12 rounded-xl border border-slate-800" alt="" />
                                    <div>
                                        <h4 className="text-white font-black text-sm uppercase">{u.username}</h4>
                                        <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">{u.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Balance</p>
                                        <p className="text-emerald-400 font-black text-lg">₦{u.walletBalance?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { const val = prompt("Enter new balance:", u.walletBalance); if(val) handleUpdateBalance(u.id, parseFloat(val)); }} className="p-3 bg-slate-900 hover:bg-white hover:text-black rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteUser(u.id)} className="p-3 bg-slate-900 hover:bg-rose-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeSection === 'ORACLE' && (
            <div className="space-y-10 animate-fade-in">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-8">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter flex items-center uppercase italic">
                                <Cpu className="w-8 h-8 mr-3 text-emerald-500" /> System Oracle
                            </h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Tools for testing and fixing system problems.</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-950 p-1.5 rounded-[1.8rem] border border-slate-800 mb-10 shadow-inner">
                        <button onClick={() => setOracleTab('SYNC')} className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${oracleTab === 'SYNC' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                            <Globe className="w-4 h-4" />
                            <span>System Sync</span>
                        </button>
                        <button onClick={() => setOracleTab('API')} className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${oracleTab === 'API' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                            <Terminal className="w-4 h-4" />
                            <span>Direct Commands</span>
                        </button>
                    </div>

                    <div className="bg-black/50 border border-slate-800 rounded-[2.5rem] p-12 overflow-hidden shadow-inner">
                        {oracleTab === 'SYNC' && <TransactionTerminal />}
                        {oracleTab === 'API' && <ApiTester />}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};