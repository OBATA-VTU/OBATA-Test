import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TransactionTerminal } from './components/TransactionTerminal';
import { ApiTester } from './components/ApiTester';
import { BridgeTester } from './components/BridgeTester';
import { Globe, Terminal, Zap, ShieldCheck } from 'lucide-react';

const App = () => {
  const [activeView, setActiveView] = useState<'BRIDGE' | 'TERMINAL' | 'DEBUG'>('BRIDGE');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #1e293b',
            borderRadius: '1rem',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }} 
      />

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">OBATA <span className="text-blue-500">LABS</span></h1>
          </div>

          <nav className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setActiveView('BRIDGE')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeView === 'BRIDGE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Globe className="w-3.5 h-3.5" /> BRIDGE_TESTER
            </button>
            <button 
              onClick={() => setActiveView('TERMINAL')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeView === 'TERMINAL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Zap className="w-3.5 h-3.5" /> CORE_TERMINAL
            </button>
            <button 
              onClick={() => setActiveView('DEBUG')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeView === 'DEBUG' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Terminal className="w-3.5 h-3.5" /> DEBUG_CONSOLE
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Uplink Secure</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        {activeView === 'BRIDGE' && <BridgeTester />}
        {activeView === 'TERMINAL' && <TransactionTerminal />}
        {activeView === 'DEBUG' && <ApiTester />}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2024 OBATA AUTOMATION SYSTEMS // INTERNAL USE ONLY</p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-blue-500 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-500 transition-colors">API Keys</a>
          <a href="#" className="hover:text-blue-500 transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  );
};

export default App;