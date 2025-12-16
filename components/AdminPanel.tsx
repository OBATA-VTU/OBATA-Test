import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, runTransaction, orderBy } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../services/firebase';
import { CheckCircle, XCircle, Clock, ExternalLink, Loader2, Search, AlertCircle, BarChart3, Users, Settings, Tag, Gift, DollarSign } from 'lucide-react';

type AdminTab = 'OVERVIEW' | 'USERS' | 'TRANSACTIONS' | 'SERVICES' | 'TASKS' | 'SETTINGS';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);

    if (!isFirebaseInitialized) {
        setRequests([
            { id: 'mock-req-1', date: { toDate: () => new Date() }, userEmail: 'user@example.com', amount: 5000, reference: 'MAN-12345', proofUrl: '' }
        ]);
        setLoading(false);
        return;
    }

    try {
      const q = query(
        collection(db, 'transactions'),
        where('type', '==', 'FUNDING'),
        where('method', '==', 'MANUAL'),
        where('status', '==', 'PENDING'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (txn: any) => {
    if (!confirm(`Are you sure you want to approve ₦${txn.amount} for user?`)) return;
    setProcessingId(txn.id);

    if (!isFirebaseInitialized) {
        setTimeout(() => {
            alert("Transaction Approved! (Mock)");
            setProcessingId(null);
            setRequests(prev => prev.filter(r => r.id !== txn.id));
        }, 1000);
        return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', txn.userId);
        const txnRef = doc(db, 'transactions', txn.id);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User does not exist!";

        const newBalance = (userDoc.data().walletBalance || 0) + Number(txn.amount);
        transaction.update(userRef, { walletBalance: newBalance, hasFunded: true });
        transaction.update(txnRef, { status: 'SUCCESS' });
      });
      alert("Transaction Approved!");
      fetchRequests();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400">System Management</p>
        </div>
      </div>

      {/* Admin Nav */}
      <div className="flex overflow-x-auto space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800 mb-6">
          <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Overview</button>
          <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'USERS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>User Management</button>
          <button onClick={() => setActiveTab('TRANSACTIONS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'TRANSACTIONS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Transactions</button>
          <button onClick={() => setActiveTab('SERVICES')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'SERVICES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Services & Prices</button>
          <button onClick={() => setActiveTab('TASKS')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'TASKS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Coupons & Tasks</button>
      </div>

      {/* Overview Tab with pending requests */}
      {activeTab === 'OVERVIEW' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">10,420</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Total Wallet Balance</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">₦45.2M</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-amber-500" />
                        <h3 className="text-slate-400 text-sm font-bold uppercase">Transactions Today</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">1,250</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h2 className="font-bold text-white">Pending Funding Requests</h2>
                    </div>
                    <button onClick={fetchRequests} className="text-xs text-blue-400 hover:text-white">Refresh</button>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        Loading requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No pending manual funding requests.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 border-b border-slate-800">Date</th>
                                    <th className="p-4 border-b border-slate-800">User Email</th>
                                    <th className="p-4 border-b border-slate-800">Amount</th>
                                    <th className="p-4 border-b border-slate-800">Ref</th>
                                    <th className="p-4 border-b border-slate-800">Proof</th>
                                    <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {requests.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-slate-800/50">
                                        <td className="p-4 text-slate-400">{txn.date?.toDate().toLocaleString()}</td>
                                        <td className="p-4 text-white">{txn.userEmail || txn.userId}</td>
                                        <td className="p-4 font-bold text-green-400">₦{txn.amount}</td>
                                        <td className="p-4 font-mono text-xs text-slate-500">{txn.reference}</td>
                                        <td className="p-4">
                                            {txn.proofUrl ? (
                                                <a href={txn.proofUrl} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 hover:underline">
                                                    View Receipt <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-600">No Image</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleApprove(txn)}
                                                disabled={processingId === txn.id}
                                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
      )}

      {activeTab === 'USERS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
              <p>Search, Edit Balance, Delete Users.</p>
              <div className="mt-6 max-w-md mx-auto relative">
                  <input type="text" placeholder="Search by email or username..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white pl-10" />
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              </div>
          </div>
      )}

      {activeTab === 'SERVICES' && (
          <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Service Price Management</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">Service Name</th>
                                <th className="p-3">Provider ID</th>
                                <th className="p-3">Cost Price</th>
                                <th className="p-3">User Price</th>
                                <th className="p-3">Reseller Price</th>
                                <th className="p-3">API Price</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            <tr>
                                <td className="p-3">MTN 1GB SME</td>
                                <td className="p-3 font-mono">101</td>
                                <td className="p-3">₦210</td>
                                <td className="p-3"><input className="bg-slate-950 border border-slate-700 w-20 px-2 py-1 rounded" defaultValue="250" /></td>
                                <td className="p-3"><input className="bg-slate-950 border border-slate-700 w-20 px-2 py-1 rounded" defaultValue="215" /></td>
                                <td className="p-3"><input className="bg-slate-950 border border-slate-700 w-20 px-2 py-1 rounded" defaultValue="212" /></td>
                                <td className="p-3"><button className="text-blue-500 hover:text-white">Save</button></td>
                            </tr>
                            {/* More rows would be generated here */}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'TASKS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Coupon Generation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Coupon Code (e.g FLASH50)" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                  <input type="number" placeholder="Amount (₦)" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                  <input type="number" placeholder="Max Usage Limit" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                  <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg p-3">Create Coupon</button>
              </div>
          </div>
      )}

    </div>
  );
};