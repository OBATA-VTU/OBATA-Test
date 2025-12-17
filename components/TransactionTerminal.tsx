import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Wifi, Tv, GraduationCap, 
  Send, RefreshCw, Terminal, CheckCircle, 
  AlertCircle, ShieldCheck, Database, LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Service = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION';

export const TransactionTerminal: React.FC = () => {
  const [activeService, setActiveService] = useState<Service>('AIRTIME');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState<any>({
    serviceID: '',
    amount: '',
    mobileNumber: '',
    iucNum: '',
    meterNum: '',
    meterType: '1', // 1=prepaid, 2=postpaid
    quantity: '1'
  });

  const fetchBalance = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/terminal/balance');
      const data = await res.json();
      if (data.status === 'success') {
        setBalance(data.data.funds);
        toast.success("Wallet Synchronized");
      }
    } catch (e) {
      toast.error("Balance sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRawResponse(null);

    let endpoint = '';
    let payload: any = { serviceID: formData.serviceID };

    switch (activeService) {
      case 'AIRTIME':
        endpoint = '/api/terminal/airtime';
        payload = { ...payload, amount: Number(formData.amount), mobileNumber: formData.mobileNumber };
        break;
      case 'DATA':
        endpoint = '/api/terminal/data';
        payload = { ...payload, mobileNumber: formData.mobileNumber };
        break;
      case 'CABLE':
        endpoint = '/api/terminal/buy-cable';
        payload = { ...payload, iucNum: formData.iucNum };
        break;
      case 'ELECTRICITY':
        endpoint = '/api/terminal/buy-electricity';
        payload = { ...payload, meterNum: formData.meterNum, meterType: Number(formData.meterType), amount: Number(formData.amount) };
        break;
      case 'EDUCATION':
        endpoint = '/api/terminal/buy-education';
        payload = { ...payload, quantity: Number(formData.quantity) };
        break;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setRawResponse(data);
      
      if (data.status === 'success' || data.status === 'processing') {
        toast.success(data.message || "Transaction Initialized");
        fetchBalance();
      } else {
        toast.error(data.message || "Transaction Failed");
      }
    } catch (e: any) {
      toast.error("Network Error: Connectivity Interrupted");
      setRawResponse({ error: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const ServiceButton = ({ id, icon: Icon, label }: { id: Service, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveService(id); setRawResponse(null); }}
      className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
        activeService === id 
          ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10' 
          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
      }`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header & Balance */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-900 pb-8">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">OBATA VTU <span className="text-blue-500">TERMINAL</span></h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 ml-1">Live Inlomax Node: Active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center space-x-6 shadow-2xl min-w-[280px]">
           <div className="bg-emerald-500/10 p-3 rounded-2xl">
              <Database className="w-6 h-6 text-emerald-500" />
           </div>
           <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Inlomax Wallet</p>
              <h2 className="text-2xl font-black text-white font-mono">
                {isSyncing ? 'SYNCING...' : `₦${balance?.toLocaleString() || '0.00'}`}
              </h2>
           </div>
           <button onClick={fetchBalance} className="text-slate-600 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-2 flex gap-2 border-b border-slate-800 bg-black/40">
            <ServiceButton id="AIRTIME" icon={Smartphone} label="Airtime" />
            <ServiceButton id="DATA" icon={Wifi} label="Data" />
            <ServiceButton id="CABLE" icon={Tv} label="Cable" />
            <ServiceButton id="ELECTRICITY" icon={Zap} label="Power" />
            <ServiceButton id="EDUCATION" icon={GraduationCap} label="Exams" />
          </div>

          <form onSubmit={handleTransaction} className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Inlomax Service ID (Required)</label>
                <input 
                  type="text" name="serviceID" required value={formData.serviceID} onChange={handleInputChange}
                  placeholder="e.g. 1 (MTN), 35 (Glo Data)"
                  className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-mono focus:border-blue-500 outline-none" 
                />
              </div>

              {(activeService === 'AIRTIME' || activeService === 'DATA') && (
                <div className="col-span-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Phone Number</label>
                  <input 
                    type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleInputChange}
                    className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-mono focus:border-blue-500 outline-none" 
                  />
                </div>
              )}

              {(activeService === 'AIRTIME' || activeService === 'ELECTRICITY') && (
                <div className="col-span-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Amount (₦)</label>
                  <input 
                    type="number" name="amount" required value={formData.amount} onChange={handleInputChange}
                    className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-mono focus:border-blue-500 outline-none" 
                  />
                </div>
              )}

              {activeService === 'CABLE' && (
                <div className="col-span-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">IUC / SmartCard Number</label>
                  <input 
                    type="text" name="iucNum" required value={formData.iucNum} onChange={handleInputChange}
                    className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-mono focus:border-blue-500 outline-none" 
                  />
                </div>
              )}

              {activeService === 'ELECTRICITY' && (
                <>
                  <div className="col-span-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Meter Number</label>
                    <input 
                      type="text" name="meterNum" required value={formData.meterNum} onChange={handleInputChange}
                      className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-mono focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Meter Type</label>
                    <select 
                      name="meterType" value={formData.meterType} onChange={handleInputChange}
                      className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-bold outline-none"
                    >
                      <option value="1">Prepaid</option>
                      <option value="2">Postpaid</option>
                    </select>
                  </div>
                </>
              )}

              {activeService === 'EDUCATION' && (
                <div className="col-span-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Quantity</label>
                  <input 
                    type="number" name="quantity" required value={formData.quantity} onChange={handleInputChange} min="1"
                    className="w-full bg-black border border-slate-800 rounded-xl px-5 py-4 text-white font-mono focus:border-blue-500 outline-none" 
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-200 text-black font-black py-5 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5 mr-3" /> PURCHASE NOW</>}
            </button>
          </form>
        </div>

        {/* Console / Response */}
        <div className="flex flex-col gap-6">
          <div className="bg-black border border-slate-800 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden shadow-2xl min-h-[400px]">
            <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                  <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Response Matrix
               </h3>
               {rawResponse && (
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${rawResponse.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    {rawResponse.status}
                 </div>
               )}
            </div>
            
            <div className="flex-1 p-8 overflow-auto font-mono text-xs no-scrollbar">
              {!rawResponse ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center">
                   <LayoutGrid className="w-16 h-16 mb-6 mx-auto opacity-10 animate-pulse" />
                   <p className="tracking-[0.8em] font-black uppercase text-[10px]">Awaiting Signal</p>
                </div>
              ) : (
                <pre className={`leading-relaxed ${rawResponse.status === 'success' ? 'text-blue-400' : 'text-rose-400'}`}>
                   {JSON.stringify(rawResponse, null, 2)}
                </pre>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
             <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Protocol Instructions</h4>
             </div>
             <p className="text-slate-500 text-xs leading-relaxed">
               Every command sent through this terminal is a live financial transaction. 
               The <b>ServiceID</b> must match the exact value provided in your Inlomax price list. 
               Check the Response Matrix for real-time validation tokens and reference codes.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};