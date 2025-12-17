import React, { useState } from 'react';
import { 
  Terminal, Send, RefreshCw, Globe, Code, ShieldCheck, 
  AlertTriangle, Clock, Layers, ChevronRight, Trash2, 
  Activity, Cpu, Braces, Binary, Lock, Zap
} from 'lucide-react';
import { executeApiRequest } from '../services/api';
import { toast } from 'react-hot-toast';

const ADMIN_SESSION_KEY = 'OBATA_ADMIN_AUTH';

export const ApiTester: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [adminPass, setAdminPass] = useState('');
  
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [url, setUrl] = useState('/api/vtu/airtime');
  const [body, setBody] = useState('{\n  "network": "1",\n  "amount": "100",\n  "mobile_number": "08012345678",\n  "request_id": "TEST_LINK_CHECK"\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'OBATA VTU01$') {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        toast.success("Identity Verified");
    } else {
        toast.error("Handshake Rejected");
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const parsedBody = method !== 'GET' ? JSON.parse(body) : undefined;
      const res = await executeApiRequest({
        url: url,
        method: method,
        body: parsedBody ? JSON.stringify(parsedBody) : undefined,
      });
      setResponse(res);
      if (res.success) {
        toast.success("External Bridge Handshake Success");
      } else {
        toast.error("Handshake Failed: Link Refused");
      }
    } catch (e: any) {
      setResponse({ success: false, error: e.message || "Invalid Transmission Syntax" });
      toast.error("Payload Construction Error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-14 rounded-[3.5rem] w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
          <div className="bg-blue-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-12 border border-blue-500/20 rotate-3">
            <Lock className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Secure Lab</h1>
          <p className="text-slate-500 mb-12 font-black text-[10px] uppercase tracking-[0.4em]">Restricted diagnostic Access</p>
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <input 
              type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="ROOT_KEY"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 text-white text-center tracking-[1em] focus:border-blue-500 outline-none transition-all font-mono text-xl"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase tracking-widest text-xs">
                Decrypt Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-32 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter">Connection Lab</h1>
          <div className="flex items-center text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">
            <Activity className="w-3.5 h-3.5 mr-2" />
            <span>Infrastructure Connectivity Verification Environment</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-[1.8rem] shadow-xl">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oracle Proxy Authenticated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Transmission Controller */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-64 h-64 text-blue-500" />
          </div>
          
          <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 relative z-10">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center">
              <Layers className="w-5 h-5 mr-3 text-blue-500" /> Request Configuration
            </h3>
            <button onClick={() => setBody('')} className="bg-slate-800 p-3 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
                <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-10 space-y-8 relative z-10">
            <div className="grid grid-cols-4 gap-5">
              <div className="col-span-1">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-2">Verb</label>
                <select 
                  value={method} 
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-white font-black text-xs outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none text-center"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-2">API Endpoint URI</label>
                <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    <input 
                    type="text" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)}
                    placeholder="/api/handshake"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white font-mono text-sm focus:border-blue-500 outline-none transition-all font-bold"
                    />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-2">JSON Transmission Data</label>
              <div className="relative group">
                <div className="absolute top-6 left-6 text-blue-500/20 group-focus-within:text-blue-500/40 transition-colors pointer-events-none">
                    <Braces className="w-8 h-8" />
                </div>
                <textarea 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full h-[28rem] bg-black border border-slate-800 rounded-[2.5rem] p-12 pt-16 text-emerald-500 font-mono text-xs focus:border-blue-500 outline-none resize-none no-scrollbar shadow-inner leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>

            <button 
              onClick={handleTest}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all group disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-4 group-hover:translate-x-2 transition-transform" />
                  INITIATE CONNECTION TEST
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnostic Output */}
        <div className="bg-black border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col relative">
          <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center">
              <Terminal className="w-5 h-5 mr-3 text-emerald-500" /> Handshake Console
            </h3>
            {response && (
                <div className="flex space-x-6">
                    <div className="text-right">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5 block">Ping</span>
                        <div className="flex items-center text-[12px] font-black text-slate-400 font-mono">
                            {response.duration}ms
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5 block">Signal</span>
                        <div className={`text-[12px] font-black ${response.status < 300 ? 'text-emerald-500' : 'text-rose-500'} font-mono`}>
                            {response.status || 'OFFLINE'}
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          <div className="flex-1 p-12 overflow-auto font-mono text-[11px] no-scrollbar custom-scroll bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
            {!response ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-8">
                    <div className="w-32 h-32 border-4 border-dashed border-slate-900 rounded-full flex items-center justify-center animate-spin-slow">
                        <Cpu className="w-12 h-12 opacity-10" />
                    </div>
                    <div className="text-center">
                        <p className="tracking-[0.5em] uppercase font-black text-[10px] text-slate-700">Infrastructure Standby</p>
                        <p className="text-[9px] text-slate-800 mt-2 font-black">AWAITING CONNECTION PULSE...</p>
                    </div>
                </div>
            ) : (
                <pre className={`leading-relaxed ${response.success ? 'text-emerald-500/80' : 'text-rose-500/80'} animate-fade-in`}>
                  {JSON.stringify(response.data || response, null, 2)}
                </pre>
            )}
          </div>

          {response && !response.success && (
              <div className="m-10 p-10 bg-rose-500/5 border border-rose-500/10 rounded-[3rem] animate-fade-in-up">
                  <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center mb-4">
                      <AlertTriangle className="w-4 h-4 mr-3" /> System Diagnostics
                  </p>
                  <p className="text-white text-xs leading-relaxed opacity-60 font-medium">
                      Signal dropped by external cluster. Common factors: invalid API authorization tokens, strictly enforced CORS headers on the remote server, or malformed request structure for the specified endpoint.
                  </p>
              </div>
          )}

          <div className="p-10 border-t border-slate-900 bg-slate-950/40 flex justify-between items-center text-[10px] font-black text-slate-600 tracking-widest uppercase">
              <div className="flex items-center space-x-6">
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> HANDSHAKE_READY</div>
                  <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> ENCRYPTION_ACTIVE</div>
              </div>
              <span className="opacity-40">ORACLE ENGINE v9.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};