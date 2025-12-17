import React, { useState, useEffect } from 'react';
import { 
  Terminal, Send, RefreshCw, Globe, Bug, Activity, 
  Binary, Database, UserCheck, Trash2, ShieldAlert,
  Zap, ShieldCheck, AlertTriangle, Radio, Server,
  Cpu, Network, Wifi, Key, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ApiTester: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST'>('POST');
  const [url, setUrl] = useState('/api/terminal/balance');
  const [body, setBody] = useState('{\n  "serviceID": "mtn",\n  "amount": 100,\n  "mobileNumber": "08012345678"\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const [health, setHealth] = useState({
    inlomax: 'IDLE', // IDLE, CHECKING, OK, FAIL
    paystack: 'IDLE',
    firestore: 'IDLE'
  });

  const pushDebug = (msg: string) => {
    setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  };

  const runNakedTest = async () => {
    setIsLoading(true);
    setResponse(null);
    pushDebug(`Dispatching signal to ${url}...`);
    try {
      const options: RequestInit = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };
      
      if (method === 'POST' && body.trim() !== '') {
        try {
            options.body = JSON.stringify(JSON.parse(body));
        } catch (e) {
            pushDebug("Logic Error: Invalid JSON Payload");
            toast.error("JSON Syntax Error");
            setIsLoading(false);
            return;
        }
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({ error: "Raw response is not JSON" }));
      
      setResponse({ success: res.ok, status: res.status, data });
      
      if (res.ok) {
        pushDebug(`Uplink Confirmed: STATUS_${res.status}`);
        toast.success("Command Acknowledged");
      } else {
        pushDebug(`Uplink Rejected: STATUS_${res.status}`);
        toast.error(`Bridge Fault ${res.status}`);
      }
    } catch (e: any) {
      setResponse({ success: false, error: e.message });
      pushDebug(`Critical Failure: ${e.message}`);
      toast.error("Network Partition Detected");
    } finally {
      setIsLoading(false);
    }
  };

  const runSmartDiagnostic = async () => {
    setIsLoading(true);
    pushDebug("Initializing Smart Connectivity Sequence...");
    
    // 1. Inlomax Check
    setHealth(h => ({ ...h, inlomax: 'CHECKING' }));
    try {
      const res = await fetch('/api/terminal/balance');
      const data = await res.json();
      if (data.status === 'success' || data.funds !== undefined) {
        setHealth(h => ({ ...h, inlomax: 'OK' }));
        pushDebug("INLOMAX_NODE: Operational (Balance Sync OK)");
      } else {
        setHealth(h => ({ ...h, inlomax: 'FAIL' }));
        pushDebug("INLOMAX_NODE: Error (Key/Bridge Mismatch)");
      }
    } catch { 
      setHealth(h => ({ ...h, inlomax: 'FAIL' }));
      pushDebug("INLOMAX_NODE: Network Timeout");
    }

    // 2. Paystack Check
    setHealth(h => ({ ...h, paystack: 'CHECKING' }));
    try {
      const res = await fetch('/api/terminal/banks');
      const data = await res.json();
      if (data.status === 'success' || Array.isArray(data.data)) {
        setHealth(h => ({ ...h, paystack: 'OK' }));
        pushDebug("PAYSTACK_NODE: Operational (Bank Registry Reachable)");
      } else {
        setHealth(h => ({ ...h, paystack: 'FAIL' }));
        pushDebug("PAYSTACK_NODE: Handshake Denied");
      }
    } catch {
      setHealth(h => ({ ...h, paystack: 'FAIL' }));
      pushDebug("PAYSTACK_NODE: Offline");
    }

    setIsLoading(false);
    toast.success("Diagnostic Complete");
  };

  const HealthBadge = ({ label, status, icon: Icon }: any) => {
    const isOk = status === 'OK';
    const isChecking = status === 'CHECKING';
    const isFail = status === 'FAIL';
    
    return (
      <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isOk ? 'bg-emerald-500/5 border-emerald-500/20' : isFail ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isOk ? 'bg-emerald-500/10 text-emerald-500' : isFail ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-500'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className={`text-xs font-black uppercase tracking-widest mt-0.5 ${isOk ? 'text-emerald-400' : isFail ? 'text-rose-400' : 'text-slate-600'}`}>
              {isChecking ? 'Syncing...' : status}
            </p>
          </div>
        </div>
        {isOk && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        {isFail && <XCircle className="w-5 h-5 text-rose-500" />}
        {isChecking && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-900 pb-10">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Connectivity <span className="text-blue-500">Lab</span></h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] ml-1.5">Smart Infrastructure Diagnostic</p>
        </div>
        
        <button 
            onClick={runSmartDiagnostic}
            disabled={isLoading}
            className="group relative flex items-center bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[2rem] transition-all active:scale-95 text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center">
                {isLoading ? <RefreshCw className="w-4 h-4 mr-3 animate-spin" /> : <Zap className="w-4 h-4 mr-3 fill-current" />}
                Full System Diagnostic
            </span>
        </button>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthBadge label="Inlomax Node" status={health.inlomax} icon={Radio} />
        <HealthBadge label="Paystack Node" status={health.paystack} icon={Network} />
        <HealthBadge label="API Proxy" status="OK" icon={Server} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Terminal Matrix */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Binary className="w-64 h-64 text-blue-500" />
            </div>
            
            <div className="relative z-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Verb</label>
                        <select 
                            value={method} 
                            onChange={(e: any) => setMethod(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer"
                        >
                            <option value="GET">GET_UPLINK</option>
                            <option value="POST">POST_COMMAND</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Gateway URI</label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                            <input 
                                type="text" 
                                value={url} 
                                onChange={e => setUrl(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-mono text-sm focus:border-blue-500 outline-none shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Payload Architecture (JSON)</label>
                        <button onClick={() => setBody('')} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <textarea 
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        className="w-full h-80 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-blue-400 font-mono text-xs focus:border-blue-500 outline-none resize-none no-scrollbar shadow-inner"
                        spellCheck={false}
                    />
                </div>

                <button 
                    onClick={runNakedTest}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-200 text-black font-black py-7 rounded-[2rem] flex items-center justify-center transition-all group disabled:opacity-50 shadow-2xl active:scale-[0.98]"
                >
                    {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5 mr-4" /> TRANSMIT SIGNAL</>}
                </button>
            </div>
        </div>

        {/* Status & Output */}
        <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-black border border-slate-800 rounded-[3rem] overflow-hidden flex-1 flex flex-col h-[500px] shadow-2xl relative group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Database className="w-40 h-40 text-emerald-500" />
                </div>
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50 relative z-10">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Trace Output
                    </h3>
                    {response && (
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${response.status < 300 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                            {response.status}
                        </span>
                    )}
                </div>
                
                <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar custom-scroll relative z-10">
                    {!response ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center space-y-6">
                            <Binary className="w-20 h-20 opacity-10 animate-pulse" />
                            <p className="tracking-[0.8em] font-black uppercase text-[9px]">Listening...</p>
                        </div>
                    ) : (
                        <pre className={`leading-relaxed whitespace-pre-wrap ${response.success ? 'text-blue-400' : 'text-rose-400'}`}>
                            {JSON.stringify(response.data || response, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 h-80 overflow-hidden shadow-xl">
                 <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6">
                    <Activity className="w-3 h-3 mr-3 text-blue-500" /> Telemetry Stream
                 </div>
                 <div className="space-y-3 overflow-y-auto h-full font-mono text-[10px] no-scrollbar custom-scroll">
                    {debugLog.length === 0 ? (
                        <p className="text-slate-800 italic animate-pulse">_ Awaiting node heartbeat...</p>
                    ) : (
                        debugLog.map((log, i) => (
                            <div key={i} className="flex gap-4 text-slate-400 border-l-2 border-slate-800 pl-4 py-1 hover:bg-slate-950/50 transition-colors">
                                <span className="text-blue-500/40 shrink-0 font-black">{log.substring(0, 10)}</span>
                                <span className="truncate">{log.substring(11)}</span>
                            </div>
                        ))
                    )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};