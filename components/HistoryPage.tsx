import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ReceiptModal } from './ReceiptModal';

export const HistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  useEffect(() => {
      const fetchTransactions = async () => {
          if (!currentUser) return setIsLoading(false);
          try {
              const q = query(
                  collection(db, 'transactions'),
                  where('userId', '==', currentUser.uid),
                  orderBy('date', 'desc'),
                  limit(50)
              );
              const snapshot = await getDocs(q);
              setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (error) { console.error(error); } 
          finally { setIsLoading(false); }
      };
      fetchTransactions();
  }, [currentUser]);

  const filteredTxns = transactions.filter(t => 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
      const s = status?.toUpperCase() || 'PENDING';
      if (s === 'SUCCESS') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      if (s === 'FAILED') return 'bg-red-500/10 text-red-500 border-red-500/20';
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
       <ReceiptModal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} response={selectedTxn} loading={false} />

       <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h2 className="text-3xl font-bold text-white">Transactions</h2>
              <p className="text-slate-400 text-sm">Tap any transaction for a full receipt.</p>
          </div>
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
             <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500" />
          </div>
       </div>
       
       <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[400px]">
          {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500"><Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" /> <p>Syncing records...</p></div>
          ) : filteredTxns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500"><FileText className="w-12 h-12 mb-4 opacity-20" /><p>No transactions found.</p></div>
          ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider font-bold">
                      <th className="p-5 border-b border-slate-800">Type</th>
                      <th className="p-5 border-b border-slate-800">Description</th>
                      <th className="p-5 border-b border-slate-800">Reference</th>
                      <th className="p-5 border-b border-slate-800">Date</th>
                      <th className="p-5 border-b border-slate-800 text-right">Amount</th>
                      <th className="p-5 border-b border-slate-800 text-center">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                   {filteredTxns.map((txn) => {
                      const isCredit = txn.type === 'CREDIT' || txn.type === 'FUNDING';
                      return (
                      <tr key={txn.id} onClick={() => setSelectedTxn(txn)} className="hover:bg-slate-800/40 transition-colors cursor-pointer group">
                         <td className="p-5">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                 {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                             </div>
                         </td>
                         <td className="p-5"><p className="font-bold text-white mb-0.5">{txn.type}</p><p className="text-xs text-slate-500 truncate max-w-[200px]">{txn.description}</p></td>
                         <td className="p-5 font-mono text-xs text-slate-500 group-hover:text-blue-400">{txn.reference || txn.id.substring(0,8)}</td>
                         <td className="p-5 text-slate-400 text-xs">{txn.date?.toDate ? txn.date.toDate().toLocaleDateString() : 'N/A'}</td>
                         <td className={`p-5 text-right font-bold text-base ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>{isCredit ? '+' : '-'}₦{txn.amount.toLocaleString()}</td>
                         <td className="p-5 text-center">
                             <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase border tracking-wide ${getStatusBadge(txn.status)}`}>
                                 {txn.status}
                             </span>
                         </td>
                      </tr>
                   )})}
                </tbody>
             </table>
          </div>
          )}
       </div>
    </div>
  );
};