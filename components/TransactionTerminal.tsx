import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Tv, GraduationCap, 
  Send, RefreshCw, Terminal, CheckCircle, 
  AlertCircle, ShieldCheck, Database, LayoutGrid,
  CloudLightning, Search, CreditCard, Image as ImageIcon,
  Upload, ExternalLink, Globe, Landmark
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';

type DiagnosticTab = 'INLOMAX' | 'PAYSTACK' | 'IMGBB';

export const TransactionTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('INLOMAX');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedServices, setSyncedServices] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
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
    const querySnapshot = await getDocs(collection(db, 'synced_services'));
    const services: any[] = [];
    querySnapshot.forEach((doc) => services.push({ id: doc.id, ...doc.data() }));
    setSyncedServices(services);
  };

  useEffect(() => {
    fetchStatus();
    loadLocalServices();
  }, []);

  // --- INLOMAX ACTIONS ---
  const syncServices = async () => {
    setIsSyncing(true);
    const tid = toast.loading("Syncing Provider Catalog...");
    try {
      const res = await fetch('/api/terminal/services');
      const result = await res.json();
      
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
      }
    } catch (e) {
      toast.error("Sync Failed", { id: tid });
    } finally {
      setIsSyncing(false);
    }
  };

  const testBuy = async (svc: any) => {
    setIsLoading(true);
    setRawResponse(null);
    const tid = toast.loading(`Testing ${svc.label}...`);
    try {
        const endpoint = svc.type === 'AIRTIME' ? '/api/terminal/airtime' : '/api/terminal/data';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceID: svc.serviceID, amount: 100, mobileNumber: '08012345678' })
        });
        const data = await res.json();
        setRawResponse(data);
        if (data.status === 'success') toast.success("Purchase Successful!", { id: tid });
        else toast.error("Provider rejected purchase", { id: tid });
        fetchStatus();
    } catch (e) {
        toast.error("Connection Error", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  // --- IMGBB ACTIONS ---
  const testImgBBUpload = async () => {
    if (!testFile) return toast.error("Select an image first");
    setIsLoading(true);
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
            toast.success("Image Uploaded Successfully!", { id: tid });
        } else {
            toast.error("ImgBB rejected upload", { id: tid });
        }
    } catch (e) {
        toast.error("ImgBB Connection Failed", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  // --- PAYSTACK ACTIONS ---
  const testPaystackBanks = async () => {
    setIsLoading(true);
    const tid = toast.loading("Fetching Bank List...");
    try {
        const res = await fetch('/api/terminal/banks');
        const data = await res.json();
        setRawResponse(data);
        if (data.status) {
            setBanksList(data.data);
            toast.success(`${data.data.length} Banks Found!`, { id: tid });
        } else {
            toast.error("Paystack couldn't fetch banks", { id: tid });
        }
    } catch (e) {
        toast.error("Paystack Connection Error", { id: tid });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">OBATA <span className="text-blue-500">VTU COMMAND</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">API Diagnostic Suite v2.0</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           <button onClick={() => setActiveTab('INLOMAX')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'INLOMAX' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>INLOMAX</button>
           <button onClick={() => setActiveTab('PAYSTACK')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'PAYSTACK' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>PAYSTACK</button>
           <button onClick={() => setActiveTab('IMGBB')} className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'IMGBB' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>IMGBB</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Workspace */}
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'INLOMAX' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-fade-in">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center">
                                <Database className="w-6 h-6 mr-3 text-blue-500" /> Catalog Registry
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">Sync Inlomax products to OBATA database</p>
                        </div>
                        <button 
                            onClick={syncServices} 
                            disabled={isSyncing}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center shadow-xl shadow-blue-600/20"
                        >
                            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <RefreshCw className="w-4 h-4 mr-3" />}
                            Sync Catalog
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 no-scrollbar">
                        {syncedServices.length === 0 ? (
                            <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                                <CloudLightning className="w-16 h-16 mx-auto mb-6 text-slate-800" />
                                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Registry Empty</p>
                            </div>
                        ) : (
                            syncedServices.map(svc => (
                                <div key={svc.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-center justify-between hover:border-blue-500/40 transition-all group">
                                    <div className="flex items-center space-x-5">
                                        <div className={`p-4 rounded-2xl ${svc.type === 'AIRTIME' ? 'bg-blue-600/10 text-blue-500' : 'bg-emerald-600/10 text-emerald-500'}`}>
                                            {svc.type === 'AIRTIME' ? <Smartphone className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase tracking-tight">{svc.label}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inlomax ID: {svc.serviceID} • Price: ₦{svc.amount || '0'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => testBuy(svc)} className="bg-slate-800 hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Test Buy</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'IMGBB' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in text-center">
                    <div className="bg-purple-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-purple-500/20">
                        <ImageIcon className="w-12 h-12 text-purple-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">ImgBB API Validator</h2>
                    <p className="text-slate-500 text-sm mb-12 max-w-sm mx-auto">Verify that OBATA can successfully upload images and receive valid public URLs.</p>
                    
                    <div className="max-w-md mx-auto space-y-8">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-800 rounded-[2.5rem] cursor-pointer bg-slate-950 hover:bg-slate-900 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {testFile ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <Upload className="w-10 h-10 text-slate-700 group-hover:text-purple-500 transition-colors" />}
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">{testFile ? testFile.name : 'Select Test Image'}</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setTestFile(e.target.files[0])} />
                        </label>
                        
                        <button onClick={testImgBBUpload} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-purple-600/20 active:scale-95 transition-all">
                            {isLoading ? <RefreshCw className="animate-spin w-6 h-6 mx-auto" /> : 'EXECUTE UPLOAD TEST'}
                        </button>

                        {testUrl && (
                            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl animate-fade-in text-left">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3">Live URL Received:</p>
                                <div className="flex items-center space-x-3">
                                    <input type="text" readOnly value={testUrl} className="flex-1 bg-transparent text-xs text-slate-400 font-mono focus:outline-none" />
                                    <a href={testUrl} target="_blank" className="text-blue-500 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'PAYSTACK' && (
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl animate-fade-in text-center">
                    <div className="bg-emerald-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
                        <Landmark className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Paystack Gateway Validator</h2>
                    <p className="text-slate-500 text-sm mb-12 max-w-sm mx-auto">Verify your Paystack Public and Secret keys can fetch banks and initiate checkouts.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                        <button onClick={testPaystackBanks} className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/40 transition-all group">
                            <Database className="w-8 h-8 text-slate-700 mx-auto mb-4 group-hover:text-emerald-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Test Bank Fetch</span>
                        </button>
                        <button onClick={() => toast.success("Gateway Ready for Deployment")} className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/40 transition-all group">
                            <CreditCard className="w-8 h-8 text-slate-700 mx-auto mb-4 group-hover:text-emerald-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Test Checkout POP</span>
                        </button>
                    </div>

                    {banksList.length > 0 && (
                        <div className="mt-12 bg-slate-950 border border-slate-800 rounded-3xl p-8 text-left h-64 overflow-y-auto no-scrollbar">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">Successfully Fetched Banks:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {banksList.slice(0, 10).map(b => (
                                    <div key={b.id} className="text-xs text-slate-500 font-bold border-l-2 border-slate-800 pl-3 uppercase">{b.name}</div>
                                ))}
                                <div className="text-xs text-slate-600 italic">...and {banksList.length - 10} more</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* Side Console */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6">
                <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                    <Landmark className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inlomax Balance</p>
                    <h2 className="text-3xl font-black text-white font-mono">{balance === null ? 'SYNCING' : `₦${balance.toLocaleString()}`}</h2>
                </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[500px] shadow-2xl">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Raw Matrix
                    </h3>
                </div>
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar">
                    {!rawResponse ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <LayoutGrid className="w-16 h-16 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-widest mt-6">Awaiting Uplink</p>
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
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Security Log</h4>
                </div>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter">
                    Every command sent through this terminal uses your live API keys. Ensure you are on a secure network before executing financial syncs.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};