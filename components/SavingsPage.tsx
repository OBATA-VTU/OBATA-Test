import React, { useState } from 'react';
import { PiggyBank, TrendingUp, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SavingsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [saveAmount, setSaveAmount] = useState('');
  const [duration, setDuration] = useState('30');

  // Use real data or default to 0 to avoid fake information
  const savingsBalance = 0; 

  // Interest Logic: 0.20 naira per day for every 500 naira
  const amountNum = parseFloat(saveAmount) || 0;
  const dailyInterest = (amountNum / 500) * 0.20;
  const totalInterest = dailyInterest * parseFloat(duration);
  const totalReturn = amountNum + totalInterest;

  return (
    <div className="space-y-6 animate-fade-in-up">
       <div className="bg-gradient-to-br from-pink-600 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <PiggyBank className="w-48 h-48" />
          </div>
          <div className="relative z-10">
             <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Obata Kolo</span>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">+15% p.a</span>
             </div>
             <p className="text-purple-200">Total Savings Balance</p>
             <h1 className="text-5xl font-bold mb-6">₦{savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
             <div className="flex gap-4">
                <button className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg">
                   + Quick Save
                </button>
                <button className="bg-purple-900/50 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-purple-900/70 transition-colors">
                   Withdraw
                </button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-pink-500" /> Interest Calculator
             </h3>
             <div className="space-y-4">
                <div>
                   <label className="text-sm text-slate-400 block mb-2">I want to save (₦)</label>
                   <input 
                      type="number" 
                      value={saveAmount} 
                      onChange={(e) => setSaveAmount(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg font-bold focus:border-pink-500" 
                      placeholder="5000"
                   />
                </div>
                <div>
                   <label className="text-sm text-slate-400 block mb-2">Duration (Days)</label>
                   <select 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                   >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="180">180 Days</option>
                      <option value="365">1 Year</option>
                   </select>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-700">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Daily Interest</span>
                      <span className="text-green-400 font-bold">+₦{dailyInterest.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Profit</span>
                      <span className="text-green-400 font-bold">+₦{totalInterest.toFixed(2)}</span>
                   </div>
                   <div className="border-t border-slate-700 pt-2 flex justify-between items-center mt-2">
                      <span className="text-slate-300 font-bold">Total Return</span>
                      <span className="text-2xl font-bold text-white">₦{totalReturn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                   </div>
                </div>

                <button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-pink-600/20">
                   Create Savings Plan
                </button>
             </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Why Save with Kolo?</h3>
                <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                      <div className="bg-pink-500/10 p-2 rounded-lg"><Lock className="w-5 h-5 text-pink-500" /></div>
                      <div>
                         <h4 className="text-white font-bold text-sm">Disciplined Savings</h4>
                         <p className="text-xs text-slate-400">Funds are locked for the duration you choose to prevent impulse spending.</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-3">
                      <div className="bg-green-500/10 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-green-500" /></div>
                      <div>
                         <h4 className="text-white font-bold text-sm">Daily Interest</h4>
                         <p className="text-xs text-slate-400">Earn ₦0.20 daily for every ₦500. Interest is paid automatically.</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-blue-500" /></div>
                      <div>
                         <h4 className="text-white font-bold text-sm">Bank Grade Security</h4>
                         <p className="text-xs text-slate-400">Your savings are invested in secure low-risk instruments.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};