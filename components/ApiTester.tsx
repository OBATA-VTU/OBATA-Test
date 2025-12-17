import React, { useState } from 'react';
import { 
  Terminal, Send, RefreshCw, Globe, Bug, Activity, 
  Binary, Database, UserCheck, Trash2, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ApiTester: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST'>('POST');
  const [url, setUrl] = useState('/api/vtu/airtime');
  const [body, setBody] = useState('{\n  "network": "1",\n  "amount": "100",\n  "mobile_number": "08012345678",\n  "request_id": "TEST_LINK_CHECK"\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const pushDebug = (msg: string) => {
    setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  };

  const runNakedTest = async () => {
    setIsLoading(true);
    setResponse(null);
    pushDebug(`Initiating transmission to ${url}...`);
    try {
      const options: RequestInit = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };
      
      if (method === 'POST' && body.trim() !== '') {
        try {
            options.body = JSON.stringify(JSON.parse(body));
        } catch (e) {
            pushDebug("Syntax Error: Invalid JSON Payload");
            toast.error("JSON Syntax Error");
            setIsLoading(false);
            return;
        }
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({ error: "Response was not JSON" }));
      
      setResponse({ success: res.ok, status: res.status, data });
      
      if (res.ok) {
        pushDebug(`Signal acknowledged: STATUS_${res.status}`);
        toast.success("Signal Acknowledged");
      } else {
        pushDebug(`Handshake refused: STATUS_${res.status}`);
        toast.error(`Bridge Error ${res.status}`);
      }
    } catch (e: any) {
      setResponse({ success: false, error: e.message });
      pushDebug(`Logic Break: ${e.message}`);
      toast.error("Transmission Error");
    } finally {
      setIsLoading(false);
    }
  };

  const testInlomaxLink = async () => {
      setIsLoading(true);
      setResponse(null);
      pushDebug("Contacting Inlomax bridge for telemetry...");
      try {
          const res = await fetch('/api/admin/inlomax-balance');
          const data = await res.json().catch(() => ({ error: "Inlomax returned invalid response" }));
          
          setResponse({ success: res.ok, status: res.status, data });
          
          if (res.ok && data.success) {
              pushDebug("INLOMAX_CORE: LINK ESTABLISHED. Key Verified.");
              toast.success("Connection Verified");
          } else {
              const reason = data.error || data.message || "Unknown Rejection";
              pushDebug(`INLOMAX_CORE: REJECTED. Reason: ${reason}`);
              toast.error("Verification Refused");
          }
      } catch (e: any) {
          pushDebug(`BRIDGE_CRASH: ${e.message}`);
          toast.error("Bridge Down");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <h1 className="text-4xl font-black text-white tracking-tighter">CONNECTION_LAB_v1.1</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] ml-11">Naked Gateway Testing</p>
        </div>
        
        <button 
            onClick={testInlomaxLink}
            disabled={isLoading}
            className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl transition-all active:scale-95 text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 disabled:opacity-50"
        >
            {isLoading ? <RefreshCw className="w-4 h-4 mr-3 animate-spin" /> : <UserCheck className="w-4 h-4 mr-3" />}
            Verify Inlomax Core
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Transmission Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
              <Database className="w-4 h-4 mr-3 text-blue-500" /> Input Matrix
            </h3>
            <button onClick={() => setBody('')} className="p-2 text-slate-600 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3 block">Method</label>
                <select 
                  value={method} 
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white font-black text-xs outline-none focus:border-blue-500 transition-all appearance-none text-center cursor-pointer"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3 block">Endpoint URI</label>
                <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    <input 
                      type="text" 
                      value={url} 
                      onChange={e => setUrl(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-xl pl-12 pr-6 py-3 text-white font-mono text-sm focus:border-blue-500 outline-none"
                    />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3 block">JSON Payload</label>
              <textarea 
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full h-64 bg-black border border-slate-800 rounded-2xl p-8 text-blue-400 font-mono text-xs focus:border-blue-500 outline-none resize-none no-scrollbar"
                spellCheck={false}
              />
            </div>

            <button 
              onClick={runNakedTest}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-200 text-black font-black py-5 rounded-2xl flex items-center justify-center transition-all group disabled:opacity-50 shadow-xl"
            >
              {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Send className="w-4 h-4 mr-3" /> INITIATE COMMAND</>}
            </button>
          </div>
        </div>

        {/* Output & Logs */}
        <div className="flex flex-col gap-6">
            <div className="bg-black border border-slate-800 rounded-[3rem] overflow-hidden flex-1 flex flex-col min-h-[400px] shadow-2xl">
                <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                        <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Raw Response
                    </h3>
                    {response && (
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${response.status < 300 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            STATUS_{response.status}
                        </span>
                    )}
                </div>
                
                <div className="flex-1 p-8 overflow-auto font-mono text-xs no-scrollbar">
                    {!response ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center">
                            <Binary className="w-16 h-16 mb-6 mx-auto animate-pulse opacity-20" />
                            <p className="tracking-[0.8em] font-black uppercase text-[10px]">Awaiting Uplink</p>
                        </div>
                    ) : (
                        <pre className={`leading-relaxed ${response.success ? 'text-blue-400' : 'text-rose-400'}`}>
                            {JSON.stringify(response.data || response, null, 2)}
                        </pre>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 h-72 overflow-hidden shadow-xl">
                 <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">
                    <Activity className="w-3 h-3 mr-2" /> Live Telemetry
                 </div>
                 <div className="space-y-2 overflow-y-auto h-full font-mono text-[10px] no-scrollbar">
                    {debugLog.length === 0 ? (
                        <p className="text-slate-700 italic">No activity detected...</p>
                    ) : (
                        debugLog.map((log, i) => (
                            <div key={i} className="flex gap-3 text-slate-400 border-l-2 border-slate-800 pl-3">
                                <span className="text-blue-500/50 shrink-0 font-bold">{log.substring(0, 10)}</span>
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