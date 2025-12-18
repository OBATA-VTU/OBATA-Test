import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Wallet, Copy, Check, UploadCloud, Loader2, Building, RefreshCw } from 'lucide-react';
import { PaystackForm } from '../components/PaystackForm';
import { PinVerifyModal } from '../components/PinVerifyModal';
import { ProcessingModal } from '../components/ProcessingModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { ApiConfig } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, increment, updateDoc, serverTimestamp, collection, addDoc, runTransaction } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../services/firebase';
import { executeApiRequest, getBanks, resolveBankAccount } from '../services/api';
import { toast } from 'react-hot-toast';

interface WalletPageProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type WalletTab = 'FUND' | 'WITHDRAW';
type FundingMethod = 'AUTO' | 'MANUAL';

export const WalletPage: React.FC<WalletPageProps> = ({ onSubmit, isLoading }) => {
  const { userProfile, currentUser, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<WalletTab>('FUND');
  const [fundingMethod, setFundingMethod] = useState<FundingMethod>('AUTO');
  
  const [amount, setAmount] = useState('');
  const [manualProofFile, setManualProofFile] = useState<File | null>(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualRef, setManualRef] = useState('');

  const [withdrawSource, setWithdrawSource] = useState<'MAIN' | 'COMMISSION'>('COMMISSION');
  const [withdrawDestination, setWithdrawDestination] = useState<'MAIN_WALLET' | 'BANK'>('MAIN_WALLET');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);

  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
      if (currentUser) {
          const uniqueRef = `MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`;
          setManualRef(uniqueRef);
      }
  }, [currentUser, fundingMethod]);

  useEffect(() => {
      const fetchBanksList = async () => {
          if (activeTab === 'WITHDRAW' && banks.length === 0) {
              setBanksLoading(true);
              try {
                  const res = await getBanks();
                  // Fix: Correct array extraction
                  if (res.success && res.data && Array.isArray(res.data.data)) {
                      setBanks(res.data.data);
                  } else {
                      setBanks([{ name: 'Kuda Bank', code: '50211' }, { name: 'OPay', code: '999992' }]);
                  }
              } catch (e) {
                  toast.error("Bank list unavailable.");
              } finally {
                  setBanksLoading(false);
              }
          }
      };
      fetchBanksList();
  }, [activeTab, banks.length]);

  const handleResolve = async () => {
      if(accountNumber.length !== 10 || !selectedBankCode) return;
      setResolvingAccount(true);
      setAccountName('');
      try {
          const res = await resolveBankAccount(accountNumber, selectedBankCode);
          if(res.success && res.data && res.data.account_name) {
              setAccountName(res.data.account_name);
              toast.success("Verified!");
          } else {
              toast.error("Could not find account.");
          }
      } catch (e) {
          toast.error("Verification error");
      } finally {
          setResolvingAccount(false);
      }
  };

  const walletBalance = userProfile?.walletBalance || 0;
  const commissionBalance = userProfile?.commissionBalance || 0;
  const fundingAmount = parseFloat(amount) || 0;
  const paystackCharge = fundingAmount * 0.015; 
  const totalPaystackAmount = fundingAmount + paystackCharge;

  const handleAutoFundSuccess = async (reference: string) => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
        if (isFirebaseInitialized) {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { walletBalance: increment(fundingAmount), hasFunded: true });
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid, type: 'FUNDING', method: 'PAYSTACK', amount: fundingAmount, 
                description: 'Wallet Funding', status: 'SUCCESS', date: serverTimestamp(), reference: reference
            });
        }
        await refreshProfile();
        setAmount('');
        setReceiptData({ success: true, data: { message: "Wallet Funded", amount: fundingAmount, reference } });
    } catch (e) { toast.error("Update failed."); }
    finally { setIsProcessing(false); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || !amount || !manualProofFile) return;
      setManualLoading(true);
      setIsProcessing(true);
      try {
          const key = '6335530a0b22ceea3ae8c5699049bd5e'; 
          const formData = new FormData();
          formData.append('image', manualProofFile);
          const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (isFirebaseInitialized) {
             await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid, type: 'FUNDING', method: 'MANUAL', amount: parseFloat(amount),
                status: 'PENDING', date: serverTimestamp(), reference: manualRef, proofUrl: uploadData.data.url
             });
          }
          toast.success("Submitted for review!");
          setAmount('');
          setManualProofFile(null);
      } catch (error) { toast.error("Submission failed."); }
      finally { setManualLoading(false); setIsProcessing(false); }
  };

  const initiateWithdrawal = () => {
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0) return toast.error("Invalid amount");
      const bal = withdrawSource === 'COMMISSION' ? commissionBalance : walletBalance;
      if (amt > bal) return toast.error("Not enough funds.");
      if (withdrawDestination === 'BANK' && (!accountNumber || !selectedBankCode)) return toast.error("Enter bank details.");
      setShowPinModal(true);
  };

  const handleWithdraw = async () => {
      if (!currentUser) return;
      setWithdrawLoading(true);
      setShowPinModal(false);
      setIsProcessing(true);
      const amt = parseFloat(withdrawAmount);
      try {
          if (isFirebaseInitialized) {
              await runTransaction(db, async (transaction) => {
                  const userRef = doc(db, 'users', currentUser.uid);
                  if (withdrawSource === 'COMMISSION' && withdrawDestination === 'MAIN_WALLET') {
                      transaction.update(userRef, { commissionBalance: increment(-amt), walletBalance: increment(amt) });
                  } else if (withdrawSource === 'COMMISSION' && withdrawDestination === 'BANK') {
                      transaction.update(userRef, { commissionBalance: increment(-amt) });
                  } else if (withdrawSource === 'MAIN' && withdrawDestination === 'BANK') {
                      transaction.update(userRef, { walletBalance: increment(-amt) });
                  }
                  transaction.set(doc(collection(db, 'transactions')), {
                      userId: currentUser.uid, type: 'DEBIT', amount: amt, status: withdrawDestination === 'BANK' ? 'PENDING' : 'SUCCESS', 
                      date: serverTimestamp(), reference: `WDR-${Date.now()}`, description: 'Withdrawal'
                  });
              });
          }
          await refreshProfile();
          setWithdrawAmount('');
          toast.success(withdrawDestination === 'BANK' ? "Processing to bank." : "Moved to main wallet.");
      } catch (e) { toast.error("Failed."); }
      finally { setWithdrawLoading(false); setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20 text-left">
      <PinVerifyModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onVerified={handleWithdraw} title={`Confirm Withdrawal`} amount={withdrawAmount} />
      <ProcessingModal isOpen={isProcessing || (isLoading && activeTab === 'FUND')} text="Please wait..." />
      <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-8 rounded-3xl border border-blue-800/30 shadow-xl">
            <p className="text-slate-400 text-xs font-black uppercase mb-1">My Balance</p>
            <h1 className="text-4xl font-black text-white mb-2 font-mono">₦{walletBalance.toLocaleString()}</h1>
          </div>
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-8 rounded-3xl border border-emerald-800/30 shadow-xl">
            <p className="text-slate-400 text-xs font-black uppercase mb-1">My Earnings</p>
            <h1 className="text-4xl font-black text-white mb-2 font-mono">₦{commissionBalance.toLocaleString()}</h1>
          </div>
      </div>

      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button onClick={() => setActiveTab('FUND')} className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${activeTab === 'FUND' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Add Money</button>
        <button onClick={() => setActiveTab('WITHDRAW')} className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${activeTab === 'WITHDRAW' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Withdraw</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
         {activeTab === 'FUND' && (
            <div className="animate-fade-in">
               <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter italic">Choose Method</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                   <div onClick={() => setFundingMethod('AUTO')} className={`cursor-pointer p-6 rounded-3xl border-2 flex items-center space-x-4 transition-all ${fundingMethod === 'AUTO' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800'}`}>
                       <CreditCard className="w-6 h-6 text-blue-500" />
                       <p className="font-black text-white uppercase text-xs">Instant Payment</p>
                   </div>
                   <div onClick={() => setFundingMethod('MANUAL')} className={`cursor-pointer p-6 rounded-3xl border-2 flex items-center space-x-4 transition-all ${fundingMethod === 'MANUAL' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800'}`}>
                       <Wallet className="w-6 h-6 text-amber-500" />
                       <p className="font-black text-white uppercase text-xs">Bank Transfer</p>
                   </div>
               </div>

               {fundingMethod === 'AUTO' ? (
                   <div className="max-w-md mx-auto space-y-8">
                       <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 text-white text-3xl font-black text-center outline-none" />
                       {parseFloat(amount) >= 100 && (
                           <PaystackForm onSubmit={onSubmit} isLoading={isLoading} forcedAmount={totalPaystackAmount.toString()} onSuccess={handleAutoFundSuccess} userEmail={userProfile?.email || undefined} />
                       )}
                   </div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-left">
                           <p className="text-[10px] text-slate-500 font-black mb-4 uppercase">Pay to this account:</p>
                           <h4 className="text-xl font-black text-white mb-1 uppercase">Palmpay</h4>
                           <h2 className="text-4xl font-black text-blue-500 font-mono mb-4 tracking-tighter">8142452729</h2>
                           <p className="text-xs text-slate-400 font-bold">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                       </div>
                       <form onSubmit={handleManualSubmit} className="space-y-6">
                           <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount Paid" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold" required />
                           <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 transition-all">
                               <UploadCloud className="w-8 h-8 text-slate-700" />
                               <p className="text-[10px] text-slate-500 font-black uppercase mt-2">{manualProofFile ? manualProofFile.name : 'Upload Receipt'}</p>
                               <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setManualProofFile(e.target.files[0])} />
                           </label>
                           <button type="submit" disabled={manualLoading} className="w-full bg-blue-600 py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest">Submit for Review</button>
                       </form>
                   </div>
               )}
            </div>
         )}

         {activeTab === 'WITHDRAW' && (
             <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                 <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => setWithdrawSource('COMMISSION')} className={`p-6 rounded-3xl border-2 transition-all ${withdrawSource === 'COMMISSION' ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800'}`}>
                         <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Earnings</p>
                         <p className="text-2xl font-black text-white">₦{commissionBalance.toLocaleString()}</p>
                     </button>
                     <button onClick={() => setWithdrawSource('MAIN')} className={`p-6 rounded-3xl border-2 transition-all ${withdrawSource === 'MAIN' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800'}`}>
                         <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Wallet</p>
                         <p className="text-2xl font-black text-white">₦{walletBalance.toLocaleString()}</p>
                     </button>
                 </div>
                 <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setWithdrawDestination('MAIN_WALLET')} className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest ${withdrawDestination === 'MAIN_WALLET' ? 'bg-slate-800 border-white' : 'border-slate-800 text-slate-600'}`}>Main Wallet</button>
                        <button onClick={() => setWithdrawDestination('BANK')} className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest ${withdrawDestination === 'BANK' ? 'bg-slate-800 border-white' : 'border-slate-800 text-slate-600'}`}>Bank Account</button>
                     </div>
                     {withdrawDestination === 'BANK' && (
                         <div className="space-y-5 bg-slate-950 p-8 rounded-3xl border border-slate-800">
                             <select value={selectedBankCode} onChange={e => setSelectedBankCode(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none">
                                 <option value="">-- SELECT BANK --</option>
                                 {banks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                             </select>
                             <input type="text" maxLength={10} value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))} onBlur={handleResolve} placeholder="Account Number" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white font-black font-mono tracking-widest" />
                             {accountName && <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">{accountName}</p>}
                         </div>
                     )}
                     <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white font-black text-3xl text-center outline-none" />
                     <button onClick={initiateWithdrawal} disabled={withdrawLoading} className="w-full bg-blue-600 py-6 rounded-2xl text-white font-black uppercase tracking-widest text-xs active:scale-95 shadow-2xl transition-all">Withdraw Now</button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};