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
    const tid = toast.loading("Syncing Remote Catalog...");
    try {
      const res = await fetch('/api/terminal/services');
      const apiData = await res.json();
      
      if (apiData.status !== 'success') {
        setRawResponse(apiData);
        throw new Error(apiData.message || "Connection refused.");
      }

      const batch = writeBatch(db);
      const data = apiData.data;
      
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

      data.education.forEach((item: any) => {
          const ref = doc(collection(db, 'synced_services'), `EDU_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'EDUCATION', label: item.type });
      });

      await batch.commit();
      toast.success("Intelligence Updated!", { id: tid });
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
            const name = data.customerName || data.data?.customerName || "Verified Account";
            setValidatedName(name);
            toast.success(`Identity Verified: ${name}`);
        } else {
            toast.error(data.message || "Identity Rejection");
        }
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setIsValidating(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Executing Node Command...");
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
        } else {
            endpoint += 'education';
            payload = { ...payload, quantity: parseInt(form.quantity) };
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        setRawResponse(data);
        
        if (data.status === 'success') {
            toast.success("Command Successful!", { id: tid });
            fetchStatus();
        } else {
            toast.error(data.message || "Purchase Failed", { id: tid });
        }
    } catch (e: any) {
        toast.error(e.message, { id: tid });
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-10">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">OBATA <span className="text-blue-500">ENGINE</span></h1>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Core Synchronized</span>
                </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">API Connectivity Lab V2.0</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           <button onClick={() => setActiveTab('PURCHASE_LAB')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'PURCHASE_LAB' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>PURCHASE LAB</button>
           <button onClick={() => setActiveTab('REGISTRY')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'REGISTRY' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>REGISTRY</button>
           <button onClick={() => setActiveTab('PAYSTACK')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'PAYSTACK' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>PAYSTACK</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'PURCHASE_LAB' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10 overflow-x-auto no-scrollbar gap-4 border-b border-slate-800 pb-8">
                        {[
                            { id: 'AIRTIME', icon: Smartphone },
                            { id: 'DATA', icon: Wifi },
                            { id: 'CABLE', icon: Tv },
                            { id: 'POWER', icon: Zap },
                            { id: 'EDUCATION', icon: GraduationCap }
                        ].map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => { setCategory(cat.id as PurchaseCategory); setValidatedName(null); setForm({...form, serviceID: ''}); }}
                                className={`flex flex-col items-center min-w-[80px] group transition-all ${category === cat.id ? 'text-blue-500' : 'text-slate-500'}`}
                            >
                                <div className={`p-4 rounded-2xl mb-3 border-2 transition-all ${category === cat.id ? 'bg-blue-600/10 border-blue-500 scale-110 shadow-xl shadow-blue-500/10' : 'bg-slate-950 border-slate-900 group-hover:border-slate-700'}`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{cat.id}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {(category === 'AIRTIME' || category === 'DATA') && (
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Carrier Node</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                                            <button 
                                                key={net} 
                                                onClick={() => { setSelectedNetwork(net); setForm({...form, serviceID: ''}); }}
                                                className={`py-3 rounded-xl text-[9px] font-black border transition-all ${selectedNetwork === net ? 'bg-white text-black border-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                                            >
                                                {net}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Selection Descriptor</label>
                                <select 
                                    value={form.serviceID}
                                    onChange={e => setForm({...form, serviceID: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none focus:border-blue-500 appearance-none shadow-inner"
                                >
                                    <option value="">-- SELECT {category} --</option>
                                    {currentOptions.map(opt => (
                                        <option key={opt.id} value={opt.serviceID}>
                                            {opt.label} {opt.amount ? `(₦${opt.amount})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(category === 'AIRTIME' || category === 'DATA') && (
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Recipient Endpoint</label>
                                    <input 
                                        type="text" value={form.mobileNumber} 
                                        onChange={e => setForm({...form, mobileNumber: e.target.value.replace(/\D/g, '')})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono text-lg tracking-widest outline-none focus:border-blue-500 shadow-inner"
                                        placeholder="08012345678"
                                    />
                                </div>
                            )}

                            {category === 'AIRTIME' && (
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Transmit Amount</label>
                                    <input 
                                        type="number" value={form.amount} 
                                        onChange={e => setForm({...form, amount: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-blue-500 shadow-inner"
                                        placeholder="100"
                                    />
                                </div>
                            )}

                            {category === 'CABLE' && (
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">IUC / SmartCard No</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" value={form.iucNum} 
                                            onChange={e => setForm({...form, iucNum: e.target.value.replace(/\D/g, '')})}
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono tracking-widest outline-none focus:border-blue-500 shadow-inner"
                                            placeholder="1029384756"
                                        />
                                        <button disabled={isValidating || !form.iucNum || !form.serviceID} onClick={handleVerify} className="bg-slate-800 hover:bg-white hover:text-black px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30">
                                            {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Probe'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {category === 'POWER' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setForm({...form, meterType: '1'})} className={`py-4 rounded-xl text-[9px] font-black border transition-all ${form.meterType === '1' ? 'bg-amber-600 border-amber-600 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>PREPAID</button>
                                        <button onClick={() => setForm({...form, meterType: '2'})} className={`py-4 rounded-xl text-[9px] font-black border transition-all ${form.meterType === '2' ? 'bg-amber-600 border-amber-600 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>POSTPAID</button>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Meter Serial</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" value={form.meterNum} 
                                                onChange={e => setForm({...form, meterNum: e.target.value.replace(/\D/g, '')})}
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono tracking-widest outline-none focus:border-amber-500 shadow-inner"
                                                placeholder="45092837465"
                                            />
                                            <button disabled={isValidating || !form.meterNum || !form.serviceID} onClick={handleVerify} className="bg-slate-800 hover:bg-white hover:text-black px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30">
                                                {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Probe'}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Token Value (₦)</label>
                                        <input 
                                            type="number" value={form.amount} 
                                            onChange={e => setForm({...form, amount: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-amber-500 shadow-inner"
                                            placeholder="1000"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center items-center text-center p-10 bg-slate-950/50 rounded-[3.5rem] border border-slate-800 border-dashed relative">
                             {isValidating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm rounded-[3.5rem] z-20">
                                    <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                                </div>
                             )}
                             {validatedName ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-emerald-500/10 p-6 rounded-full mx-auto w-fit border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"><UserCheck className="w-12 h-12 text-emerald-500" /></div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ownership Resolved</p>
                                    <h4 className="text-2xl font-black text-white tracking-tight">{validatedName}</h4>
                                </div>
                             ) : (
                                <div className="opacity-10 space-y-4">
                                    <ShieldCheck className="w-20 h-20 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Pulse Waiting...</p>
                                </div>
                             )}
                        </div>
                    </div>

                    <button 
                        onClick={handlePurchase}
                        disabled={isLoading || !form.serviceID}
                        className="w-full mt-10 bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-[2.5rem] transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Play className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" /> INITIATE GATEWAY TRANSIT</>}
                    </button>
                </div>
            )}

            {activeTab === 'REGISTRY' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Activity className="w-64 h-64 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center uppercase tracking-tighter">
                                    <Database className="w-6 h-6 mr-3 text-blue-500" /> Catalog Registry
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Provider Synchronization Layer</p>
                            </div>
                            <button 
                                onClick={syncServices} 
                                disabled={isSyncing}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center shadow-xl shadow-purple-600/20 active:scale-95"
                            >
                                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <CloudLightning className="w-4 h-4 mr-3" />}
                                Update Registry
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll no-scrollbar">
                            {syncedServices.map(svc => (
                                <div key={svc.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 hover:border-blue-500/30 transition-all group">
                                    <div className="p-3 rounded-xl bg-slate-900 group-hover:scale-110 transition-transform">
                                        {svc.type === 'DATA' ? <Wifi className="w-4 h-4 text-emerald-500" /> : svc.type === 'AIRTIME' ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Monitor className="w-4 h-4 text-purple-500" />}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-white font-black uppercase text-[10px] truncate">{svc.label}</p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">ID: {svc.serviceID}</p>
                                    </div>
                                </div>
                            ))}
                            {syncedServices.length === 0 && (
                                <div className="col-span-2 py-20 text-center text-slate-700 font-black text-xs uppercase tracking-widest opacity-30">
                                    Local Registry Empty
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PAYSTACK' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
                        <CreditCard className="w-64 h-64 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center uppercase tracking-tighter">
                        <Code className="w-6 h-6 mr-3 text-emerald-500" /> Resolution Gateway
                    </h3>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">The system is bridging bank identity nodes via the production proxy. This allows cross-website API resolution for bank accounts during fund withdrawals and peer transfers.</p>
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 border-dashed text-emerald-400 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                        > UPLINK_MODE: PROXY_RELAY<br/>
                        > TARGET_NODE: PAYSTACK_BI_V2<br/>
                        > STATUS: HANDSHAKE_CONFIRMED
                    </div>
                </div>
            )}

        </div>

        <div className="lg:col-span-4 space-y-8">
            <div className={`border p-8 rounded-[3rem] shadow-2xl flex items-center space-x-6 transition-all duration-700 ${balanceError ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800 hover:border-blue-500/20'}`}>
                <div className={`p-4 rounded-2xl border transition-colors ${balanceError ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
                    {balanceError ? <AlertTriangle className="w-8 h-8" /> : <Database className="w-8 h-8" />}
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gateway Liquidity</p>
                    <h2 className={`text-3xl font-black font-mono tracking-tighter ${balanceError ? 'text-rose-500' : 'text-white'}`}>
                        {balance === null ? (balanceError ? 'FAULT' : 'SYNC...') : `₦${balance.toLocaleString()}`}
                    </h2>
                    <button onClick={fetchStatus} className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-white mt-1 underline decoration-blue-500/30 transition-all">Pulse Check</button>
                </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[3.5rem] overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Log Console
                    </h3>
                    <button onClick={() => setRawResponse(null)} className="text-[8px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Clear</button>
                </div>
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar custom-scroll">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-5">
                            <Activity className="w-20 h-20 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[1em] mt-10 text-center">Monitoring</p>
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
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Handshake Verified</h4>
                </div>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter italic">
                    Production encryption keys active. All transmissions are routed through the secure Vercel bridge.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};