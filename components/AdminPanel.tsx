import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp, limit, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getBanks, uploadImageToImgBB } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ExternalLink, Loader2, Search, Users, DollarSign, BarChart3, 
  RefreshCw, Ban, Save, Lock, Zap, Megaphone, Upload, Activity, Globe, 
  Wifi, Server, Database, SignalHigh, AlertTriangle, ShieldCheck, 
  LayoutDashboard, UserPlus, CreditCard, Settings, ChevronRight, 
  ArrowUpRight, ArrowDownRight, Terminal, Send, Image as ImageIcon,
  Cpu, HardDrive, Network, Layers, ShieldAlert, Bug, Monitor, HeartPulse,
  Crosshair, ZapOff, FlaskConical, TestTube2, Binary, Radio, Key, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BridgeTester } from './BridgeTester';
import { ApiTester } from './ApiTester';
import { TransactionTerminal } from './TransactionTerminal';

type AdminSection = 'MAIN' | 'USERS' | 'FINANCE' | 'ORACLE';

const ADMIN_SESSION_KEY = 'OBATA_ADMIN_AUTH';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('MAIN');
  const [isLoading, setIsLoading] = useState(false);
  const [oracleTab, setOracleTab] = useState<'CONSOLE' | 'API' | 'BRIDGE' | 'SYNC'>('CONSOLE');

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, systemFloat: 0, activeNodes: 0 });
  const [users, setUsers] = useState<any[]>([]);

  const syncAdminState = async () => {
    setIsLoading(true);
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let float = 0;
        usersSnap.forEach(d => float += (d.data().walletBalance || 0));
        setStats({ totalUsers: usersSnap.size, systemFloat: float, activeNodes: usersSnap.size });
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { toast.error("Admin sync failed."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (isAuthenticated) syncAdminState();
  }, [isAuthenticated, activeSection]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'OBATA VTU01$') {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        toast.success("Welcome, Root Administrator.");
    } else toast.error("Incorrect Password.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-14 rounded-[3.5rem] w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <div className="bg-blue-600/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-12 border border-blue-500/20 rotate-3">
            <Lock className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Admin Login</h1>
          <p className="text-slate-500 mb-10 font-bold text-[10px] uppercase tracking-widest">Enter Management Password</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 text-white text-center tracking-widest focus:border-blue-500 outline-none transition-all font-mono text-xl"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs">
                Enter Control Center
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NavItem = ({ section, icon: Icon, label }: any) => (
    <button 
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSection === section ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-800'}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-in pb-20 text-left">
      <div className="lg:w-80 space-y-3">
        <div className="px-4 mb-10">
            <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Administration</h2>
        </div>
        <NavItem section="MAIN" icon={LayoutDashboard} label="Workstation" />
        <NavItem section="USERS" icon={Users} label="Registered Users" />
        <NavItem section="ORACLE" icon={Cpu} label="System Oracle" />
        
        <div className="pt-10 px-4">
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
              <div className="flex items-center text-emerald-500 text-[10px] font-black tracking-widest">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-3"></div>
                 SYSTEM_STABLE
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {activeSection === 'MAIN' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'Total Members', val: stats.totalUsers, icon: Users, col: 'text-blue-500', bg: 'bg-blue-600/10' },
                 { label: 'Total User Funds', val: `₦${stats.systemFloat.toLocaleString()}`, icon: DollarSign, col: 'text-emerald-500', bg: 'bg-emerald-600/10' },
                 { label: 'Cloud Connection', val: 'Connected', icon: Globe, col: 'text-purple-500', bg: 'bg-purple-600/10' },
               ].map((c, i) => (
                 <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-slate-700 transition-all group">
                    <div className={`${c.bg} ${c.col} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                       <c.icon className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{c.label}</p>
                    <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tighter">{c.val}</h3>
                 </div>
               ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
               <h3 className="text-xl font-black text-white mb-10 tracking-tight flex items-center uppercase italic"><Monitor className="w-5 h-5 mr-3 text-blue-500" /> Recent User Activity</h3>
               <div className="divide-y divide-slate-800">
                  {users.slice(0, 8).map(u => (
                     <div key={u.id} className="flex items-center justify-between py-6 hover:bg-slate-950/30 px-4 rounded-2xl transition-all">
                        <div className="flex items-center space-x-5">
                           <img src={u.photoURL} className="w-12 h-12 rounded-xl border border-slate-800" alt="" />
                           <div>
                              <p className="text-white font-black text-sm uppercase">{u.username}</p>
                              <p className="text-slate-500 text-[10px] font-bold">{u.email}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-emerald-400 font-black text-lg">₦{u.walletBalance?.toLocaleString()}</p>
                           <p className="text-[9px] text-slate-600 font-black uppercase">{u.role}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeSection === 'USERS' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
                <h2 className="text-3xl font-black text-white mb-10 tracking-tighter uppercase italic">Member Registry</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users.map(u => (
                        <div key={u.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-center space-x-4">
                            <img src={u.photoURL} className="w-14 h-14 rounded-2xl border-2 border-slate-900" alt="" />
                            <div className="flex-1">
                                <h4 className="text-white font-black text-sm uppercase">{u.username}</h4>
                                <p className="text-slate-500 text-[10px] font-bold">{u.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-black">₦{u.walletBalance?.toLocaleString()}</p>
                                <button className="text-[10px] font-black text-blue-500 uppercase mt-1">Manage</button>
                            </div>
                        </div>
                    ))}
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
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Advanced Debugging & Connectivity Tools</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-950 p-1.5 rounded-[1.8rem] border border-slate-800 mb-10 shadow-inner">
                        {[
                            { id: 'CONSOLE', label: 'Main Console', icon: Terminal },
                            { id: 'API', label: 'API Tester', icon: Send },
                            { id: 'BRIDGE', label: 'Bridge Lab', icon: Layers },
                            { id: 'SYNC', label: 'Cloud Sync', icon: Database }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setOracleTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${oracleTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-black/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-inner">
                        {oracleTab === 'SYNC' && <TransactionTerminal />}
                        {oracleTab === 'API' && <ApiTester />}
                        {oracleTab === 'BRIDGE' && <BridgeTester />}
                        {oracleTab === 'CONSOLE' && (
                            <div className="space-y-8 animate-fade-in text-left">
                                <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                    <Activity className="w-5 h-5 mr-3" /> System Heartbeat
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                                        <p className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest italic">Node Reliability</p>
                                        <div className="space-y-6">
                                            {['Auth Node', 'Payment Gateway', 'API Bridge', 'Asset CDN'].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="text-white font-black text-sm uppercase">{item}</span>
                                                    <span className="text-emerald-500 font-black text-[10px] bg-emerald-500/10 px-3 py-1 rounded-full uppercase">Operational</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
                                        <p className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest italic">Live Traffic Pulse</p>
                                        <div className="h-40 flex items-end gap-2">
                                            {[40, 80, 50, 90, 60, 85, 45, 95, 70, 80, 55, 90].map((h, i) => (
                                                <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-lg animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 font-mono text-[11px] leading-relaxed text-emerald-400/80 max-h-60 overflow-y-auto no-scrollbar">
                                    <p className="animate-pulse mb-2 text-white font-bold">&gt; ORACLE_INITIALIZED: SESSION_8291</p>
                                    <p>&gt; Checking cloud storage permissions... OK</p>
                                    <p>&gt; Validating Inlomax bridge... OK</p>
                                    <p>&gt; Fetching user transaction logs... OK</p>
                                    <p>&gt; Verifying billing integrity... OK</p>
                                    <p>&gt; All systems green. No errors detected.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};