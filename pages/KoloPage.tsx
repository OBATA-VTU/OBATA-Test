import React, { useState } from 'react';
import { PiggyBank, Lock, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { doc, runTransaction, increment, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

export const KoloPage: React.FC = () => {
  const { userProfile, refreshProfile, currentUser } = useAuth();
  const [showPin, setShowPin] = useState(false);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);

  const interestRate = 0.15; // 15% APY
  const numAmount = parseFloat(amount) || 0;
  const numDuration = parseInt(duration);
  const interest = numAmount * interestRate * (numDuration / 365);
  const totalReturn = numAmount + interest;

  const handleSave = async () => {
      setLoading(true);
      if (!currentUser) return;
      
      try {
          await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', currentUser.uid);
              const userDoc = await transaction.get(userRef);
              const wallet = userDoc.data()?.walletBalance || 0;
              
              if (wallet < numAmount) throw new Error("Insufficient Funds");

              transaction.update(userRef, {
                  walletBalance: increment(-numAmount),
                  savingsBalance: increment(numAmount)
              });

              const txnRef = doc(collection(db, 'transactions'));
              transaction.set(txnRef, {
                  userId: currentUser.uid,
                  type: 'DEBIT',
                  amount: numAmount,
                  description: `Kolo Savings - ${numDuration} Days`,
                  status: 'SUCCESS',
                  date: serverTimestamp()
              });
          });
          await refreshProfile();
          alert("Saved successfully!");
          setAmount('');
      } catch (e: any) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <TransactionPinModal 
            isOpen={showPin}
            onClose={() => setShowPin(false)}
            onSuccess={handleSave}
            title="Confirm Savings"
            amount={numAmount}
        />

        <div className="bg-gradient-to-r from-pink-600 to-rose-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-2">
                    <PiggyBank className="w-6 h-6" />
                    <span className="font-bold tracking-widest uppercase text-sm opacity-80">Obata Kolo</span>
                </div>
                <h2 className="text-5xl font-bold mb-4">₦{userProfile?.savingsBalance.toLocaleString() || '0.00'}</h2>
                <p className="text-pink-100">Total Savings Balance (+15% APY)</p>
            </div>
            <PiggyBank className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10 rotate-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Create New Plan</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-slate-400 text-sm font-bold block mb-2">Amount to Save</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg font-bold"
                            placeholder="5000"
                        />
                    </div>
                    <div>
                        <label className="text-slate-400 text-sm font-bold block mb-2">Duration</label>
                        <select 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                        >
                            <option value="7">7 Days (Flextime)</option>
                            <option value="30">30 Days (Standard)</option>
                            <option value="90">90 Days (Target)</option>
                            <option value="365">1 Year (Longterm)</option>
                        </select>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-400"><span>Interest</span><span className="text-green-400">₦{interest.toFixed(2)}</span></div>
                        <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-700"><span>Maturity Value</span><span>₦{totalReturn.toLocaleString()}</span></div>
                    </div>

                    <button 
                        onClick={() => setShowPin(true)}
                        disabled={numAmount <= 0}
                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                    >
                        Lock Funds
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-start space-x-4">
                    <div className="bg-green-500/10 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-green-500" /></div>
                    <div>
                        <h4 className="font-bold text-white">High Interest Rates</h4>
                        <p className="text-sm text-slate-400">Earn up to 15% per annum on your savings. Interest is paid daily.</p>
                    </div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-start space-x-4">
                    <div className="bg-blue-500/10 p-3 rounded-xl"><Lock className="w-6 h-6 text-blue-500" /></div>
                    <div>
                        <h4 className="font-bold text-white">Strict Lock</h4>
                        <p className="text-sm text-slate-400">Funds cannot be withdrawn to main wallet until maturity date to ensure discipline.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
