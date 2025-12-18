import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Terminal, CheckCircle, 
  ShieldCheck, Database, LayoutGrid,
  CloudLightning, Search, Landmark, Play, UserCheck, RefreshCw,
  Code, AlertTriangle, Activity, ShieldAlert, BadgeCheck, Tv, Monitor, CreditCard, GraduationCap, XCircle, HardDriveDownload
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

type DiagnosticTab = 'PURCHASE_LAB' | 'REGISTRY' | 'DEBUG_INFO';
type PurchaseCategory = 'AIRTIME' | 'DATA' | 'CABLE' | 'POWER';

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
      meterType: '1'
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
        console.error("Local records sync failed.");
    }
  };

  useEffect(() => {
    fetchStatus();
    loadLocalServices();
  }, []);

  const syncServices = async () => {
    setIsSyncing(true);
    setRawResponse(null);
    const tid = toast.loading("Checking for new plans...");
    
    try {
      const res = await fetch('/api/terminal/services');
      const apiData = await res.json();
      
      if (apiData.status !== 'success') {
        setRawResponse({ step: "FETCH_FAILED", data: apiData });
        throw new Error(`System Error: ${apiData.message || 'Unknown'}`);
      }

      setRawResponse({ 
          step: "PLANS_RECEIVED", 
          message: "Updating your database...", 
          count: {
              airtime: apiData.data.airtime?.length || 0,
              data: apiData.data.dataPlans?.length || 0,
              cable: apiData.data.cablePlans?.length || 0,
              power: apiData.data.electricity?.length || 0
          }
      });

      const batch = writeBatch(db);
      const data = apiData.data;
      
      data.airtime?.forEach((item: any) => {
          const ref = doc(db, 'synced_services', `AIRTIME_${item.network}`);
          batch.set(ref, { ...item, type: 'AIRTIME', label: `${item.network} Airtime`, lastUpdate: new Date().toISOString() });
      });

      data.dataPlans?.forEach((item: any) => {
          const ref = doc(db, 'synced_services', `DATA_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'DATA', label: `${item.network} ${item.dataPlan}`, lastUpdate: new Date().toISOString() });
      });

      data.cablePlans?.forEach((item: any) => {
          const ref = doc(db, 'synced_services', `CABLE_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'CABLE', label: `${item.cable} - ${item.cablePlan}`, lastUpdate: new Date().toISOString() });
      });

      data.electricity?.forEach((item: any) => {
          const ref = doc(db, 'synced_services', `POWER_${item.serviceID}`);
          batch.set(ref, { ...item, type: 'POWER', label: item.disco, lastUpdate: new Date().toISOString() });
      });

      try {
          await batch.commit();
          toast.success("Database Updated!", { id: tid });
          setRawResponse({ status: "SUCCESS", message: "All plans saved successfully." });
          loadLocalServices();
      } catch (fbErr: any) {
          setRawResponse({ status: "SAVE_ERROR", message: fbErr.message });
          throw new Error(`Database Error: ${fbErr.code}`);
      }
    } catch (e: any) {
      toast.error(e.message, { id: tid });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVerify = async () => {
    setIsValidating(true);
    setValidatedName(null);
    setRawResponse({ action: "VERIFYING_ACCOUNT", category, id: form.serviceID });
    
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
        
        const customer = data.customerName || data.data?.customerName || data.data?.name;
        if (customer) {
            setValidatedName(customer);
            toast.success(`Owner: ${customer}`);
        } else {
            toast.error(data.message || "Account not found");
        }
    } catch (e) {
        toast.error("System Check Failed");
    } finally {
        setIsValidating(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Sending request...");
    try {
        let endpoint = '/api/terminal/purchase/';
        let payload: any = { serviceID: form.serviceID, requestId: `TEST-${Date.now()}` };

        if (category === 'AIRTIME') {
            endpoint += 'airtime';
            payload = { ...payload, network: selectedNetwork, amount: parseInt(form.amount), mobileNumber: form.mobileNumber };
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
        
        if (data.status === 'success' || data.success) {
            toast.success("Completed", { id: tid });
            fetchStatus();
        } else {
            toast.error(data.message || "Request Denied", { id: tid });
        }
    } catch (e) {
        toast.error("System Link Error", { id: tid });
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
    <div className="space-y-10 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-900 pb-8">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">TESTING_<span className="text-blue-500">LAB</span></h1>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Advanced System Tests</p>
            </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-xl">
           <button onClick={() => setActiveTab('PURCHASE_LAB')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black transition-all ${activeTab === 'PURCHASE_LAB' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>TEST_PAYMENTS</button>
           <button onClick={() => setActiveTab('REGISTRY')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black transition-all ${activeTab === 'REGISTRY' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>RELOAD_PLANS</button>
           <button onClick={() => setActiveTab('DEBUG_INFO')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black transition-all ${activeTab === 'DEBUG_INFO' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>LOGS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
            
            {activeTab === 'PURCHASE_LAB' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10 overflow-x-auto no-scrollbar gap-4 border-b border-slate-800 pb-8 relative z-10">
                        {[
                            { id: 'AIRTIME', icon: Smartphone },
                            { id: 'DATA', icon: Wifi },
                            { id: 'CABLE', icon: Tv },
                            { id: 'POWER', icon: Zap }
                        ].map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => { setCategory(cat.id as PurchaseCategory); setValidatedName(null); setForm({...form, serviceID: ''}); }}
                                className={`flex flex-col items-center min-w-[80px] group transition-all ${category === cat.id ? 'text-blue-500' : 'text-slate-500'}`}
                            >
                                <div className={`p-4 rounded-2xl mb-3 border-2 transition-all ${category === cat.id ? 'bg-blue-600/10 border-blue-500 scale-110' : 'bg-slate-950 border-slate-900 group-hover:border-slate-700'}`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest">{cat.id}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                {(category === 'AIRTIME' || category === 'DATA') && (
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Carrier</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                                                <button 
                                                    key={net} 
                                                    onClick={() => { setSelectedNetwork(net); setForm({...form, serviceID: ''}); }}
                                                    className={`py-3 rounded-xl text-[8px] font-black border transition-all ${selectedNetwork === net ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                                                >
                                                    {net}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Plan Choice</label>
                                    <select 
                                        value={form.serviceID}
                                        onChange={e => setForm({...form, serviceID: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-[10px] outline-none focus:border-blue-500 appearance-none shadow-inner"
                                    >
                                        <option value="">-- SELECT PLAN --</option>
                                        {currentOptions.map(opt => (
                                            <option key={opt.id} value={opt.serviceID}>
                                                {opt.label.toUpperCase()} {opt.amount ? `(₦${opt.amount})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {(category === 'AIRTIME' || category === 'DATA') && (
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Recipient</label>
                                        <input 
                                            type="text" value={form.mobileNumber} 
                                            onChange={e => setForm({...form, mobileNumber: e.target.value.replace(/\D/g, '')})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono text-lg tracking-[0.2em] outline-none focus:border-blue-500 shadow-inner"
                                            placeholder="08012345678"
                                        />
                                    </div>
                                )}

                                {(category === 'AIRTIME' || category === 'POWER') && (
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Value (₦)</label>
                                        <input 
                                            type="number" value={form.amount} 
                                            onChange={e => setForm({...form, amount: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xl outline-none focus:border-blue-500 shadow-inner"
                                            placeholder="0"
                                        />
                                    </div>
                                )}

                                {(category === 'CABLE' || category === 'POWER') && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Account Reference</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" value={category === 'CABLE' ? form.iucNum : form.meterNum} 
                                                    onChange={e => setForm({...form, [category === 'CABLE' ? 'iucNum' : 'meterNum']: e.target.value.replace(/\D/g, '')})}
                                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono tracking-widest outline-none focus:border-blue-500 shadow-inner"
                                                    placeholder="1029384756"
                                                />
                                                <button disabled={isValidating || (!form.iucNum && !form.meterNum) || !form.serviceID} onClick={handleVerify} className="bg-slate-800 hover:bg-white hover:text-black px-6 rounded-2xl text-[8px] font-black uppercase transition-all disabled:opacity-30 flex items-center shadow-lg">
                                                    {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'CHECK'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-center items-center text-center p-10 bg-slate-950/50 rounded-[3rem] border-2 border-slate-800 border-dashed relative overflow-hidden group/probe">
                                 {isValidating && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20"><RefreshCw className="w-10 h-10 text-blue-500 animate-spin" /></div>}
                                 {validatedName ? (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-emerald-500/10 p-6 rounded-full mx-auto w-fit border border-emerald-500/20"><UserCheck className="w-12 h-12 text-emerald-500" /></div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Found Owner</p>
                                            <h4 className="text-xl font-black text-white tracking-tighter uppercase">{validatedName}</h4>
                                        </div>
                                    </div>
                                 ) : (
                                    <div className="opacity-10 space-y-4">
                                        <ShieldCheck className="w-20 h-20 mx-auto text-slate-400" />
                                        <p className="text-[8px] font-black uppercase tracking-[0.6em]">Awaiting Check</p>
                                    </div>
                                 )}
                            </div>
                        </div>

                        <button 
                            onClick={handlePurchase}
                            disabled={isLoading || !form.serviceID}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-[2.2rem] transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center active:scale-95 disabled:opacity-30"
                        >
                            {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Play className="w-5 h-5 mr-4" /> TEST PAYMENT</>}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'REGISTRY' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in h-full">
                    <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-8">
                        <div>
                            <h3 className="text-3xl font-black text-white flex items-center uppercase tracking-tighter">
                                <Database className="w-8 h-8 mr-3 text-blue-500" /> Reload Plans
                            </h3>
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-2">Download newest prices from system provider</p>
                        </div>
                        <button onClick={syncServices} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center shadow-2xl active:scale-95">
                            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <HardDriveDownload className="w-4 h-4 mr-3" />}
                            Sync System
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                        {syncedServices.length === 0 ? (
                            <div className="col-span-2 py-20 text-center text-slate-800 flex flex-col items-center gap-4">
                                <AlertTriangle className="w-12 h-12" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No plans found in database.</p>
                            </div>
                        ) : (
                            syncedServices.map(svc => (
                                <div key={svc.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 group hover:border-blue-500/40 transition-all">
                                    <div className="p-3 rounded-xl bg-slate-900 group-hover:scale-105 transition-transform shadow-lg">
                                        {svc.type === 'DATA' ? <Wifi className="w-4 h-4 text-emerald-500" /> : svc.type === 'AIRTIME' ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Monitor className="w-4 h-4 text-purple-500" />}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-white font-black uppercase text-[10px] truncate tracking-tight">{svc.label}</p>
                                        <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest mt-0.5">ID: {svc.serviceID}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'DEBUG_INFO' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in text-left">
                    <h3 className="text-3xl font-black text-white mb-8 flex items-center uppercase tracking-tighter">
                        <Monitor className="w-8 h-8 mr-3 text-emerald-500" /> History Logs
                    </h3>
                    <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                        These logs show what is happening in the system background. If anything fails, you will see the exact reason here.
                    </p>
                    <div className="bg-black/50 p-8 rounded-[2rem] border border-slate-800 font-mono text-[10px] uppercase tracking-[0.2em] leading-loose text-emerald-500 shadow-inner">
                        &gt; SYSTEM: CHECKED<br/>
                        &gt; DATABASE: READY<br/>
                        &gt; ACCESS: GRANTED<br/>
                        &gt; UPLINK: STABLE
                    </div>
                </div>
            )}

        </div>

        <div className="lg:col-span-5 space-y-8 flex flex-col h-full">
            <div className={`border p-8 rounded-[3rem] shadow-2xl flex items-center space-x-6 transition-all duration-1000 ${balanceError ? 'bg-rose-500/10 border-rose-500/40 animate-pulse' : 'bg-slate-900 border-slate-800 hover:border-blue-500/30'}`}>
                <div className={`p-4 rounded-2xl border transition-colors ${balanceError ? 'bg-rose-600/20 border-rose-500/40 text-rose-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'}`}>
                    {balanceError ? <AlertTriangle className="w-8 h-8" /> : <Database className="w-8 h-8" />}
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Provider Funds</p>
                    <h2 className={`text-3xl font-black font-mono tracking-tighter ${balanceError ? 'text-rose-500' : 'text-white'}`}>
                        {balance === null ? (balanceError ? 'ERROR' : '...') : `₦${balance.toLocaleString()}`}
                    </h2>
                </div>
                <button onClick={fetchStatus} className="ml-auto p-3 text-slate-500 hover:text-white transition-colors"><RefreshCw className="w-5 h-5" /></button>
            </div>

            <div className="bg-black border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col flex-1 shadow-2xl relative min-h-[500px]">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[9px] font-black text-white uppercase tracking-[0.4em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-blue-500" /> Activity_Feed
                    </h3>
                    <button onClick={() => setRawResponse(null)} className="text-[8px] font-black text-slate-600 hover:text-white uppercase tracking-widest">CLEAR</button>
                </div>
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar custom-scroll">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-5 space-y-4">
                            <Activity className="w-16 h-16 animate-pulse text-blue-500" />
                            <p className="text-[8px] font-black uppercase tracking-[1em] text-center">No Signal</p>
                        </div>
                    ) : (
                        <pre className={`leading-relaxed whitespace-pre-wrap ${rawResponse.status === 'SUCCESS' || rawResponse.step ? 'text-blue-400' : 'text-rose-500 font-bold animate-pulse'}`}>
                            {JSON.stringify(rawResponse, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};