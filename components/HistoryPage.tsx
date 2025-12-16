import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const transactions = [
    { id: 'TXN10239', service: 'MTN 1GB SME', amount: '-₦250.00', date: '2023-10-24 10:30 AM', status: 'SUCCESS', type: 'DEBIT' },
    { id: 'TXN10240', service: 'Wallet Funding', amount: '+₦5,000.00', date: '2023-10-23 04:15 PM', status: 'SUCCESS', type: 'CREDIT' },
    { id: 'TXN10241', service: 'Airtel VTU 500', amount: '-₦500.00', date: '2023-10-22 09:30 AM', status: 'FAILED', type: 'DEBIT' },
    { id: 'TXN10242', service: 'Ikeja Electric', amount: '-₦2,500.00', date: '2023-10-20 07:12 PM', status: 'SUCCESS', type: 'DEBIT' },
    { id: 'TXN10243', service: 'GOTV Jinja', amount: '-₦3,900.00', date: '2023-10-19 12:00 PM', status: 'SUCCESS', type: 'DEBIT' },
  ];

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
             <button className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white"><Download className="w-5 h-5" /></button>
          </div>
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
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
                         <td className="p-4 font-mono text-slate-500">{txn.id}</td>
                         <td className="p-4 font-medium text-white">{txn.service}</td>
                         <td className="p-4 text-slate-400">{txn.date}</td>
                         <td className={`p-4 font-bold ${txn.type === 'CREDIT' ? 'text-green-500' : 'text-slate-200'}`}>
                            {txn.amount}
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
          <div className="p-4 border-t border-slate-800 flex justify-center">
             <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">Load More Records</button>
          </div>
       </div>
    </div>
  );
};