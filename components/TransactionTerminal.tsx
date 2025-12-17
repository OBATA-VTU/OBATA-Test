import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Terminal, CheckCircle, 
  ShieldCheck, Database, LayoutGrid,
  CloudLightning, Search, Landmark, Play, UserCheck, RefreshCw,
  Code, AlertTriangle, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

type DiagnosticTab = 'INLOMAX' | 'PAYSTACK';

export const TransactionTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('INLOMAX');
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedServices, setSyncedServices] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Paystack Manual Test State
  const [manualPaystack, setManualPaystack] = useState({ accountNumber: '', bankCode: '' });
  const [banksList, setBanksList] = useState<any[]>([]);

  const fetchStatus = async () => {
    setBalanceError(false);
    setBalance(null);
    try {
      const res = await fetch('/api/terminal/balance');
      const text = await res.text();
      let data;
      try {
          data = JSON.parse(text);
      } catch (e) {
          throw new Error("Gateway returned HTML: " + text.substring(0, 50));
      }

      if (data.status === 'success') {
        setBalance(data.data?.funds ?? data.funds ?? 0);
      } else {
        setBalanceError(true);
        setRawResponse(data);
      }
    } catch (e: any) {
      setBalanceError(true);
      setRawResponse({ error: "Node Connection Failed", details: e.message });
    }
  };

  const loadLocalServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'synced_services'));
        const services: any[] = [];
        querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
        setSyncedServices(services);
    } catch (e) {
        console.error("Firestore Registry access failure");
    }
  };

  useEffect(() => {
    fetchStatus();
    loadLocalServices();
  }, []);

  // --- INLOMAX ACTIONS ---
  const syncServices = async () => {
    setIsSyncing(true);
    setRawResponse(null);
    const tid = toast.loading("Connecting to Inlomax...");
    try {
      const res = await fetch('/api/terminal/services');
      const text = await res.text();
      let result;
      try {
          result = JSON.parse(text);
      } catch (e) {
          throw new Error("Server returned non-JSON data (HTML Error Page)");
      }
      
      setRawResponse(result);
      
      if (result.status === 'success') {
        const batch = writeBatch(db);
        const data = result.data;
        
        data.airtime.forEach((item: any) => {
            const ref = doc(collection(db, 'synced_services'), `AIRTIME_${item.network}`);
            batch.set(ref, { ...item, type: 'AIRTIME', label: `${item.network} Airtime` });
        });

        data.dataPlans.forEach((item: any) => {
            const ref = doc(collection(db, 'synced_services'), `DATA_${item.serviceID}`);
            batch.set(ref, { ...item, type: 'DATA', label: `${item.network} ${item.dataPlan} (${item.dataType})` });
        });

        await batch.commit();
        toast.success("Database Updated!", { id: tid });
        loadLocalServices();
      } else {
        toast.error("Provider Rejected Connection", { id: tid });
      }
    } catch (e: any) {
      toast.error("Handshake Lost", { id: tid });
      setRawResponse({ error: "Communication Error", details: e.message, hint: "Check Vercel Deployment Logs for index.ts syntax errors." });
    } finally {
      setIsSyncing(false);
    }
  };

  // --- PAYSTACK ACTIONS ---
  const fetchBanks = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Probing Paystack Gateway...");
    try {
        const res = await fetch('/api/terminal/banks');
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Paystack returned HTML Error Page");
        }
        
        setRawResponse(data);
        if (data.status === 'success') {
            setBanksList(data.data);
            toast.success(`${data.data.length} Banks Active!`, { id: tid });
        } else {
            toast.error(data.message || "Gateway Rejected Sync", { id: tid });
        }
    } catch (e: any) {
        toast.error("Connectivity Lost", { id: tid });
        setRawResponse({ error: "Handshake Exception", details: e.message });
    } finally {
        setIsLoading(false);
    }
  };

  const resolveAccount = async () => {
    if (!manualPaystack.accountNumber || !manualPaystack.bankCode) {
        return toast.error("Provide Bank & Account No");
    }
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Resolving Identity Node...");
    try {
        const res = await fetch(`/api/terminal/resolve?accountNumber=${manualPaystack.accountNumber}&bankCode=${manualPaystack.bankCode}`);
        const data = await res.json();
        setRawResponse(data);
        if (data.status === 'success') {
            toast.success(`Identity Match: ${data.data.account_name}`, { id: tid });
        } else {
            toast.error(data.message || "Match Failed", { id: tid });
        }
    } catch (e: any) {
        toast.error("Sync Protocol Fault", { id: tid });
        setRawResponse({ error: "JSON Parse Exception", details: e.message });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">OBATA <span className="text-blue-500">CORE HUB</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">API Verification Module v2.3 (CJS)</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           <button onClick={() => setActiveTab('INLOMAX')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'INLOMAX' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>INLOMAX</button>
           <button onClick={() => setActiveTab('PAYSTACK')} className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'PAYSTACK' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>PAYSTACK</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Workspace Area */}
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'INLOMAX' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Activity className="w-64 h-64 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center">
                                    <Database className="w-6 h-6 mr-3 text-blue-500" /> Registry Sync
                                </h3>
                                <p className="text-slate-500 text-xs mt-1">Mirror Inlomax Catalog to Firebase</p>
                            </div>
                            <button 
                                onClick={syncServices} 
                                disabled={isSyncing}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center shadow-xl shadow-blue-600/20"
                            >
                                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <CloudLightning className="w-4 h-4 mr-3" />}
                                Sync Services
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 no-scrollbar border-t border-slate-800/50 pt-8">
                            {syncedServices.length === 0 ? (
                                <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                                    <Search className="w-12 h-12 mx-auto mb-6 text-slate-800" />
                                    <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Registry Node Standby</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {syncedServices.map(svc => (
                                        <div key={svc.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 hover:border-blue-500/30 transition-all group">
                                            <div className="p-3 rounded-xl bg-slate-900 group-hover:scale-110 transition-transform">
                                                {svc.type === 'AIRTIME' ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-white font-black uppercase text-[10px] truncate">{svc.label}</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">ID: {svc.serviceID}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PAYSTACK' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Identity Resolver */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <UserCheck className="w-64 h-64 text-emerald-500" />
                         </div>
                         <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center">
                                <Code className="w-6 h-6 mr-3 text-emerald-500" /> Identity Resolver
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Account Identifier (10 Digits)</label>
                                    <input 
                                        type="text" maxLength={10} value={manualPaystack.accountNumber} 
                                        onChange={e => setManualPaystack({...manualPaystack, accountNumber: e.target.value.replace(/\D/g, '')})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono text-xl tracking-[0.3em] outline-none focus:border-emerald-500 transition-all shadow-inner"
                                        placeholder="0000000000"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Target Bank Node</label>
                                    <div className="flex gap-3">
                                        <select 
                                            value={manualPaystack.bankCode}
                                            onChange={e => setManualPaystack({...manualPaystack, bankCode: e.target.value})}
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none focus:border-emerald-500 appearance-none shadow-inner"
                                        >
                                            <option value="">-- CHOOSE BANK --</option>
                                            {banksList.map(b => <option key={b.id} value={b.code}>{b.name.toUpperCase()}</option>)}
                                        </select>
                                        <button onClick={fetchBanks} className="bg-slate-800 hover:bg-white hover:text-black p-5 rounded-2xl transition-all shadow-lg active:scale-90" title="Refresh Node List">
                                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={resolveAccount} 
                                disabled={isLoading}
                                className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-3xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center active:scale-95"
                            >
                                {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Play className="w-6 h-6 mr-3" /> VERIFY IDENTITY</>}
                            </button>
                         </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center">
                                <Landmark className="w-5 h-5 mr-3 text-slate-500" /> Infrastructure Node Directory
                            </h3>
                            <span className="text-[10px] text-emerald-500 font-black bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">{banksList.length} Nodes Active</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[250px] overflow-y-auto pr-3 no-scrollbar custom-scroll">
                            {banksList.length === 0 ? (
                                <div className="col-span-4 py-12 text-center text-slate-700 font-black uppercase text-[10px] tracking-widest animate-pulse">Awaiting Handshake Protocol...</div>
                            ) : (
                                banksList.map(b => (
                                    <div key={b.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-[8px] font-black text-slate-400 uppercase truncate hover:text-white transition-colors">
                                        {b.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Global Monitor Console */}
        <div className="lg:col-span-4 space-y-8">
            <div className={`border p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6 transition-all duration-700 ${balanceError ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <div className={`p-4 rounded-2xl border transition-colors ${balanceError ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
                    {balanceError ? <AlertTriangle className="w-8 h-8" /> : <Database className="w-8 h-8" />}
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inlomax Liquidity</p>
                    <h2 className={`text-3xl font-black font-mono tracking-tighter ${balanceError ? 'text-rose-500' : 'text-white'}`}>
                        {balance === null ? (balanceError ? 'ERR_LINK' : 'SYNCING...') : `₦${balance.toLocaleString()}`}
                    </h2>
                    <button onClick={fetchStatus} className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:text-white mt-1 underline decoration-blue-500/30">Re-Probe Link</button>
                </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Node Response Matrix
                    </h3>
                    <button onClick={() => setRawResponse(null)} className="text-[8px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Flush</button>
                </div>
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar custom-scroll">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <LayoutGrid className="w-16 h-16 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] mt-8">Awaiting Command</p>
                        </div>
                    ) : (
                        <pre className={`leading-relaxed whitespace-pre-wrap ${rawResponse.status === 'success' || rawResponse.success ? 'text-blue-400' : 'text-rose-400'}`}>
                            {JSON.stringify(rawResponse, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem]">
                <div className="flex items-center space-x-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Protocol Guard</h4>
                </div>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                    CJS Engine Active. If matrix returns 500, check the "Functions" tab in Vercel. A SyntaxError in the build indicates Node version mismatch.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};