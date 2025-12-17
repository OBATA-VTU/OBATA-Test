import React, { useState } from 'react';
import { 
  Send, Activity, Globe, Database, Terminal, 
  ShieldCheck, RefreshCw, Trash2, Plus, 
  Code, Clock, Server, Layers, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HeaderPair {
  key: string;
  value: string;
}

export const BridgeTester: React.FC = () => {
  const [url, setUrl] = useState('https://api.paystack.co/bank');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [headers, setHeaders] = useState<HeaderPair[]>([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('{}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = val;
    setHeaders(newHeaders);
  };

  const handleTest = async () => {
    if (!url) return toast.error("Gateway URI Required");
    
    setIsLoading(true);
    setResponse(null);
    const startTime = performance.now();
    
    try {
      const headerObj: Record<string, string> = {};
      headers.forEach(h => { if(h.key) headerObj[h.key] = h.value; });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (method !== 'GET' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => "Response received is not JSON formatted.");
      
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data
      });
      
      if (res.ok) toast.success("Bridge Response: OK");
      else toast.error(`Bridge Fault: ${res.status}`);
    } catch (e: any) {
      setResponse({ error: e.message });
      toast.error("Transmission Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">BRIDGE_<span className="text-blue-500">TESTER</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">API Connectivity & Latency Lab</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-slate-300 font-mono">{latency ? `${latency}ms` : '-- ms'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request Config */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Layers className="w-64 h-64 text-blue-500" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Method</label>
                  <select 
                    value={method} 
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none focus:border-blue-500 appearance-none shadow-inner"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Target URI</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    <input 
                      type="text" 
                      value={url} 
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://api.example.com/v1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-mono text-sm focus:border-blue-500 outline-none shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Uplink Headers</label>
                  <button onClick={addHeader} className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
                    <Plus className="w-3 h-3" /> Add Header
                  </button>
                </div>
                <div className="space-y-3">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <input 
                        type="text" value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header Key"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-white font-mono focus:border-blue-500 outline-none"
                      />
                      <input 
                        type="text" value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Value"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-white font-mono focus:border-blue-500 outline-none"
                      />
                      <button onClick={() => removeHeader(i)} className="p-3 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {method !== 'GET' && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Payload Architecture (RAW)</label>
                  <textarea 
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    className="w-full h-48 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-emerald-500 font-mono text-xs focus:border-blue-500 outline-none resize-none no-scrollbar shadow-inner"
                    spellCheck={false}
                  />
                </div>
              )}

              <button 
                onClick={handleTest}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5 mr-4" /> DISPATCH SIGNAL</>}
              </button>
            </div>
          </div>
        </div>

        {/* Response Data */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-black border border-slate-800 rounded-[3rem] overflow-hidden flex-1 flex flex-col h-[650px] shadow-2xl relative group">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Database className="w-40 h-40 text-emerald-500" />
            </div>
            <div className="p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/50 relative z-10">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center">
                <Terminal className="w-4 h-4 mr-3 text-emerald-500" /> Downlink Trace
              </h3>
              {response && (
                <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${response.status < 300 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  {response.status || 'ERROR'}
                </span>
              )}
            </div>
            
            <div className="flex-1 p-8 overflow-auto font-mono text-[11px] no-scrollbar custom-scroll relative z-10">
              {!response ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center space-y-6">
                  <Activity className="w-20 h-20 opacity-10 animate-pulse" />
                  <p className="tracking-[0.8em] font-black uppercase text-[9px]">Awaiting Signal...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Response Headers</p>
                    <pre className="text-slate-500 bg-slate-950/50 p-4 rounded-2xl border border-slate-900 leading-relaxed overflow-x-auto">
                      {JSON.stringify(response.headers, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Response Body</p>
                    <pre className={`leading-relaxed whitespace-pre-wrap ${!response.error ? 'text-blue-400' : 'text-rose-400'}`}>
                      {JSON.stringify(response.data || response.error, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Handshake Integrity</h4>
              </div>
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter italic opacity-60">
                Connection established via direct node uplink. Protocol encryption verified. Data packets are routed through secure production proxy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};