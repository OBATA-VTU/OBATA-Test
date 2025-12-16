import React, { useState } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Wallet, History, AlertCircle } from 'lucide-react';
import { PaystackForm } from './PaystackForm';
import { ApiConfig } from '../types';

interface WalletPageProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type WalletTab = 'FUND' | 'WITHDRAW_COMMISSION' | 'HISTORY';

export const WalletPage: React.FC<WalletPageProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<WalletTab>('FUND');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('044'); // Access Bank Mock
  const [accountNumber, setAccountNumber] = useState('');

  const commissionBalance = 1240.00;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(withdrawAmount) > commissionBalance) {
        alert("Insufficient commission balance");
        return;
    }
    // Mock API Call
    alert(`Withdrawal of N${withdrawAmount} initiated to ${accountNumber}.`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl border border-blue-800">
        <div>
           <p className="text-slate-400 text-sm mb-1">Total Wallet Balance</p>
           <h1 className="text-4xl font-bold text-white mb-4">₦50,450.00</h1>
           <div className="flex space-x-4">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-emerald-500/30">
                 <ArrowDownLeft className="w-3 h-3 mr-1" /> +₦5,000 Last Deposit
              </div>
           </div>
        </div>
        <div className="mt-4 md:mt-0 text-right">
            <p className="text-slate-400 text-sm mb-1">Commission Balance</p>
            <h2 className="text-2xl font-bold text-emerald-400">₦{commissionBalance.toLocaleString()}</h2>
            <p className="text-xs text-slate-500">Available to withdraw</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        <button 
           onClick={() => setActiveTab('FUND')} 
           className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'FUND' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
           <ArrowDownLeft className="w-4 h-4" /> <span>Fund Wallet</span>
        </button>
        <button 
           onClick={() => setActiveTab('WITHDRAW_COMMISSION')} 
           className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'WITHDRAW_COMMISSION' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
           <ArrowUpRight className="w-4 h-4" /> <span>Withdraw Commission</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
         {activeTab === 'FUND' && (
            <div>
               <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Add Money to Wallet</h3>
                  <p className="text-slate-400 text-sm">Securely fund your wallet using Paystack (Card, Transfer, USSD).</p>
               </div>
               <PaystackForm onSubmit={onSubmit} isLoading={isLoading} />
            </div>
         )}

         {activeTab === 'WITHDRAW_COMMISSION' && (
            <div>
               <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Withdraw Earnings</h3>
                  <p className="text-slate-400 text-sm">Move your referral bonus and commission to your main wallet or bank.</p>
               </div>
               <form onSubmit={handleWithdraw} className="space-y-4 max-w-lg">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-3">
                     <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                     <p className="text-xs text-amber-200">
                        Minimum withdrawal is ₦1,000. Funds are moved instantly to your main wallet or processed to your bank within 24 hours.
                     </p>
                  </div>
                  <div>
                     <label className="text-sm text-slate-400 block mb-1">Amount to Withdraw</label>
                     <input 
                        type="number" 
                        value={withdrawAmount} 
                        onChange={(e) => setWithdrawAmount(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500" 
                        placeholder="1000"
                        min="1000"
                     />
                  </div>
                  <div>
                     <label className="text-sm text-slate-400 block mb-1">Destination</label>
                     <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500">
                        <option value="WALLET">Main Wallet (Instant)</option>
                        <option value="BANK">Bank Account</option>
                     </select>
                  </div>
                  {/* Bank Details would show if BANK is selected */}
                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors">
                     Process Withdrawal
                  </button>
               </form>
            </div>
         )}
      </div>
    </div>
  );
};