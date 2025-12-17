import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Terminal, CheckCircle, 
  AlertCircle, ShieldCheck, Database, LayoutGrid,
  CloudLightning, Search, CreditCard, Image as ImageIcon,
  Upload, ExternalLink, Landmark, Play, UserCheck, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

type DiagnosticTab = 'INLOMAX' | 'PAYSTACK' | 'IMGBB';

export const TransactionTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('INLOMAX');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedServices, setSyncedServices] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Paystack Manual Test State
  const [manualPaystack, setManualPaystack] = useState({ accountNumber: '', bankCode: '' });
  const [banksList, setBanksList] = useState<any[]>([]);

  // ImgBB Test State
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testUrl, setTestUrl] = useState('');

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
    const tid = toast.loading("Connecting to Inlomax...");
    try {
      const res = await fetch('/api/terminal/services');
      const result = await res.json();
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
        toast.success("Database Updated Successfully!", { id: tid });
        loadLocalServices();
      } else {
        toast.error("Provider Handshake Refused", { id: tid });
      }
    } catch (e: any) {
      toast.error("Sync Failed: Check Matrix for Details", { id: tid });
      setRawResponse({ error: "Connection Interrupted", hint: "Ensure Vercel environment variables are correct." });
    } finally {
      setIsSyncing(false);
    }
  };

  // --- PAYSTACK ACTIONS ---
  const fetchBanks = async () => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Fetching Nigerian Banks...");
    try {
        const res = await fetch('/api/terminal/banks');
        const data = await res.json();
        setRawResponse(data);
        if (data.status === 'success') {
            setBanksList(data.data);
            toast.success(`${data.data.length} Banks Loaded!`, { id: tid });
        } else {
            toast.error("Paystack Connection Error", { id: tid });
        }
    } catch (e: any) {
        toast.error("Bridge Connection Lost", { id: tid });
        setRawResponse({ error: e.message });
    } finally {
        setIsLoading(false);
    }
  };

  const resolveAccount = async () => {
    if (!manualPaystack.accountNumber || !manualPaystack.bankCode) {
        return toast.error("Enter Account & Select Bank");
    }
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading("Verifying Account Name...");
    try {
        const res = await fetch(`/api/terminal/resolve?accountNumber=${manualPaystack.accountNumber}&bankCode=${manualPaystack.bankCode}`);
        const data = await res.json();
        setRawResponse(data);
        if (data.status === 'success') {
            toast.success(`Account Matched: ${data.data.account_name}`, { id: tid });
        } else {
            toast.error(data.message || "Unable to match account", { id: tid });
        }
    } catch (e: any) {
        toast.error("Handshake Error", { id: tid });
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
    const tid = toast.loading("Uploading to ImgBB CDN...");
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
            toast.success("CDN Image Live!", { id: tid });
        } else {
            toast.error("Upload rejected", { id: tid });
        }
    } catch (e) {
        toast.error("Upload Error", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">OBATA <span className="text-blue-500">VTU HUB</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Core API Diagnostic System</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           <button onClick={() => setActiveTab('INLOMAX')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'INLOMAX' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>INLOMAX</button>
           <button onClick={() => setActiveTab('PAYSTACK')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'PAYSTACK' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}>PAYSTACK</button>
           <button onClick={() => setActiveTab('IMGBB')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'IMGBB' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}>IMGBB</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Active Test Area */}
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'INLOMAX' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white flex items-center">
                                <Database className="w-6 h-6 mr-3 text-blue-500" /> Catalog Synchronizer
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">Sync all network services to Firestore</p>
                        </div>
                        <button 
                            onClick={syncServices} 
                            disabled={isSyncing}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center shadow-xl shadow-blue-600/20"
                        >
                            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <CloudLightning className="w-4 h-4 mr-3" />}
                            Sync Catalog
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 no-scrollbar border-t border-slate-800 pt-8">
                        {syncedServices.length === 0 ? (
                            <div className="py-24 text-center">
                                <Search className="w-12 h-12 mx-auto mb-6 text-slate-800" />
                                <p className="text-slate-600 font-black uppercase tracking-widest text-xs tracking-[0.2em]">Registry Empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {syncedServices.map(svc => (
                                    <div key={svc.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
                                        <div className={`p-3 rounded-xl bg-slate-900`}>
                                            {svc.type === 'AIRTIME' ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-white font-black uppercase text-[10px] truncate">{svc.label}</p>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase">ID: {svc.serviceID}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'PAYSTACK' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Account Resolver */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                         <h3 className="text-xl font-black text-white mb-8 flex items-center">
                            <UserCheck className="w-6 h-6 mr-3 text-emerald-500" /> Manual Identity Resolver
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Account Number (10 Digits)</label>
                                <input 
                                    type="text" maxLength={10} value={manualPaystack.accountNumber} 
                                    onChange={e => setManualPaystack({...manualPaystack, accountNumber: e.target.value.replace(/\D/g, '')})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg tracking-[0.2em] outline-none focus:border-emerald-500"
                                    placeholder="0123456789"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Select Destination Bank</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={manualPaystack.bankCode}
                                        onChange={e => setManualPaystack({...manualPaystack, bankCode: e.target.value})}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none"
                                    >
                                        <option value="">-- Choose Bank --</option>
                                        {banksList.map(b => <option key={b.id} value={b.code}>{b.name}</option>)}
                                    </select>
                                    <button onClick={fetchBanks} className="bg-slate-800 hover:bg-white hover:text-black p-4 rounded-xl transition-all" title="Refresh Bank List">
                                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>
                         </div>
                         <button 
                            onClick={resolveAccount} 
                            disabled={isLoading}
                            className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center active:scale-95"
                         >
                            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Play className="w-5 h-5 mr-3" /> VERIFY ACCOUNT NAME</>}
                         </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
                                <Landmark className="w-5 h-5 mr-3 text-slate-500" /> Infrastructure Node List
                            </h3>
                            <span className="text-[10px] text-slate-500 font-bold">{banksList.length} Nodes Online</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-3 no-scrollbar">
                            {banksList.length === 0 ? (
                                <div className="col-span-4 py-12 text-center text-slate-700 italic text-xs">Run Sync to populate list...</div>
                            ) : (
                                banksList.map(b => (
                                    <div key={b.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[9px] font-bold text-slate-400 uppercase truncate">
                                        {b.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'IMGBB' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in text-center">
                    <div className="bg-purple-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-purple-500/20">
                        <ImageIcon className="w-12 h-12 text-purple-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">ImgBB Binary Handshake</h2>
                    <p className="text-slate-500 text-sm mb-12 max-w-sm mx-auto">Upload a test file to verify ImgBB CDN connectivity and public URL generation.</p>
                    
                    <div className="max-w-md mx-auto space-y-8 text-left">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-800 rounded-[2.5rem] cursor-pointer bg-slate-950 hover:bg-slate-900 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {testFile ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <Upload className="w-10 h-10 text-slate-700 group-hover:text-purple-500 transition-colors" />}
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">{testFile ? testFile.name : 'Choose Image Blob'}</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setTestFile(e.target.files[0])} />
                        </label>
                        
                        <button onClick={testImgBBUpload} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-600/20 active:scale-95 transition-all">
                            {isLoading ? <RefreshCw className="animate-spin w-6 h-6 mx-auto" /> : 'UPLOAD & VERIFY'}
                        </button>

                        {testUrl && (
                            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl animate-fade-in">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3">Live URL Generated:</p>
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

        {/* Real-time Side Console */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6">
                <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                    <Database className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inlomax Global Balance</p>
                    <h2 className="text-3xl font-black text-white font-mono tracking-tighter">{balance === null ? 'SYNCING...' : `₦${balance.toLocaleString()}`}</h2>
                </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-2xl">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Provider Matrix
                    </h3>
                    <button onClick={() => setRawResponse(null)} className="text-[8px] font-black text-slate-700 hover:text-slate-400 uppercase tracking-widest">Clear Logs</button>
                </div>
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <LayoutGrid className="w-16 h-16 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-widest mt-6 tracking-[0.5em]">Standby</p>
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
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Security Gateway</h4>
                </div>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                    Vercel function routing active. All requests are proxied via secure serverless nodes. If matrix returns 404, verify `vercel.json` rewrites.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};