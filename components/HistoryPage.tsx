import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Download, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

export const HistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [indexErrorLink, setIndexErrorLink] = useState<string | null>(null);

  useEffect(() => {
      const fetchTransactions = async () => {
          if (!currentUser) return;
          try {
              // This Query requires a Composite Index in Firestore
              const q = query(
                  collection(db, 'transactions'),
                  where('userId', '==', currentUser.uid),
                  orderBy('date', 'desc'),
                  limit(20)
              );
              const snapshot = await getDocs(q);
              const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setTransactions(txns);
          } catch (error: any) {
              console.error("Error fetching history", error);
              
              // Handle Missing Index Error Specific to Firebase
              if (error.code === 'failed-precondition' && error.message.includes('index')) {
                  console.warn("MISSING INDEX: Click the link below to create it in Firebase Console:");
                  const match = error.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s]*/);
                  if (match) {
                      console.log(match[0]);
                      setIndexErrorLink(match[0]);
                  }
              }
              setTransactions([]);
          } finally {
              setIsLoading(false);
          }
      };
      fetchTransactions();
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fade-in-up">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          <div className="flex gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search ID..." className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-blue-500" />
             </div>
             <button className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white"><Filter className="w-5 h-5" /></button>
          </div>
       </div>
       
       {indexErrorLink && (
           <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex items-start space-x-3 text-amber-200 text-sm">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <div>
                   <p className="font-bold">System Maintenance Required</p>
                   <p className="mb-2">The transaction history index is being built. If you are the developer, <a href={indexErrorLink} target="_blank" rel="noreferrer" className="underline text-amber-400 font-bold">click here</a> to create the index.</p>
                   <p className="text-xs opacity-70">If you are a user, please check back in 5 minutes.</p>
               </div>
           </div>
       )}

       <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[300px]">
          {isLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading records...
              </div>
          ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                  <p>No transactions found.</p>
              </div>
          ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-4 border-b border-slate-800">Reference</th>
                      <th className="p-4 border-b border-slate-800">Service</th>
                      <th className="p-4 border-b border-slate-800">Date</th>
                      <th className="p-4 border-b border-slate-800">Amount</th>
                      <th className="p-4 border-b border-slate-800">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                   {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-800/50 transition-colors">
                         <td className="p-4 font-mono text-slate-500">{txn.id.substring(0,8)}...</td>
                         <td className="p-4 font-medium text-white">{txn.description || txn.type}</td>
                         <td className="p-4 text-slate-400">{txn.date?.toDate ? txn.date.toDate().toLocaleDateString() : 'N/A'}</td>
                         <td className={`p-4 font-bold ${txn.type === 'CREDIT' ? 'text-green-500' : 'text-slate-200'}`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}₦{txn.amount}
                         </td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                               txn.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 
                               txn.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                               {txn.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          )}
          {transactions.length > 0 && (
            <div className="p-4 border-t border-slate-800 flex justify-center">
                <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">Load More Records</button>
            </div>
          )}
       </div>
    </div>
  );
};