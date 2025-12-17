import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Terminal, CheckCircle, 
  ShieldCheck, Database, LayoutGrid,
  CloudLightning, Search, Landmark, Play, UserCheck, RefreshCw,
  Code, AlertTriangle, Activity, ShieldAlert, BadgeCheck, Tv, Monitor, CreditCard, GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

type DiagnosticTab = 'REGISTRY' | 'PURCHASE_LAB' | 'PAYSTACK';
type PurchaseCategory = 'AIRTIME' | 'DATA' | 'CABLE' | 'POWER' | 'EDUCATION';

export const TransactionTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('PURCHASE_LAB');
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedServices, setSyncedServices] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const [category, setCategory] = useState<PurchaseCategory>('AIRTIME');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [form, setForm] = useState<any>({
      serviceID: '',
      amount: '',
      mobileNumber: '',
      iucNum: '',
      meterNum: '',
      meterType: '1',
      quantity: '1'
  });
  const [validatedName, setValidatedName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/terminal/balance');
      const data = await res.json();
      if (data.status === 'success') {
        setBalance(data.data?.funds ?? data.funds ?? 0);
        setBalanceError(false);
      } else {
        setBalanceError(true);
      }
    } catch (e) {
      setBalanceError(true);
    }
  };

  const loadLocalServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'synced_services'));
        const services: any[] = [];
        querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
        setSyncedServices(services);
    } catch (e) {
        console.error("Firestore access failure.");
    }
  };

  useEffect(() => {
    fetchStatus();
    loadLocalServices();
  }, []);

  const syncServices = async () => {
    setIsSyncing(true);
    setRawResponse(null);
    const tid = toast.loading("Synchronizing Global Catalog...");
    try {
      const res = await fetch('/api/terminal/services');
      const apiData = await res.json();
      
      if (apiData.status !== 'success') {
        setRawResponse(apiData);
        throw new Error(apiData.message || "Connection refused.");
      }

      const batch = writeBatch(db);
      const data = apiData.data;
      
      // Batch update the services for "Smart" local access
      data.airtime.forEach((item: any) => {
          const ref = doc(collection(db, 'synced_services'), `AIRTIME_${item.network}`);
          batch.set(ref, { ...item, type: 'AIRTIME', label: `${item.network} Airtime` });
      });

      data.dataPlans.forEach((item: any) => {
          const ref = doc(collection(db, 'synced_services'), `DATA_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'DATA', label: `${item.network} ${item.dataPlan} (${item.dataType})` });
      });

      data.cablePlans.forEach((item: any) => {
          const ref = doc(collection(db, 'synced_services'), `CABLE_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'CABLE', label: `${item.cable} - ${item.cablePlan}` });
      });

      data.electricity.forEach((item: any) => {
          const ref = doc(collection(db, 'synced_services'), `POWER_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'POWER', label: item.disco });
      });

      await batch.commit();
      toast.success("Intelligence Grid Updated!", { id: tid });
      setRawResponse(apiData);
      loadLocalServices();
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerify = async () => {
    setIsValidating(true);
    setValidatedName(null);
    try {
        const endpoint = category === 'CABLE' ? '/api/terminal/validate/cable' : '/api/terminal/validate/meter';
        const payload = category === 'CABLE' 
            ? { serviceID: form.serviceID, iucNum: form.iucNum }
            : { serviceID: form.serviceID, meterNum: form.meterNum, meterType: parseInt(form.meterType) };

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        setRawResponse(data);
        
        if (data.status === 'success' || data.customerName || data.data?.customerName) {
            const name = data.customerName || data.data?.customerName || "Verified Identity";
            setValidatedName(name);
            toast.success(`Node Identity Confirmed: ${name}`);
        } else {
            toast.error(data.message || "Identity Probe Failed");
        }
    } catch (e: any) {
        toast.error("System connection fault");
    } finally {
        setIsValidating(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Executing Terminal Protocol...");
    try {
        let endpoint = '/api/terminal/purchase/';
        let payload: any = { serviceID: form.serviceID };

        if (category === 'AIRTIME') {
            endpoint += 'airtime';
            payload = { ...payload, amount: parseInt(form.amount), mobileNumber: form.mobileNumber };
        } else if (category === 'DATA') {
            endpoint += 'data';
            payload = { ...payload, mobileNumber: form.mobileNumber };
        } else if (category === 'CABLE') {
            endpoint += 'cable';
            payload = { ...payload, iucNum: form.iucNum };
        } else if (category === 'POWER') {
            endpoint += 'electricity';
            payload = { ...payload, meterNum: form.meterNum, meterType: parseInt(form.meterType), amount: parseInt(form.amount) };
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        setRawResponse(data);
        
        if (data.status === 'success') {
            toast.success("Packet Delivered Successfully!", { id: tid });
            fetchStatus();
        } else {
            toast.error(data.message || "Gateway Rejection", { id: tid });
        }
    } catch (e: any) {
        toast.error("Protocol error", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  const currentOptions = syncedServices.filter(s => {
      if (s.type !== category) return false;
      if ((category === 'AIRTIME' || category === 'DATA') && s.network !== selectedNetwork) return false;
      return true;
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4">
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-10">
        <div>
            <div className="flex items-center gap-3">
                <ShieldAlert className="w-10 h-10 text-blue-500" />
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">OBATA <span className="text-blue-500">VTU</span></h1>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3 ml-1">Terminal Node Interface V3.0</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-[2rem] border border-slate-800 shadow-2xl">
           <button onClick={() => setActiveTab('PURCHASE_LAB')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black transition-all ${activeTab === 'PURCHASE_LAB' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>PURCHASE_LAB</button>
           <button onClick={() => setActiveTab('REGISTRY')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black transition-all ${activeTab === 'REGISTRY' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>CORE_REGISTRY</button>
           <button onClick={() => setActiveTab('PAYSTACK')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black transition-all ${activeTab === 'PAYSTACK' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>IDENTITY_HUB</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'PURCHASE_LAB' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 md:p-14 shadow-2xl animate-fade-in relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-14 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Activity className="w-64 h-64 text-blue-500" />
                    </div>

                    <div className="flex items-center justify-between mb-12 overflow-x-auto no-scrollbar gap-4 border-b border-slate-800 pb-10 relative z-10">
                        {[
                            { id: 'AIRTIME', icon: Smartphone },
                            { id: 'DATA', icon: Wifi },
                            { id: 'CABLE', icon: Tv },
                            { id: 'POWER', icon: Zap }
                        ].map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => { setCategory(cat.id as PurchaseCategory); setValidatedName(null); setForm({...form, serviceID: ''}); }}
                                className={`flex flex-col items-center min-w-[100px] group transition-all ${category === cat.id ? 'text-blue-500' : 'text-slate-500'}`}
                            >
                                <div className={`p-5 rounded-3xl mb-4 border-2 transition-all ${category === cat.id ? 'bg-blue-600/10 border-blue-500 scale-110 shadow-2xl shadow-blue-500/10' : 'bg-slate-950 border-slate-900 group-hover:border-slate-700'}`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat.id}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-8">
                            {(category === 'AIRTIME' || category === 'DATA') && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Carrier Link</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                                            <button 
                                                key={net} 
                                                onClick={() => { setSelectedNetwork(net); setForm({...form, serviceID: ''}); }}
                                                className={`py-4 rounded-2xl text-[9px] font-black border transition-all ${selectedNetwork === net ? 'bg-white text-black border-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Service Node</label>
                                <select 
                                    value={form.serviceID}
                                    onChange={e => setForm({...form, serviceID: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-white font-black text-xs outline-none focus:border-blue-500 appearance-none shadow-inner"
                                >
                                    <option value="">-- SELECT PROTOCOL --</option>
                                    {currentOptions.map(opt => (
                                        <option key={opt.id} value={opt.serviceID}>
                                            {opt.label.toUpperCase()} {opt.amount ? `(₦${opt.amount})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(category === 'AIRTIME' || category === 'DATA') && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Target Terminal (Phone)</label>
                                    <input 
                                        type="text" value={form.mobileNumber} 
                                        onChange={e => setForm({...form, mobileNumber: e.target.value.replace(/\D/g, '')})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-white font-mono text-xl tracking-widest outline-none focus:border-blue-500 shadow-inner"
                                        placeholder="08012345678"
                                    />
                                </div>
                            )}

                            {category === 'AIRTIME' && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Injection Value (₦)</label>
                                    <input 
                                        type="number" value={form.amount} 
                                        onChange={e => setForm({...form, amount: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-white font-black text-2xl outline-none focus:border-blue-500 shadow-inner"
                                        placeholder="100"
                                    />
                                </div>
                            )}

                            {(category === 'CABLE' || category === 'POWER') && (
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Terminal Serial</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" value={category === 'CABLE' ? form.iucNum : form.meterNum} 
                                                onChange={e => setForm({...form, [category === 'CABLE' ? 'iucNum' : 'meterNum']: e.target.value.replace(/\D/g, '')})}
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-white font-mono tracking-widest outline-none focus:border-blue-500 shadow-inner"
                                                placeholder="NODE_SERIAL_00X"
                                            />
                                            <button disabled={isValidating || (!form.iucNum && !form.meterNum) || !form.serviceID} onClick={handleVerify} className="bg-slate-800 hover:bg-white hover:text-black px-8 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center">
                                                {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'PROBE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center items-center text-center p-12 bg-slate-950/50 rounded-[4rem] border-2 border-slate-800 border-dashed relative group/verify overflow-hidden">
                             <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/verify:opacity-100 transition-opacity"></div>
                             {isValidating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md rounded-[4rem] z-20">
                                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em]">Scanning Node...</span>
                                </div>
                             )}
                             {validatedName ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-emerald-500/10 p-8 rounded-full mx-auto w-fit border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"><UserCheck className="w-16 h-16 text-emerald-500" /></div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Owner Resolved</p>
                                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{validatedName}</h4>
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-4 py-2 rounded-full border border-emerald-500/20 mx-auto w-fit tracking-[0.2em]">SAFE_TO_PROCEED</div>
                                </div>
                             ) : (
                                <div className="opacity-20 space-y-6">
                                    <ShieldCheck className="w-24 h-24 mx-auto text-slate-400" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.6em]">System Idle</p>
                                </div>
                             )}
                        </div>
                    </div>

                    <button 
                        onClick={handlePurchase}
                        disabled={isLoading || !form.serviceID}
                        className="w-full mt-12 bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-[2.5rem] transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        {isLoading ? <RefreshCw className="w-8 h-8 animate-spin" /> : <><Play className="w-6 h-6 mr-4 group-hover:translate-x-2 transition-transform" /> START DATA_INJECTION PROTOCOL</>}
                    </button>
                </div>
            )}

            {activeTab === 'REGISTRY' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Activity className="w-80 h-80 text-purple-500" /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-white flex items-center uppercase tracking-tighter">
                                    <Database className="w-8 h-8 mr-4 text-purple-500" /> Catalog Registry
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">Provider Synchronization Layer Active</p>
                            </div>
                            <button 
                                onClick={syncServices} 
                                disabled={isSyncing}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center shadow-2xl shadow-purple-600/30 active:scale-95"
                            >
                                {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin mr-3" /> : <CloudLightning className="w-5 h-5 mr-3" />}
                                Sync Remote Nodes
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-3 custom-scroll no-scrollbar">
                            {syncedServices.map(svc => (
                                <div key={svc.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-center space-x-5 hover:border-blue-500/40 transition-all group cursor-default">
                                    <div className="p-4 rounded-2xl bg-slate-900 group-hover:scale-110 transition-transform shadow-lg">
                                        {svc.type === 'DATA' ? <Wifi className="w-5 h-5 text-emerald-500" /> : svc.type === 'AIRTIME' ? <Smartphone className="w-5 h-5 text-blue-500" /> : <Monitor className="w-5 h-5 text-purple-500" />}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-white font-black uppercase text-[11px] truncate tracking-tight">{svc.label}</p>
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] mt-1">NODE_ID: {svc.serviceID}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PAYSTACK' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                        <CreditCard className="w-80 h-80 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white mb-10 flex items-center uppercase tracking-tighter">
                            <Code className="w-8 h-8 mr-4 text-emerald-500" /> Gateway Bridge
                        </h3>
                        <p className="text-slate-400 text-sm mb-12 leading-relaxed font-medium max-w-xl">
                            The system is bridging secure identity nodes via the production Vercel proxy. This facilitates cross-platform API resolution for real-time bank account validation during fund distribution and node transfers.
                        </p>
                        <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 border-dashed text-emerald-500 font-mono text-[11px] uppercase tracking-[0.2em] leading-loose shadow-inner">
                            &gt; UPLINK_STATUS: OPERATIONAL<br/>
                            &gt; PROXY_RELAY: ACTIVE_V3<br/>
                            &gt; HANDSHAKE: CONFIRMED_ENCRYPTED<br/>
                            &gt; LATENCY: 42ms
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Global Monitoring Sidebar */}
        <div className="lg:col-span-4 space-y-8">
            <div className={`border p-10 rounded-[3.5rem] shadow-2xl flex items-center space-x-8 transition-all duration-1000 ${balanceError ? 'bg-rose-500/10 border-rose-500/40 animate-pulse' : 'bg-slate-900 border-slate-800 hover:border-blue-500/30'}`}>
                <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${balanceError ? 'bg-rose-600/20 border-rose-500/40 text-rose-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
                    {balanceError ? <AlertTriangle className="w-10 h-10" /> : <Database className="w-10 h-10" />}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Node Liquidity</p>
                    <h2 className={`text-4xl font-black font-mono tracking-tighter ${balanceError ? 'text-rose-500' : 'text-white'}`}>
                        {balance === null ? (balanceError ? 'DISCONNECT' : 'SYNC...') : `₦${balance.toLocaleString()}`}
                    </h2>
                    <button onClick={fetchStatus} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white mt-3 flex items-center group">
                        <RefreshCw className="w-3 h-3 mr-2 group-hover:rotate-180 transition-transform" />
                        PULSE_CHECK
                    </button>
                </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[3.5rem] overflow-hidden flex flex-col h-[700px] shadow-2xl relative">
                <div className="p-10 border-b border-slate-900 flex justify-between items-center bg-slate-950/50 relative z-10">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> System Log Console
                    </h3>
                    <button onClick={() => setRawResponse(null)} className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">WIPE_LOG</button>
                </div>
                <div className="flex-1 p-10 overflow-auto font-mono text-[12px] no-scrollbar custom-scroll relative z-10">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8">
                            <Activity className="w-24 h-24 animate-pulse text-blue-500" />
                            <p className="text-[10px] font-black uppercase tracking-[1.5em] text-center">Monitoring_Feed</p>
                        </div>
                    ) : (
                        <pre className={`leading-relaxed whitespace-pre-wrap ${rawResponse.status === 'success' || rawResponse.success ? 'text-blue-400' : 'text-rose-500 font-bold animate-fade-in'}`}>
                            {JSON.stringify(rawResponse, null, 2)}
                        </pre>
                    )}
                </div>
                {/* Decorative coding overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none font-mono text-[8px] overflow-hidden whitespace-nowrap leading-none p-4">
                    {Array.from({length: 100}).map((_, i) => (
                        <div key={i}>010111010101001110101010100010101010111010101010111010101010</div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3.5rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <h4 className="text-white font-black text-[11px] uppercase tracking-[0.3em]">Protocol Verified</h4>
                    </div>
                    <p className="text-slate-500 text-[11px] font-bold leading-loose uppercase tracking-tighter italic opacity-60 group-hover:opacity-100 transition-opacity">
                        Production encryption keys active. All transmissions are routed through the secure Vercel bridge. Node latency optimized for instant delivery.
                    </p>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Zap className="w-40 h-40 text-blue-500" />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};