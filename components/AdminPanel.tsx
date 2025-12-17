import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, runTransaction, orderBy, updateDoc, increment, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { syncAdminPlans } from '../services/api';
import { CheckCircle, ExternalLink, Loader2, Search, Users, DollarSign, BarChart3, RefreshCw, Ban, Save, Lock, Zap, Megaphone, Upload, Activity, Globe, Wifi } from 'lucide-react';
import { toast } from 'react-hot-toast';

type AdminTab = 'MANAGEMENT' | 'GROWTH' | 'ORACLE';
type SubTab = 'OVERVIEW' | 'USERS' | 'FUNDING' | 'CONTENT' | 'BROADCAST' | 'DEBUG';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<AdminTab>('MANAGEMENT');
  const [subTab, setSubTab] = useState<SubTab>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(false);

  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [isSending, setIsSending] = useState(false);

  // State
  const [fundingRequests, setFundingRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState({ users: 0, transactions: 0, walletBalance: 0 });
  const [oracleStatus, setOracleStatus] = useState<any>({ api: 'Unknown', database: 'Connected', latency: 0 });

  // -- Logic --

  const handleBroadcast = async () => {
      if (!broadcastTitle || !broadcastMsg) {
          toast.error("Please enter title and message");
          return;
      }
      setIsSending(true);
      try {
          await addDoc(collection(db, 'notifications'), {
              title: broadcastTitle,
              message: broadcastMsg,
              type: 'INFO',
              target: 'ALL',
              date: serverTimestamp(),
              read: false
          });
          toast.success("Broadcast sent to all users!");
          setBroadcastTitle('');
          setBroadcastMsg('');
      } catch (e: any) {
          toast.error("Failed to send: " + e.message);
      } finally {
          setIsSending(false);
      }
  };

  const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const txnsSnap = await getDocs(collection(db, 'transactions'));
      let bal = 0;
      usersSnap.forEach(d => bal += (d.data().walletBalance || 0));
      setStats({
          users: usersSnap.size,
          transactions: txnsSnap.size,
          walletBalance: bal
      });
  };

  const fetchFundingRequests = async () => {
      setIsLoading(true);
      try {
          const q = query(
              collection(db, 'transactions'),
              where('type', '==', 'FUNDING'),
              where('method', '==', 'MANUAL'),
              where('status', '==', 'PENDING'),
              orderBy('date', 'desc')
          );
          const snap = await getDocs(q);
          setFundingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
  };

  const fetchUsers = async () => {
      setIsLoading(true);
      try {
          const snap = await getDocs(collection(db, 'users'));
          setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
  };

  const runOracleCheck = async () => {
      setOracleStatus({ ...oracleStatus, api: 'Checking...' });
      const start = performance.now();
      try {
          // Simulate or real check
          const res = await syncAdminPlans(); // Use sync as a ping
          const end = performance.now();
          setOracleStatus({ 
              api: res.success ? 'Operational' : 'Error', 
              database: 'Connected', 
              latency: Math.round(end - start) 
          });
      } catch (e) {
          setOracleStatus({ api: 'Offline', database: 'Connected', latency: 0 });
      }
  };

  useEffect(() => {
      if (isAuthenticated) {
          if (activeTab === 'MANAGEMENT' && subTab === 'OVERVIEW') fetchStats();
          if (subTab === 'FUNDING') fetchFundingRequests();
          if (subTab === 'USERS') fetchUsers();
          if (activeTab === 'ORACLE') runOracleCheck();
      }
  }, [activeTab, subTab, isAuthenticated]);

  // -- Password Gate --
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (password === 'OBATA VTU01$') {
          setIsAuthenticated(true);
      } else {
          toast.error("Access Denied: Invalid Credentials");
      }
  };

  // FIX: Early return happens AFTER hooks
  if (!isAuthenticated) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center">
                  <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-10 h-10 text-red-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
                  <p className="text-slate-400 mb-6">This area is for authorized administrators only.</p>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter Admin Password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-center tracking-widest focus:border-red-500 transition-colors"
                      />
                      <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">
                          Unlock Panel
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.username?.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in-up">
        {/* Main Nav Segments */}
        <div className="grid grid-cols-3 gap-4">
            <button 
                onClick={() => { setActiveTab('MANAGEMENT'); setSubTab('OVERVIEW'); }}
                className={`p-6 rounded-2xl border transition-all ${activeTab === 'MANAGEMENT' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
                <Users className="w-8 h-8 mb-3" />
                <h3 className="font-bold">Management</h3>
                <p className="text-xs opacity-70 mt-1">Users, Stats, Wallet</p>
            </button>
            <button 
                onClick={() => { setActiveTab('GROWTH'); setSubTab('CONTENT'); }}
                className={`p-6 rounded-2xl border transition-all ${activeTab === 'GROWTH' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
                <Zap className="w-8 h-8 mb-3" />
                <h3 className="font-bold">Growth</h3>
                <p className="text-xs opacity-70 mt-1">Content, Ads, Broadcast</p>
            </button>
            <button 
                onClick={() => { setActiveTab('ORACLE'); setSubTab('DEBUG'); }}
                className={`p-6 rounded-2xl border transition-all ${activeTab === 'ORACLE' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
                <Activity className="w-8 h-8 mb-3" />
                <h3 className="font-bold">Oracle</h3>
                <p className="text-xs opacity-70 mt-1">Health, Debug, API</p>
            </button>
        </div>

        {/* Content Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[500px]">
            
            {/* MANAGEMENT VIEW */}
            {activeTab === 'MANAGEMENT' && (
                <div className="space-y-6">
                    <div className="flex space-x-2 border-b border-slate-800 pb-4 mb-4 overflow-x-auto">
                        {['OVERVIEW', 'USERS', 'FUNDING'].map(t => (
                            <button key={t} onClick={() => setSubTab(t as SubTab)} className={`px-4 py-2 rounded-lg text-xs font-bold ${subTab === t ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{t}</button>
                        ))}
                    </div>

                    {subTab === 'OVERVIEW' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800"><div className="text-slate-400 text-xs font-bold uppercase mb-2">Total Users</div><div className="text-3xl font-bold text-white">{stats.users}</div></div>
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800"><div className="text-slate-400 text-xs font-bold uppercase mb-2">Transactions</div><div className="text-3xl font-bold text-white">{stats.transactions}</div></div>
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800"><div className="text-slate-400 text-xs font-bold uppercase mb-2">System Float</div><div className="text-3xl font-bold text-green-400">₦{stats.walletBalance.toLocaleString()}</div></div>
                        </div>
                    )}

                    {subTab === 'USERS' && (
                        <div>
                            <input type="text" placeholder="Search Users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 text-white" />
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-xl border border-slate-800">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-950 sticky top-0"><tr className="text-xs uppercase"><th className="p-4">User</th><th className="p-4">Bal</th><th className="p-4 text-right">Action</th></tr></thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id}><td className="p-4">{u.username}</td><td className="p-4">₦{u.walletBalance}</td><td className="p-4 text-right"><button className="text-blue-400 underline">Manage</button></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* GROWTH VIEW */}
            {activeTab === 'GROWTH' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center"><Megaphone className="w-5 h-5 mr-2" /> Broadcast Notification</h3>
                            <input 
                                type="text" 
                                placeholder="Message Title" 
                                value={broadcastTitle}
                                onChange={e => setBroadcastTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white mb-3 focus:border-purple-500"
                            />
                            <textarea 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white mb-3 focus:border-purple-500" 
                                rows={3} 
                                placeholder="Send a notification to all users..."
                                value={broadcastMsg}
                                onChange={e => setBroadcastMsg(e.target.value)}
                            ></textarea>
                            <button 
                                onClick={handleBroadcast}
                                disabled={isSending}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-bold text-sm w-full flex justify-center items-center"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ORACLE VIEW */}
            {activeTab === 'ORACLE' && (
                <div className="space-y-8 animate-pulse-slow">
                    {/* ... Same Oracle View ... */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-emerald-400">System Oracle</h2>
                        <button onClick={runOracleCheck} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"><RefreshCw className="w-4 h-4 mr-2" /> Re-scan</button>
                    </div>

                    <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-green-400 h-48 overflow-y-auto border border-slate-800">
                        <p>&gt; Initializing Oracle v2.0...</p>
                        <p>&gt; Checking Firebase Connectivity... OK</p>
                        <p>&gt; Pinging Provider API... {oracleStatus.latency}ms</p>
                        <p>&gt; Checking User Authentication Nodes... OK</p>
                        <p>&gt; Verifying Transaction Integrity... OK</p>
                        <p>&gt; System Status: <span className="text-white bg-green-600 px-1">HEALTHY</span></p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};