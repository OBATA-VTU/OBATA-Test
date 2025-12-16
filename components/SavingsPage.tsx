import React, { useState } from 'react';
import { PiggyBank, TrendingUp, Lock, ShieldCheck, ArrowLeft, Loader2, Play, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, runTransaction, serverTimestamp, increment, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

export const SavingsPage: React.FC = () => {
  const { userProfile, currentUser, refreshProfile } = useAuth();
  const [saveAmount, setSaveAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [subView, setSubView] = useState<'MAIN' | 'WITHDRAW'>('MAIN');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const savingsBalance = userProfile?.savingsBalance || 0;
  const walletBalance = userProfile?.walletBalance || 0;

  const amountNum = parseFloat(saveAmount) || 0;
  const dailyInterest = (amountNum / 500) * 0.20;
  const totalInterest = dailyInterest * parseFloat(duration);
  const totalReturn = amountNum + totalInterest;

  const handleCreateSavings = async () => {
     if (!currentUser) return;
     if (amountNum < 100) return alert("Minimum savings amount is ₦100");
     if (amountNum > walletBalance) return alert("Insufficient wallet balance.");

     if (!confirm(`Confirm savings of ₦${amountNum} for ${duration} days?`)) return;

     setLoading(true);

     try {
         await runTransaction(db, async (transaction) => {
             const userRef = doc(db, 'users', currentUser.uid);
             const userDoc = await transaction.get(userRef);
             if (!userDoc.exists()) throw "User does not exist";

             const currentWallet = userDoc.data().walletBalance || 0;
             if (currentWallet < amountNum) throw "Insufficient funds in wallet";

             // Deduct from Main Wallet, Add to Savings
             transaction.update(userRef, { 
                 walletBalance: increment(-amountNum),
                 savingsBalance: increment(amountNum)
             });

             // Log Transaction
             const txnRef = doc(collection(db, 'transactions'));
             transaction.set(txnRef, {
                 userId: currentUser.uid,
                 type: 'DEBIT',
                 amount: amountNum,
                 description: `Kolo Savings Deposit (${duration} Days)`,
                 status: 'SUCCESS',
                 date: serverTimestamp(),
                 savingsDetails: {
                     principal: amountNum,
                     interest: totalInterest,
                     duration: Number(duration),
                     maturityDate: new Date(Date.now() + Number(duration) * 86400000)
                 }
             });
         });

         await refreshProfile();
         setSaveAmount('');
         alert("Savings Plan Created Successfully! Your money is now growing.");
     } catch (e: any) {
         alert("Failed to save: " + e.message);
     } finally {
         setLoading(false);
     }
  };

  const handleWithdrawSavings = async () => {
      if (!currentUser) return;
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0) return alert("Invalid amount");
      if (amt > savingsBalance) return alert("Insufficient savings balance");

      setLoading(true);

      try {
           await runTransaction(db, async (transaction) => {
             const userRef = doc(db, 'users', currentUser.uid);
             
             // Move Principal to Main Wallet
             transaction.update(userRef, { 
                 savingsBalance: increment(-amt),
                 walletBalance: increment(amt)
             });

             const txnRef = doc(collection(db, 'transactions'));
             transaction.set(txnRef, {
                 userId: currentUser.uid,
                 type: 'CREDIT',
                 amount: amt,
                 description: `Kolo Savings Withdrawal`,
                 status: 'SUCCESS',
                 date: serverTimestamp()
             });
         });
         await refreshProfile();
         setWithdrawAmount('');
         setSubView('MAIN');
         alert("Withdrawal Successful! Funds moved to Main Wallet.");
      } catch (e: any) {
          alert("Error: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  if (subView === 'WITHDRAW') {
      return (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in-up">
              <button 
                onClick={() => setSubView('MAIN')} 
                className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Savings Home
              </button>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6">Withdraw Savings</h2>
                  <div className="bg-purple-900/20 p-4 rounded-xl mb-6 border border-purple-500/30">
                      <p className="text-slate-400 text-sm">Available Savings</p>
                      <p className="text-3xl font-bold text-white">₦{savingsBalance.toLocaleString()}</p>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-sm text-slate-400 mb-1 block">Amount to Withdraw</label>
                          <input 
                            type="number" 
                            value={withdrawAmount} 
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-bold focus:border-purple-500"
                            placeholder="0.00"
                          />
                      </div>
                      <button 
                        onClick={handleWithdrawSavings}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-all shadow-lg shadow-purple-900/50"
                      >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal to Wallet'}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
       <div className="bg-gradient-to-br from-pink-600 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <PiggyBank className="w-48 h-48" />
          </div>
          <div className="relative z-10">
             <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Obata Kolo</span>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">+15% p.a Interest</span>
             </div>
             <p className="text-purple-200">Total Savings Balance</p>
             <h1 className="text-5xl font-bold mb-6">₦{savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
             <div className="flex gap-4">
                <button 
                    onClick={() => document.getElementById('savings-input')?.focus()}
                    className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg flex items-center"
                >
                   <Play className="w-4 h-4 mr-2 fill-current" /> Quick Save
                </button>
                <button 
                    onClick={() => setSubView('WITHDRAW')}
                    className="bg-purple-900/50 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-purple-900/70 transition-colors flex items-center"
                >
                   <Wallet className="w-4 h-4 mr-2" /> Withdraw
                </button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator / Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
             <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-pink-500" /> Start Saving
             </h3>
             <div className="space-y-4">
                <div>
                   <label className="text-sm text-slate-400 block mb-2">I want to save (₦)</label>
                   <input 
                      id="savings-input"
                      type="number" 
                      value={saveAmount} 
                      onChange={(e) => setSaveAmount(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg font-bold focus:border-pink-500 transition-colors" 
                      placeholder="5000"
                   />
                </div>
                <div>
                   <label className="text-sm text-slate-400 block mb-2">Duration (Days)</label>
                   <select 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-pink-500 transition-colors"
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
                   <p className="text-xs text-slate-500 mt-2 italic">Funds are deducted from your Main Wallet.</p>
                </div>

                <button 
                    onClick={handleCreateSavings}
                    disabled={loading || amountNum <= 0}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-600/20 flex items-center justify-center active:scale-[0.98]"
                >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Savings Plan'}
                </button>
             </div>
          </div>
          
           {/* Info */}
          <div className="space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
                <h3 className="text-white font-bold mb-4">Why Save with Kolo?</h3>
                <div className="space-y-6">
                   <div className="flex items-start space-x-4">
                      <div className="bg-pink-500/10 p-3 rounded-xl"><Lock className="w-6 h-6 text-pink-500" /></div>
                      <div>
                         <h4 className="text-white font-bold text-base">Disciplined Savings</h4>
                         <p className="text-sm text-slate-400 mt-1">Funds are safely locked. You can only withdraw to your main wallet.</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-4">
                      <div className="bg-green-500/10 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-green-500" /></div>
                      <div>
                         <h4 className="text-white font-bold text-base">Compound Growth</h4>
                         <p className="text-sm text-slate-400 mt-1">Watch your money grow daily. Perfect for short-term goals or emergency funds.</p>
                      </div>
                   </div>
                   <div className="flex items-start space-x-4">
                      <div className="bg-blue-500/10 p-3 rounded-xl"><ShieldCheck className="w-6 h-6 text-blue-500" /></div>
                      <div>
                         <h4 className="text-white font-bold text-base">Bank Grade Security</h4>
                         <p className="text-sm text-slate-400 mt-1">Your savings are backed by 100% reserve guarantee.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};