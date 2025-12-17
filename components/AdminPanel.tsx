import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp, limit } from 'firebase/firestore';
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
  Crosshair, ZapOff, FlaskConical, TestTube2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type AdminSection = 'MAIN' | 'USERS' | 'FINANCE' | 'MEDIA' | 'ORACLE';

const ADMIN_SESSION_KEY = 'OBATA_ADMIN_AUTH';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('MAIN');
  const [isLoading, setIsLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, systemFloat: 0, activeNodes: 0 });
  const [users, setUsers] = useState<any[]>([]);

  // Asset Management
  const [providerAssets, setProviderAssets] = useState<any>({ MTN: '', AIRTEL: '', GLO: '', '9MOBILE': '' });
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Oracle Intelligence State
  const [oracleLogs, setOracleLogs] = useState<string[]>([]);
  const [infraStatus, setInfraStatus] = useState<any>({
    firestore: { label: 'Firestore Node', status: 'Standby', lat: 0, health: 100 },
    bridge: { label: 'External Bridge', status: 'Standby', lat: 0, health: 100 },
    cdn: { label: 'Asset CDN', status: 'Active', lat: 5, health: 100 }
  });

  const pushLog = (msg: string, type: 'INFO' | 'ERR' | 'WARN' = 'INFO') => {
    setOracleLogs(prev => [`[${type}] ${new Date().toLocaleTimeString()} :: ${msg}`, ...prev].slice(0, 20));
  };

  const dissectSystem = async () => {
    setIsLoading(true);
    pushLog("Initiating Deep Infrastructure Dissection Sequence...");
    
    // Check Firestore Connectivity
    const startFS = performance.now();
    try {
        await getDocs(query(collection(db, 'users'), limit(1)));
        const lat = Math.round(performance.now() - startFS);
        setInfraStatus(p => ({...p, firestore: { ...p.firestore, status: 'Operational', lat, health: 100 }}));
        pushLog(`Node Alpha (Firestore): Verification successful in ${lat}ms`);
    } catch (e) {
        setInfraStatus(p => ({...p, firestore: { ...p.firestore, status: 'ERROR', lat: 0, health: 0 }}));
        pushLog("CRITICAL: Firestore node connection failed.", 'ERR');
    }

    // Check API Bridge (Inlomax)
    const startBridge = performance.now();
    try {
        const res = await getBanks();
        const lat = Math.round(performance.now() - startBridge);
        if (res.success) {
            setInfraStatus(p => ({...p, bridge: { ...p.bridge, status: 'Operational', lat, health: 100 }}));
            pushLog(`Proxy Gateway: Bridge handshake stable (${lat}ms)`);
        } else throw new Error();
    } catch (e) {
        setInfraStatus(p => ({...p, bridge: { ...p.bridge, status: 'DISCONNECTED', lat: 0, health: 0 }}));
        pushLog("ALERT: External API handshake rejected (Check API Key).", 'WARN');
    }

    setIsLoading(false);
    pushLog("System dissection complete. Logic updated.");
  };

  const syncAdminState = async () => {
    setIsLoading(true);
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const assetsSnap = await getDoc(doc(db, 'settings', 'assets'));
        if (assetsSnap.exists()) setProviderAssets(assetsSnap.data());

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

  const handleAssetUpdate = async (provider: string, file: File) => {
    setIsUploading(provider);
    try {
        const url = await uploadImageToImgBB(file);
        const newAssets = { ...providerAssets, [provider]: url };
        await setDoc(doc(db, 'settings', 'assets'), newAssets);
        setProviderAssets(newAssets);
        toast.success(`${provider} Branding Injected Successfully.`);
    } catch (e) { toast.error("Asset upload failure."); }
    finally { setIsUploading(null); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'OBATA VTU01$') {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        toast.success("Welcome, Root Administrator.");
    } else toast.error("Security mismatch.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-14 rounded-[3.5rem] w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
          <div className="bg-blue-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-12 border border-blue-500/20 rotate-3">
            <Lock className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Root Control</h1>
          <p className="text-slate-500 mb-12 font-black text-[10px] uppercase tracking-[0.4em]">Initialize Auth Sequence</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="ROOT_KEY"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 text-white text-center tracking-[1em] focus:border-blue-500 outline-none transition-all font-mono text-xl"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs">
                Launch Secure Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NavItem = ({ section, icon: Icon, label, onClick }: any) => (
    <button 
      onClick={onClick || (() => setActiveSection(section))}
      className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeSection === section ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' : 'text-slate-500 hover:bg-slate-800'}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-in pb-20">
      <div className="lg:w-80 space-y-3">
        <NavItem section="MAIN" icon={LayoutDashboard} label="Workstation" />
        <NavItem section="USERS" icon={Users} label="Node Registry" />
        <NavItem section="MEDIA" icon={ImageIcon} label="Media Vault" />
        <NavItem section="ORACLE" icon={Cpu} label="Oracle Core" />
        <NavItem icon={TestTube2} label="Connectivity Lab" onClick={() => navigate('/admin/tester')} />
        
        <div className="pt-10 px-4">
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem]">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Pulse Monitor</p>
              <div className="flex items-center text-emerald-500 text-[10px] font-black tracking-widest">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-3 shadow-[0_0_10px_#10b981]"></div>
                 SYSTEM_STABLE_V9
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {activeSection === 'MAIN' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'Active Nodes', val: stats.totalUsers, icon: Network, col: 'text-blue-500', bg: 'bg-blue-600/10' },
                 { label: 'Global Float', val: `₦${stats.systemFloat.toLocaleString()}`, icon: DollarSign, col: 'text-emerald-500', bg: 'bg-emerald-600/10' },
                 { label: 'Status', val: 'Operational', icon: ShieldCheck, col: 'text-purple-500', bg: 'bg-purple-600/10' },
               ].map((c, i) => (
                 <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.8rem] hover:border-slate-700 transition-all group">
                    <div className={`${c.bg} ${c.col} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                       <c.icon className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{c.label}</p>
                    <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tighter">{c.val}</h3>
                 </div>
               ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Terminal className="w-64 h-64 text-blue-500" /></div>
               <h3 className="text-xl font-black text-white mb-10 tracking-tight flex items-center"><Monitor className="w-5 h-5 mr-3 text-blue-500" /> Infrastructure Registry</h3>
               <div className="divide-y divide-slate-800">
                  {users.slice(0, 6).map(u => (
                     <div key={u.id} className="flex items-center justify-between py-6 group/row transition-all hover:bg-slate-950/30 px-2 rounded-xl">
                        <div className="flex items-center space-x-5">
                           <div className="relative">
                               <img src={u.photoURL} className="w-12 h-12 rounded-2xl border-2 border-slate-800 shadow-xl" alt="" />
                               <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                           </div>
                           <div>
                              <p className="text-white font-black text-sm tracking-tight group-hover/row:text-blue-400 transition-colors uppercase">{u.username}</p>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{u.email}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-emerald-400 font-black text-lg font-mono">₦{u.walletBalance?.toLocaleString()}</p>
                           <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{u.role} NODE</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeSection === 'MEDIA' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ImageIcon className="w-80 h-80 text-blue-500" />
                </div>
                
                <div className="relative z-10 mb-14">
                    <h2 className="text-4xl font-black text-white tracking-tighter">Media Architecture</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Inject Provider Identities</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(p => (
                        <div key={p} className="bg-slate-950 border border-slate-800 p-10 rounded-[3rem] group transition-all duration-500 hover:border-blue-500/30">
                            <div className="flex justify-between items-center mb-10">
                                <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{p} LOGIC</span>
                                <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                                    {isUploading === p ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Logic'}
                                    <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleAssetUpdate(p, e.target.files[0])} />
                                </label>
                            </div>
                            <div className="h-48 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-slate-800 group-hover:bg-slate-850 transition-all overflow-hidden relative">
                                {providerAssets[p] ? (
                                    <img src={providerAssets[p]} alt={p} className="h-24 object-contain drop-shadow-2xl z-10 scale-100 group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <ImageIcon className="w-14 h-14 text-slate-800" />
                                )}
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeSection === 'ORACLE' && (
            <div className="space-y-12 animate-fade-in">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-5xl font-black text-white tracking-tighter">Oracle Core</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Live Infrastructure Dissection</p>
                    </div>
                    <button onClick={dissectSystem} className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-600/20 flex items-center active:scale-95">
                        <Bug className="w-5 h-5 mr-3" /> Dissect Infrastructure
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(infraStatus).map(([key, info]: [string, any]) => (
                        <div key={key} className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-10">
                                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 group-hover:border-blue-500/50 transition-colors shadow-lg"><Server className="w-5 h-5 text-blue-500" /></div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${info.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-500' : info.status === 'Standby' ? 'bg-slate-800 text-slate-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${info.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                    <span>{info.status}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{info.label}</p>
                            <h4 className="text-4xl font-black text-white font-mono tracking-tighter">{info.lat}<span className="text-xs ml-1.5 text-slate-600">ms</span></h4>
                            <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${info.health > 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${info.health}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black border border-slate-800 rounded-[3.5rem] p-12 font-mono shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Cpu className="w-80 h-80 text-emerald-500" /></div>
                    <div className="flex items-center space-x-4 text-emerald-500/40 mb-12 border-b border-emerald-500/5 pb-8">
                        <Monitor className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Oracle OS v9.2.4 Diagnostics Pipeline</span>
                    </div>
                    <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto no-scrollbar custom-scroll">
                        {oracleLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-80 text-slate-700 space-y-4">
                                <Crosshair className="w-12 h-12 opacity-20" />
                                <p className="italic text-sm tracking-widest"><span className="animate-pulse">_</span> Awaiting dissection pulse...</p>
                            </div>
                        ) : (
                            oracleLogs.map((log, i) => (
                                <p key={i} className={`text-xs flex items-start leading-relaxed ${log.includes('[ERR]') ? 'text-rose-500 animate-pulse font-black' : log.includes('[WARN]') ? 'text-amber-400 font-bold' : 'text-emerald-500/80'}`}>
                                    <ChevronRight className="w-4 h-4 mr-4 mt-0.5 shrink-0 opacity-40" /> {log}
                                </p>
                            ))
                        )}
                        {infraStatus.bridge.status === 'DISCONNECTED' && (
                            <div className="mt-14 p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] animate-fade-in">
                                <div className="flex items-center mb-4">
                                    <div className="bg-rose-500/20 p-2 rounded-xl mr-3"><ZapOff className="w-5 h-5 text-rose-500" /></div>
                                    <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em]">Critical Insight</p>
                                </div>
                                <p className="text-white text-[11px] leading-relaxed opacity-60 ml-10">
                                    Provider Handshake Rejected. Possible invalid API Key in environment or IP not whitelisted. Use Connectivity Lab to debug raw responses.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-14 flex items-center justify-between border-t border-emerald-500/5 pt-10">
                         <div className="flex items-center space-x-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Logic Flow</span>
                                <span className="text-[10px] text-emerald-500 font-bold">Secure</span>
                            </div>
                        </div>
                        <div className="flex items-center text-[10px] text-emerald-500/20 font-black tracking-[0.4em]">
                            <span className="mr-5">SYSTEM_LOCKDOWN_ENABLED</span>
                            <div className="h-2 w-40 bg-emerald-500/5 rounded-full overflow-hidden border border-emerald-500/5">
                                <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};