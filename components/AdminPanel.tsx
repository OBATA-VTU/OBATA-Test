import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, runTransaction, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CheckCircle, XCircle, Clock, ExternalLink, Loader2, Search, AlertCircle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
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

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', txn.userId);
        const txnRef = doc(db, 'transactions', txn.id);

        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User does not exist!";

        const newBalance = (userDoc.data().walletBalance || 0) + Number(txn.amount);

        transaction.update(userRef, { 
            walletBalance: newBalance,
            hasFunded: true
        });
        transaction.update(txnRef, { status: 'SUCCESS' });
      });
      alert("Transaction Approved & Wallet Funded!");
      fetchRequests();
    } catch (e: any) {
      alert("Error approving: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (txnId: string) => {
    if (!confirm("Reject this funding request?")) return;
    setProcessingId(txnId);
    try {
      await runTransaction(db, async (transaction) => {
        const txnRef = doc(db, 'transactions', txnId);
        transaction.update(txnRef, { status: 'FAILED' });
      });
      alert("Transaction Declined.");
      fetchRequests();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400">Manage manual deposit requests</p>
        </div>
        <button onClick={fetchRequests} className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 text-white">
            Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
         <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-white">Pending Funding Requests</h2>
            <span className="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded-full">{requests.length}</span>
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
                                        {processingId === txn.id ? '...' : 'Approve'}
                                    </button>
                                    <button 
                                        onClick={() => handleDecline(txn.id)}
                                        disabled={processingId === txn.id}
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                                    >
                                        Decline
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
         )}
      </div>
    </div>
  );
};