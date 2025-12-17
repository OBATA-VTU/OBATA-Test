import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Tv, GraduationCap, 
  Send, RefreshCw, Terminal, CheckCircle, 
  AlertCircle, ShieldCheck, Database, LayoutGrid,
  CloudLightning, Search, CreditCard, Image as ImageIcon,
  Upload, ExternalLink, Globe, Landmark, Code, Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';

type DiagnosticTab = 'INLOMAX' | 'PAYSTACK' | 'IMGBB';

export const TransactionTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('INLOMAX');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedServices, setSyncedServices] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Manual Inlomax Test State
  const [manualInlomax, setManualInlomax] = useState({ serviceID: '', phone: '08012345678', amount: '100', type: 'AIRTIME' });

  // Test States
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testUrl, setTestUrl] = useState('');
  const [banksList, setBanksList] = useState<any[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/terminal/balance');
      const data = await res.json();
      if (data.status === 'success') {
        setBalance(data.data.funds);
      }
    } catch (e) {
      console.error("Balance fetch error");
    }
  };

  const loadLocalServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'synced_services'));
        const services: any[] = [];
        querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
        setSyncedServices(services);
    } catch (e) {
        console.error("Firestore access error");
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
    const tid = toast.loading("Syncing Provider Catalog...");
    try {
      const res = await fetch('/api/terminal/services');
      const result = await res.json();
      setRawResponse(result);
      
      if (result.status === 'success') {
        const batch = writeBatch(db);
        const data = result.data;
        
        // Save Airtime
        data.airtime.forEach((item: any) => {
            const ref = doc(collection(db, 'synced_services'), `AIRTIME_${item.network}`);
            batch.set(ref, { ...item, type: 'AIRTIME', label: `${item.network} Airtime` });
        });

        // Save Data
        data.dataPlans.forEach((item: any) => {
            const ref = doc(collection(db, 'synced_services'), `DATA_${item.serviceID}`);
            batch.set(ref, { ...item, type: 'DATA', label: `${item.network} ${item.dataPlan} (${item.dataType})` });
        });

        await batch.commit();
        toast.success("Database Updated!", { id: tid });
        loadLocalServices();
      } else {
        toast.error("Provider rejected sync request", { id: tid });
      }
    } catch (e: any) {
      toast.error("Sync Failed: API Proxy Timeout or Error", { id: tid });
      setRawResponse({ error: e.message, hint: "Check Vercel logs or Inlomax API Key" });
    } finally {
      setIsSyncing(false);
    }
  };

  const runManualTest = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading(`Initiating Manual ${manualInlomax.type}...`);
    try {
        const endpoint = manualInlomax.type === 'AIRTIME' ? '/api/terminal/airtime' : '/api/terminal/data';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                serviceID: manualInlomax.serviceID, 
                amount: Number(manualInlomax.amount), 
                mobileNumber: manualInlomax.phone 
            })
        });
        const data = await res.json();
        setRawResponse(data);
        if (data.status === 'success') toast.success("Test Successful!", { id: tid });
        else toast.error(data.message || "Provider Rejected", { id: tid });
        fetchStatus();
    } catch (e: any) {
        toast.error("Handshake Failed", { id: tid });
        setRawResponse({ error: e.message });
    } finally {
        setIsLoading(false);
    }
  };

  // --- IMGBB ACTIONS ---
  const testImgBBUpload = async () => {
    if (!testFile) return toast.error("Select an image first");
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Uploading to ImgBB...");
    try {
        const formData = new FormData();
        formData.append('image', testFile);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=6335530a0b22ceea3ae8c5699049bd5e`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        setRawResponse(data);
        if (data.success) {
            setTestUrl(data.data.url);
            toast.success("Image Live on ImgBB!", { id: tid });
        } else {
            toast.error("Upload rejected", { id: tid });
        }
    } catch (e) {
        toast.error("ImgBB Down", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  // --- PAYSTACK ACTIONS ---
  const testPaystackBanks = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Connecting to Paystack...");
    try {
        const res = await fetch('/api/terminal/banks');
        const data = await res.json();
        setRawResponse(data);
        if (data.status === 'success') {
            setBanksList(data.data);
            toast.success(`${data.data.length} Banks Verified!`, { id: tid });
        } else {
            toast.error("Paystack refused handshake", { id: tid });
        }
    } catch (e: any) {
        toast.error("Connectivity Lost", { id: tid });
        setRawResponse({ error: e.message });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">OBATA <span className="text-blue-500">LIVE TESTER</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Manual API Diagnostic Control</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           <button onClick={() => setActiveTab('INLOMAX')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'INLOMAX' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>INLOMAX</button>
           <button onClick={() => setActiveTab('PAYSTACK')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'PAYSTACK' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}>PAYSTACK</button>
           <button onClick={() => setActiveTab('IMGBB')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'IMGBB' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}>IMGBB</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Input Column */}
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'INLOMAX' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Manual Test Console */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                         <h3 className="text-xl font-black text-white mb-8 flex items-center">
                            <Code className="w-6 h-6 mr-3 text-blue-500" /> Manual Purchase Overrider
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Service Type</label>
                                <select 
                                    value={manualInlomax.type}
                                    onChange={e => setManualInlomax({...manualInlomax, type: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none"
                                >
                                    <option value="AIRTIME">Airtime</option>
                                    <option value="DATA">Data</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Inlomax Service ID</label>
                                <input 
                                    type="text" value={manualInlomax.serviceID} onChange={e => setManualInlomax({...manualInlomax, serviceID: e.target.value})}
                                    placeholder="e.g. 1 or 35"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Test Phone Number</label>
                                <input 
                                    type="text" value={manualInlomax.phone} onChange={e => setManualInlomax({...manualInlomax, phone: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Amount (Naira)</label>
                                <input 
                                    type="text" value={manualInlomax.amount} onChange={e => setManualInlomax({...manualInlomax, amount: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500"
                                />
                            </div>
                         </div>
                         <button 
                            onClick={runManualTest} 
                            disabled={isLoading}
                            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center active:scale-95"
                         >
                            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Play className="w-5 h-5 mr-3" /> FIRE TEST TRANSACTION</>}
                         </button>
                    </div>

                    {/* Sync Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center">
                                <Database className="w-6 h-6 mr-3 text-emerald-500" /> Catalog Registry
                            </h3>
                            <button 
                                onClick={syncServices} 
                                disabled={isSyncing}
                                className="bg-slate-950 hover:bg-white hover:text-black border border-slate-800 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center"
                            >
                                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <CloudLightning className="w-4 h-4 mr-3" />}
                                Force Re-Sync Catalog
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 no-scrollbar border-t border-slate-800 pt-8">
                            {syncedServices.length === 0 ? (
                                <div className="py-24 text-center">
                                    <Search className="w-12 h-12 mx-auto mb-6 text-slate-800" />
                                    <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No Catalog Data in Firestore</p>
                                </div>
                            ) : (
                                syncedServices.map(svc => (
                                    <div key={svc.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-xl bg-slate-900"><Zap className="w-4 h-4 text-emerald-500" /></div>
                                            <div>
                                                <p className="text-white font-black uppercase text-xs tracking-tight">{svc.label}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Inlomax ID: {svc.serviceID} • Price: ₦{svc.amount || '0'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setManualInlomax({...manualInlomax, serviceID: svc.serviceID, type: svc.type})} className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Select</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'PAYSTACK' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in text-center">
                    <div className="bg-emerald-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
                        <Landmark className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Paystack Connection Lab</h2>
                    <p className="text-slate-500 text-sm mb-12 max-w-sm mx-auto">Verify your live secret key can successfully talk to Paystack servers and pull financial metadata.</p>

                    <button 
                        onClick={testPaystackBanks} 
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-12 py-5 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center mx-auto"
                    >
                        {isLoading ? <RefreshCw className="animate-spin w-5 h-5 mr-3" /> : <Database className="w-5 h-5 mr-3" />}
                        FETCH LIVE BANK LIST
                    </button>

                    {banksList.length > 0 && (
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-3 no-scrollbar text-left p-6 bg-slate-950 rounded-[2rem] border border-slate-800">
                            {banksList.map(b => (
                                <div key={b.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase truncate">{b.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'IMGBB' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in text-center">
                    <div className="bg-purple-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-purple-500/20">
                        <ImageIcon className="w-12 h-12 text-purple-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">ImgBB File Handshake</h2>
                    <p className="text-slate-500 text-sm mb-12 max-w-sm mx-auto">Test real image binary uploads to your CDN.</p>
                    
                    <div className="max-w-md mx-auto space-y-8 text-left">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-800 rounded-[2.5rem] cursor-pointer bg-slate-950 hover:bg-slate-900 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {testFile ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <Upload className="w-10 h-10 text-slate-700 group-hover:text-purple-500 transition-colors" />}
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">{testFile ? testFile.name : 'Click to Upload Blob'}</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setTestFile(e.target.files[0])} />
                        </label>
                        
                        <button onClick={testImgBBUpload} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-600/20 active:scale-95 transition-all">
                            {isLoading ? <RefreshCw className="animate-spin w-6 h-6 mx-auto" /> : 'UPLOAD & VERIFY'}
                        </button>

                        {testUrl && (
                            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl animate-fade-in">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3">Live CDN URL Generated:</p>
                                <div className="flex items-center space-x-3">
                                    <input type="text" readOnly value={testUrl} className="flex-1 bg-transparent text-xs text-slate-400 font-mono focus:outline-none" />
                                    <a href={testUrl} target="_blank" className="text-blue-500 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>

        {/* Console Column */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6">
                <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                    <Database className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inlomax Balance</p>
                    <h2 className="text-3xl font-black text-white font-mono tracking-tighter">{balance === null ? 'OFFLINE' : `₦${balance.toLocaleString()}`}</h2>
                </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-2xl">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Provider Matrix
                    </h3>
                </div>
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <LayoutGrid className="w-16 h-16 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-widest mt-6">Handshake Awaiting</p>
                        </div>
                    ) : (
                        <pre className={`leading-relaxed ${rawResponse.status === 'success' || rawResponse.success ? 'text-blue-400' : 'text-rose-400'}`}>
                            {JSON.stringify(rawResponse, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem]">
                <div className="flex items-center space-x-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Diagnostic Log</h4>
                </div>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                    Proxy sequence active. If the matrix returns a 500 error, ensure your Vercel Environment Variables are correctly propagated.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};