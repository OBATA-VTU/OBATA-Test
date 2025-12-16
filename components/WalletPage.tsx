import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Wallet, AlertCircle, Copy, Check, UploadCloud, Loader2 } from 'lucide-react';
import { PaystackForm } from './PaystackForm';
import { PinVerifyModal } from './PinVerifyModal'; // New Import
import { ApiConfig } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, increment, updateDoc, serverTimestamp, collection, addDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../services/firebase';

interface WalletPageProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type WalletTab = 'FUND' | 'WITHDRAW_COMMISSION';
type FundingMethod = 'AUTO' | 'MANUAL';

export const WalletPage: React.FC<WalletPageProps> = ({ onSubmit, isLoading }) => {
  const { userProfile, currentUser, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<WalletTab>('FUND');
  const [fundingMethod, setFundingMethod] = useState<FundingMethod>('AUTO');
  
  // Funding States
  const [amount, setAmount] = useState('');
  const [manualProofFile, setManualProofFile] = useState<File | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualRef, setManualRef] = useState('');

  // Withdraw States
  const [withdrawCommissionLoading, setWithdrawCommissionLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false); // Modal State

  useEffect(() => {
      if (currentUser) {
          const uniqueRef = `MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`;
          setManualRef(uniqueRef);
      }
  }, [currentUser, fundingMethod]);

  const walletBalance = userProfile?.walletBalance || 0;
  // @ts-ignore
  const commissionBalance = userProfile?.commissionBalance || 0;

  // Calculate Paystack Total
  const fundingAmount = parseFloat(amount) || 0;
  const paystackCharge = fundingAmount * 0.015; // 1.5%
  const totalPaystackAmount = fundingAmount + paystackCharge;

  const handleAutoFundSuccess = async () => {
    if (!currentUser) return;
    try {
        // Credit Wallet Instantly for Automatic
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            walletBalance: increment(fundingAmount),
            hasFunded: true
        });

        // Record Transaction
        await addDoc(collection(db, 'transactions'), {
            userId: currentUser.uid,
            userEmail: userProfile?.email,
            type: 'FUNDING',
            method: 'PAYSTACK',
            amount: fundingAmount,
            charge: paystackCharge,
            description: 'Wallet Funding via Paystack',
            status: 'SUCCESS',
            date: serverTimestamp(),
            reference: `PAY-${Date.now()}`
        });

        await refreshProfile();
        setAmount('');
        alert("Wallet Funded Successfully!");
    } catch (e) {
        console.error(e);
        alert("Error updating wallet. Please contact support.");
    }
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('image', file);
      // Public key for demo purposes, ideally use env var
      const key = '6d207e02198a847aa98d0a2a901485a5'; 
      
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
          method: 'POST',
          body: formData
      });
      const data = await res.json();
      if (data.success) return data.data.url;
      throw new Error('Image upload failed');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || !amount || !manualProofFile) return;

      setManualLoading(true);
      try {
          // 1. Upload Proof
          const proofUrl = await uploadImageToImgBB(manualProofFile);

          // 2. Create Transaction Request (Pending Admin Approval)
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid,
              userEmail: userProfile?.email,
              type: 'FUNDING',
              method: 'MANUAL',
              amount: parseFloat(amount),
              description: 'Manual Wallet Funding',
              status: 'PENDING',
              date: serverTimestamp(),
              reference: manualRef,
              proofUrl: proofUrl
          });

          alert("Funding Request Submitted! Admin will review and credit your wallet shortly.");
          setAmount('');
          setManualProofFile(null);
          // Regenerate Ref
          setManualRef(`MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`);

      } catch (error: any) {
          alert("Submission failed: " + error.message);
      } finally {
          setManualLoading(false);
      }
  };

  const initiateWithdrawal = () => {
      if (commissionBalance <= 0) {
          alert("You have no commission to withdraw.");
          return;
      }
      setShowPinModal(true);
  };

  const handleWithdrawCommission = async () => {
      if (!currentUser) return;
      
      setWithdrawCommissionLoading(true);
      setShowPinModal(false); // Close Modal

      try {
          await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', currentUser.uid);
              // Move from Commission to Main Wallet
              transaction.update(userRef, {
                  commissionBalance: 0,
                  walletBalance: increment(commissionBalance)
              });
              
              const txnRef = doc(collection(db, 'transactions'));
              transaction.set(txnRef, {
                  userId: currentUser.uid,
                  type: 'CREDIT',
                  amount: commissionBalance,
                  description: 'Commission Withdrawal to Wallet',
                  status: 'SUCCESS',
                  date: serverTimestamp()
              });
          });

          await refreshProfile();
          alert(`Successfully withdrew ₦${commissionBalance} to main wallet!`);
      } catch (e: any) {
          alert("Withdrawal failed: " + e.message);
      } finally {
          setWithdrawCommissionLoading(false);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PinVerifyModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onVerified={handleWithdrawCommission}
          title="Withdraw Commission"
          amount={commissionBalance.toString()}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl border border-blue-800 shadow-xl">
        <div>
           <p className="text-slate-400 text-sm mb-1">Total Wallet Balance</p>
           <h1 className="text-4xl font-bold text-white mb-4">₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
           <div className="flex space-x-4">
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-emerald-500/30">
                 <ArrowDownLeft className="w-3 h-3 mr-1" /> Active
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button onClick={() => setActiveTab('FUND')} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'FUND' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
           Fund Wallet
        </button>
        <button onClick={() => setActiveTab('WITHDRAW_COMMISSION')} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'WITHDRAW_COMMISSION' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
           Withdraw Commission
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
         {activeTab === 'FUND' && (
            <div>
               <h3 className="text-xl font-bold text-white mb-6">Choose Funding Method</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   <div 
                      onClick={() => setFundingMethod('AUTO')}
                      className={`cursor-pointer p-4 rounded-xl border-2 flex items-center space-x-3 transition-all ${fundingMethod === 'AUTO' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                   >
                       <div className="bg-blue-500 p-2 rounded-full text-white"><CreditCard className="w-5 h-5" /></div>
                       <div>
                           <p className="font-bold text-white">Automated Funding</p>
                           <p className="text-xs text-slate-400">Instant credit via Paystack. 1.5% charge.</p>
                       </div>
                   </div>
                   <div 
                      onClick={() => setFundingMethod('MANUAL')}
                      className={`cursor-pointer p-4 rounded-xl border-2 flex items-center space-x-3 transition-all ${fundingMethod === 'MANUAL' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                   >
                       <div className="bg-amber-500 p-2 rounded-full text-white"><Wallet className="w-5 h-5" /></div>
                       <div>
                           <p className="font-bold text-white">Manual Deposit</p>
                           <p className="text-xs text-slate-400">Bank Transfer. No fees. Admin approval.</p>
                       </div>
                   </div>
               </div>

               {fundingMethod === 'AUTO' ? (
                   <div className="max-w-md mx-auto space-y-6">
                       <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                           <p className="text-sm text-blue-300 mb-2">How much do you want to fund?</p>
                           <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="e.g 1000"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg font-bold"
                           />
                           {fundingAmount > 0 && fundingAmount < 100 && <p className="text-red-500 text-xs mt-2">Minimum funding amount is ₦100</p>}
                           
                           {fundingAmount >= 100 && (
                               <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2 text-sm">
                                   <div className="flex justify-between text-slate-400">
                                       <span>Amount to Credit:</span>
                                       <span className="text-white font-bold">₦{fundingAmount}</span>
                                   </div>
                                   <div className="flex justify-between text-slate-400">
                                       <span>Service Charge (1.5%):</span>
                                       <span className="text-red-400">₦{paystackCharge.toFixed(2)}</span>
                                   </div>
                                   <div className="flex justify-between text-white font-bold text-lg pt-2">
                                       <span>You Pay:</span>
                                       <span>₦{totalPaystackAmount.toFixed(2)}</span>
                                   </div>
                               </div>
                           )}
                       </div>

                       {fundingAmount >= 100 && (
                           <PaystackForm 
                               onSubmit={onSubmit} 
                               isLoading={isLoading} 
                               forcedAmount={totalPaystackAmount.toString()}
                               forcedAction="INITIALIZE"
                               title={`Wallet Funding`}
                               onSuccess={handleAutoFundSuccess}
                           />
                       )}
                   </div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                           <h4 className="font-bold text-white mb-4">Bank Details</h4>
                           <div className="space-y-4">
                               <div>
                                   <p className="text-xs text-slate-500">Bank Name</p>
                                   <p className="font-bold text-white text-lg">PALMPAY</p>
                               </div>
                               <div>
                                   <p className="text-xs text-slate-500">Account Number</p>
                                   <div className="flex items-center space-x-2">
                                       <p className="font-bold text-white text-2xl tracking-widest text-blue-500">8142452729</p>
                                       <button onClick={() => navigator.clipboard.writeText('8142452729')} className="text-slate-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                                   </div>
                               </div>
                               <div>
                                   <p className="text-xs text-slate-500">Account Name</p>
                                   <p className="font-bold text-white">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                               </div>
                           </div>
                           <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                               <p className="text-xs text-amber-200 leading-relaxed">
                                   <span className="font-bold">IMPORTANT:</span> Please use the reference code generated on the right as your transfer narration description.
                               </p>
                           </div>
                       </div>

                       <form onSubmit={handleManualSubmit} className="space-y-4">
                           <div>
                               <label className="text-sm text-slate-400">Amount Sent</label>
                               <input 
                                  type="number" 
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                  placeholder="5000"
                                  required
                               />
                           </div>
                           <div>
                               <label className="text-sm text-slate-400">Transaction Reference (Use as narration)</label>
                               <div className="flex">
                                   <input 
                                      type="text" 
                                      value={manualRef}
                                      readOnly
                                      className="flex-1 bg-slate-950 border border-slate-700 rounded-l-lg p-3 text-slate-300 font-mono text-xs"
                                   />
                                   <button type="button" onClick={() => navigator.clipboard.writeText(manualRef)} className="bg-slate-800 px-3 rounded-r-lg border border-l-0 border-slate-700 text-slate-400 hover:text-white">
                                       <Copy className="w-4 h-4" />
                                   </button>
                               </div>
                           </div>
                           <div>
                               <label className="text-sm text-slate-400 mb-2 block">Upload Receipt (Screenshot)</label>
                               <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                       {manualProofFile ? (
                                           <div className="text-center">
                                               <Check className="w-8 h-8 text-green-500 mb-2 mx-auto" />
                                               <p className="text-sm text-green-400">{manualProofFile.name}</p>
                                           </div>
                                       ) : (
                                           <>
                                               <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                               <p className="text-sm text-slate-500">Click to upload proof</p>
                                           </>
                                       )}
                                   </div>
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setManualProofFile(e.target.files[0])} />
                               </label>
                           </div>
                           <button 
                               type="submit" 
                               disabled={manualLoading}
                               className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                           >
                               {manualLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Payment Proof'}
                           </button>
                       </form>
                   </div>
               )}
            </div>
         )}

         {activeTab === 'WITHDRAW_COMMISSION' && (
             <div className="text-center py-8">
                 <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl max-w-md mx-auto mb-6">
                     <p className="text-emerald-400 text-sm mb-1 uppercase font-bold">Commission Balance</p>
                     <h2 className="text-4xl font-bold text-white mb-4">₦{commissionBalance.toLocaleString()}</h2>
                     <button 
                        onClick={initiateWithdrawal}
                        disabled={withdrawCommissionLoading || commissionBalance <= 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                     >
                         {withdrawCommissionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Move to Main Wallet'}
                     </button>
                 </div>
                 <p className="text-slate-500 text-sm">
                     Commissions are earned when people you refer upgrade to Reseller.
                 </p>
             </div>
         )}
      </div>
    </div>
  );
};