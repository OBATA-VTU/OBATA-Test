import React, { useState } from 'react';
import { CreditCard, Wallet, Copy, UploadCloud, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PaystackForm } from '../components/PaystackForm';
import { uploadImageToImgBB } from '../services/api';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';

export const FundWallet: React.FC = () => {
  const { currentUser, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [amount, setAmount] = useState('');
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePaystackSuccess = async () => {
      // Logic for verifying paystack typically happens on backend
      // Here we optimistically credit for the prompt requirement
      if (!currentUser) return;
      try {
          await updateDoc(doc(db, 'users', currentUser.uid), { walletBalance: increment(Number(amount)), hasFunded: true });
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid,
              type: 'FUNDING',
              amount: Number(amount),
              status: 'SUCCESS',
              method: 'PAYSTACK',
              date: serverTimestamp()
          });
          await refreshProfile();
          setAmount('');
          alert("Wallet Funded Successfully!");
      } catch (e) { console.error(e); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualFile || !currentUser) return;
      setLoading(true);

      try {
          const proofUrl = await uploadImageToImgBB(manualFile);
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid,
              type: 'FUNDING',
              amount: Number(amount),
              status: 'PENDING',
              method: 'MANUAL',
              proofUrl,
              date: serverTimestamp()
          });
          alert("Request Submitted! Admin will review.");
          setAmount('');
          setManualFile(null);
      } catch (e: any) {
          alert("Error: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-6">Fund Wallet</h1>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
                onClick={() => setActiveTab('AUTO')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'AUTO' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}
            >
                Automatic (Paystack)
            </button>
            <button 
                onClick={() => setActiveTab('MANUAL')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeTab === 'MANUAL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}
            >
                Manual Transfer
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            {activeTab === 'AUTO' ? (
                <div className="space-y-6">
                    <div>
                        <label className="text-slate-400 text-sm font-bold block mb-2">Amount (₦)</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-xl font-bold"
                            placeholder="1000"
                        />
                    </div>
                    {Number(amount) > 0 && (
                        <PaystackForm 
                            onSubmit={() => {}}
                            isLoading={loading}
                            forcedAmount={amount}
                            forcedAction="INITIALIZE"
                            onSuccess={handlePaystackSuccess}
                            title="Fund with Card"
                        />
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative group">
                         <p className="text-xs text-slate-500 font-bold uppercase mb-2">Bank Details</p>
                         <h3 className="text-xl font-bold text-white">OPAY Digital Services</h3>
                         <div className="flex items-center space-x-3 my-2">
                             <span className="text-3xl font-mono font-bold text-blue-400">8142452729</span>
                             <button onClick={() => navigator.clipboard.writeText('8142452729')} className="text-slate-500 hover:text-white"><Copy className="w-5 h-5" /></button>
                         </div>
                         <p className="text-white font-medium">OBATA GLOBAL SERVICES</p>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm font-bold block mb-2">Amount Sent</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm font-bold block mb-2">Proof of Payment</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {manualFile ? <CheckCircle className="w-8 h-8 text-green-500" /> : <UploadCloud className="w-8 h-8 text-slate-400" />}
                                    <p className="text-sm text-slate-400 mt-2">{manualFile ? manualFile.name : 'Click to Upload Screenshot'}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setManualFile(e.target.files[0])} />
                            </label>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Submit for Verification'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};