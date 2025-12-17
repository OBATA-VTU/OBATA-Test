import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, runTransaction, orderBy, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { syncAdminPlans } from '../services/api';
import { CheckCircle, XCircle, Clock, ExternalLink, Loader2, Search, Users, DollarSign, BarChart3, RefreshCw, Ban, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

type AdminTab = 'OVERVIEW' | 'USERS' | 'SERVICES' | 'FUNDING' | 'CONTENT';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(false);

  // State
  const [fundingRequests, setFundingRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState({ users: 0, transactions: 0, walletBalance: 0 });
  const [siteContent, setSiteContent] = useState<any>({ bannerUrl: '', announcement: '' });

  // -- Fetchers --

  const fetchStats = async () => {
      // In a real app, call backend /admin/stats. Here we query Firestore directly as Admin
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

  const fetchContent = async () => {
      try {
          const docSnap = await getDoc(doc(db, 'site_content', 'main'));
          if (docSnap.exists()) setSiteContent(docSnap.data());
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
      if (activeTab === 'OVERVIEW') fetchStats();
      if (activeTab === 'FUNDING') fetchFundingRequests();
      if (activeTab === 'USERS') fetchUsers();
      if (activeTab === 'CONTENT') fetchContent();
  }, [activeTab]);

  // -- Actions --

  const handleApproveFunding = async (txn: any) => {
      if (!confirm(`Approve ₦${txn.amount} for ${txn.userEmail}?`)) return;
      try {
          await runTransaction(db, async (t) => {
              const userRef = doc(db, 'users', txn.userId);
              const txnRef = doc(db, 'transactions', txn.id);
              
              const userDoc = await t.get(userRef);
              if (!userDoc.exists()) throw "User not found";

              t.update(userRef, { 
                  walletBalance: increment(txn.amount),
                  hasFunded: true
              });
              t.update(txnRef, { status: 'SUCCESS' });
          });
          toast.success("Funding Approved");
          fetchFundingRequests();
      } catch (e: any) { toast.error(e.message); }
  };

  const handleBanUser = async (userId: string, currentStatus: boolean) => {
      if (!confirm(`${currentStatus ? 'Unban' : 'Ban'} this user?`)) return;
      try {
          await updateDoc(doc(db, 'users', userId), { banned: !currentStatus });
          toast.success(`User ${currentStatus ? 'Unbanned' : 'Banned'}`);
          fetchUsers();
      } catch (e: any) { toast.error(e.message); }
  };

  const handleCreditUser = async (userId: string) => {
      const amount = prompt("Enter amount to credit:");
      if (!amount) return;
      try {
          await updateDoc(doc(db, 'users', userId), { walletBalance: increment(parseFloat(amount)) });
          toast.success("User Credited");
          fetchUsers();
      } catch (e: any) { toast.error(e.message); }
  };

  const handleSyncPlans = async () => {
      setIsLoading(true);
      try {
          const res = await syncAdminPlans();
          if (res.success) toast.success("Plans Synced Successfully");
          else toast.error("Sync Failed");
      } catch (e) { toast.error("Sync Error"); }
      finally { setIsLoading(false); }
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await updateDoc(doc(db, 'site_content', 'main'), siteContent);
          toast.success("Content Updated");
      } catch (e: any) { toast.error(e.message); }
  };

  const filteredUsers = users.filter(u => 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.username?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex space-x-1">
            {['OVERVIEW', 'USERS', 'SERVICES', 'FUNDING', 'CONTENT'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as AdminTab)}
                    className={`px-4 py-2 rounded-md text-xs font-bold ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2"><Users className="text-blue-500" /> <span className="text-slate-400 font-bold text-xs uppercase">Total Users</span></div>
                  <p className="text-3xl font-bold text-white">{stats.users.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2"><BarChart3 className="text-purple-500" /> <span className="text-slate-400 font-bold text-xs uppercase">Total Txns</span></div>
                  <p className="text-3xl font-bold text-white">{stats.transactions.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2"><DollarSign className="text-green-500" /> <span className="text-slate-400 font-bold text-xs uppercase">System Float</span></div>
                  <p className="text-3xl font-bold text-white">₦{stats.walletBalance.toLocaleString()}</p>
              </div>
          </div>
      )}

      {activeTab === 'USERS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex gap-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white" 
                      />
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-950 text-xs uppercase font-bold">
                          <tr>
                              <th className="p-4">User</th>
                              <th className="p-4">Balance</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {isLoading ? <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr> :
                          filteredUsers.map(user => (
                              <tr key={user.id} className="hover:bg-slate-800/50">
                                  <td className="p-4">
                                      <p className="text-white font-bold">{user.username}</p>
                                      <p className="text-xs">{user.email}</p>
                                  </td>
                                  <td className="p-4 text-white">₦{user.walletBalance?.toLocaleString()}</td>
                                  <td className="p-4 capitalize">{user.role}</td>
                                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.banned ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{user.banned ? 'Banned' : 'Active'}</span></td>
                                  <td className="p-4 text-right space-x-2">
                                      <button onClick={() => handleCreditUser(user.id)} className="text-blue-400 hover:text-white text-xs font-bold border border-blue-500/30 px-2 py-1 rounded">Credit</button>
                                      <button onClick={() => handleBanUser(user.id, user.banned)} className="text-red-400 hover:text-white text-xs font-bold border border-red-500/30 px-2 py-1 rounded">{user.banned ? 'Unban' : 'Ban'}</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'FUNDING' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
               <div className="p-4 border-b border-slate-800 bg-slate-950">
                   <h3 className="font-bold text-white">Pending Manual Deposits</h3>
               </div>
               {isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></div> :
               fundingRequests.length === 0 ? <div className="p-8 text-center text-slate-500">No pending requests.</div> :
               <table className="w-full text-left text-sm text-slate-400">
                   <thead className="bg-slate-950 text-xs uppercase font-bold">
                       <tr>
                           <th className="p-4">Date</th>
                           <th className="p-4">User</th>
                           <th className="p-4">Amount</th>
                           <th className="p-4">Proof</th>
                           <th className="p-4 text-right">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                       {fundingRequests.map(req => (
                           <tr key={req.id}>
                               <td className="p-4">{req.date?.toDate().toLocaleString()}</td>
                               <td className="p-4 text-white">{req.userEmail}</td>
                               <td className="p-4 font-bold text-green-400">₦{req.amount}</td>
                               <td className="p-4">
                                   {req.proofUrl && <a href={req.proofUrl} target="_blank" className="text-blue-400 underline flex items-center"><ExternalLink className="w-3 h-3 mr-1"/> View</a>}
                               </td>
                               <td className="p-4 text-right">
                                   <button onClick={() => handleApproveFunding(req)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500">Approve</button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
               }
          </div>
      )}

      {activeTab === 'SERVICES' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Service Synchronization</h3>
              <p className="text-slate-400 mb-8">Fetch latest data plans and prices from the provider API and update the database.</p>
              <button 
                onClick={handleSyncPlans} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center mx-auto"
              >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />} Sync Plans Now
              </button>
          </div>
      )}

      {activeTab === 'CONTENT' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Site Content</h3>
              <form onSubmit={handleUpdateContent} className="space-y-4">
                  <div>
                      <label className="text-sm font-bold text-slate-400 block mb-2">Banner Image URL</label>
                      <input 
                        type="text" 
                        value={siteContent.bannerUrl}
                        onChange={e => setSiteContent({...siteContent, bannerUrl: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" 
                      />
                  </div>
                  <div>
                      <label className="text-sm font-bold text-slate-400 block mb-2">Announcement Text</label>
                      <textarea 
                        rows={4}
                        value={siteContent.announcement}
                        onChange={e => setSiteContent({...siteContent, announcement: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" 
                      />
                  </div>
                  <button type="submit" className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl flex items-center hover:bg-purple-500">
                      <Save className="w-4 h-4 mr-2" /> Save Content
                  </button>
              </form>
          </div>
      )}
    </div>
  );
};