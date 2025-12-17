import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Wallet, Copy, Check, UploadCloud, Loader2, Building, RefreshCw } from 'lucide-react';
import { PaystackForm } from '../components/PaystackForm';
import { PinVerifyModal } from '../components/PinVerifyModal';
import { ApiConfig } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, increment, updateDoc, serverTimestamp, collection, addDoc, runTransaction } from 'firebase/firestore';
import { db } from '../services/firebase';
import { executeApiRequest } from '../services/api';

interface WalletPageProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type WalletTab = 'FUND' | 'WITHDRAW';
type FundingMethod = 'AUTO' | 'MANUAL';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || '';
  } catch {
    return '';
  }
};

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
  const [withdrawSource, setWithdrawSource] = useState<'MAIN' | 'COMMISSION'>('COMMISSION');
  const [withdrawDestination, setWithdrawDestination] = useState<'MAIN_WALLET' | 'BANK'>('MAIN_WALLET');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Bank States
  const [banks, setBanks] = useState<{name: string, code: string}[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);

  useEffect(() => {
      if (currentUser) {
          const uniqueRef = `MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`;
          setManualRef(uniqueRef);
      }
  }, [currentUser, fundingMethod]);

  // Fetch Banks
  useEffect(() => {
      const fetchBanks = async () => {
          // Fallback static list, can be replaced by an API call to Paystack/Bank list endpoint
          const staticBanks = [
              { name: 'Access Bank', code: '044' },
              { name: 'GTBank', code: '058' },
              { name: 'Zenith Bank', code: '057' },
              { name: 'UBA', code: '033' },
              { name: 'First Bank', code: '011' },
              { name: 'Kuda Bank', code: '50211' },
              { name: 'OPay', code: '999992' },
              { name: 'PalmPay', code: '999991' },
          ];
          setBanks(staticBanks);
      };
      fetchBanks();
  }, []);

  // Resolve Account
  const handleResolveAccount = async () => {
      if(accountNumber.length !== 10 || !selectedBankCode) return;
      setResolvingAccount(true);
      setAccountName('');
      
      try {
          const paystackSecret = getEnv('VITE_PAYSTACK_SECRET_KEY');
          if (!paystackSecret) {
               console.warn("Paystack Secret missing for resolution.");
               // In production client-side, we can't safely resolve without exposing secret or using a proxy.
               // Assuming user will type correct name or we rely on backend processing later.
               setResolvingAccount(false);
               return;
          }

          const res = await executeApiRequest({
              url: `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${selectedBankCode}`,
              method: 'GET',
              headers: [{ key: 'Authorization', value: `Bearer ${paystackSecret}` }]
          });

          if(res.success && res.data.status) {
              setAccountName(res.data.data.account_name);
          } else {
              setAccountName('');
              alert("Could not resolve account. Please check details.");
          }
      } catch (e) {
          alert("Error resolving account");
      } finally {
          setResolvingAccount(false);
      }
  };

  const walletBalance = userProfile?.walletBalance || 0;
  // @ts-ignore
  const commissionBalance = userProfile?.commissionBalance || 0;

  const fundingAmount = parseFloat(amount) || 0;
  const paystackCharge = fundingAmount * 0.015; 
  const totalPaystackAmount = fundingAmount + paystackCharge;

  const handleAutoFundSuccess = async () => {
    if (!currentUser) return;

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            walletBalance: increment(fundingAmount),
            hasFunded: true
        });

        await addDoc(collection(db, 'transactions'), {
            userId: currentUser.uid,
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
        alert("Error updating wallet.");
    }
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('image', file);
      // HARDCODED API KEY AS REQUESTED
      const key = '6335530a0b22ceea3ae8c5699049bd5e'; 
      
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
          const proofUrl = await uploadImageToImgBB(manualProofFile);
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

          alert("Funding Request Submitted! Admin will review.");
          setAmount('');
          setManualProofFile(null);
          setManualRef(`MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`);
      } catch (error: any) {
          alert("Submission failed: " + error.message);
      } finally {
          setManualLoading(false);
      }
  };

  const initiateWithdrawal = () => {
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0) {
          alert("Invalid amount");
          return;
      }
      
      const balance = withdrawSource === 'COMMISSION' ? commissionBalance : walletBalance;
      if (amt > balance) {
          alert("Insufficient balance.");
          return;
      }

      if (withdrawDestination === 'BANK' && (!accountNumber || !selectedBankCode)) {
          alert("Please enter bank details");
          return;
      }

      setShowPinModal(true);
  };

  const handleWithdraw = async () => {
      if (!currentUser) return;
      setWithdrawLoading(true);
      setShowPinModal(false);

      const amt = parseFloat(withdrawAmount);

      try {
          await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', currentUser.uid);
              
              if (withdrawSource === 'COMMISSION' && withdrawDestination === 'MAIN_WALLET') {
                  // Commission -> Wallet
                  transaction.update(userRef, {
                      commissionBalance: increment(-amt),
                      walletBalance: increment(amt)
                  });
              } else if (withdrawSource === 'COMMISSION' && withdrawDestination === 'BANK') {
                   // Commission -> Bank (Debit Commission)
                   transaction.update(userRef, {
                      commissionBalance: increment(-amt)
                  });
              } else if (withdrawSource === 'MAIN' && withdrawDestination === 'BANK') {
                   // Main -> Bank (Debit Main)
                   transaction.update(userRef, {
                      walletBalance: increment(-amt)
                  });
              }

              // Log Transaction
              const txnRef = doc(collection(db, 'transactions'));
              transaction.set(txnRef, {
                  userId: currentUser.uid,
                  type: 'DEBIT',
                  amount: amt,
                  description: `${withdrawSource} Withdrawal to ${withdrawDestination === 'BANK' ? 'Bank' : 'Main Wallet'}`,
                  status: withdrawDestination === 'BANK' ? 'PENDING' : 'SUCCESS', 
                  destination: withdrawDestination,
                  bankDetails: withdrawDestination === 'BANK' ? { bankCode: selectedBankCode, accountNumber, accountName } : null,
                  date: serverTimestamp()
              });
          });

          await refreshProfile();
          setWithdrawAmount('');
          alert(withdrawDestination === 'BANK' ? "Withdrawal placed! Processing to bank." : "Withdrawal successful!");

      } catch (e: any) {
          alert("Withdrawal failed: " + e.message);
      } finally {
          setWithdrawLoading(false);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PinVerifyModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onVerified={handleWithdraw}
          title={`Confirm Withdrawal`}
          amount={parseFloat(withdrawAmount)}
      />

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-6 rounded-2xl border border-blue-800 shadow-xl">
            <p className="text-slate-400 text-sm mb-1">Main Wallet Balance</p>
            <h1 className="text-4xl font-bold text-white mb-2">₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
            <div className="flex items-center text-xs text-blue-400"><Wallet className="w-3 h-3 mr-1" /> Available for Services</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-6 rounded-2xl border border-emerald-800 shadow-xl">
            <p className="text-slate-400 text-sm mb-1">Commission Balance</p>
            <h1 className="text-4xl font-bold text-white mb-2">₦{commissionBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
            <div className="flex items-center text-xs text-emerald-400"><ArrowUpRight className="w-3 h-3 mr-1" /> Earnings from Referrals & Sales</div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button onClick={() => setActiveTab('FUND')} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'FUND' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
           Fund Wallet
        </button>
        <button onClick={() => setActiveTab('WITHDRAW')} className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'WITHDRAW' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
           Withdraw Funds
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
                       {/* ... Paystack Form UI ... */}
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
                       </div>
                       <form onSubmit={handleManualSubmit} className="space-y-4">
                           {/* ... Manual Form ... */}
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
                               <label className="text-sm text-slate-400">Ref Code (Narration)</label>
                               <div className="flex">
                                   <input type="text" value={manualRef} readOnly className="flex-1 bg-slate-950 border border-slate-700 rounded-l-lg p-3 text-slate-300 font-mono text-xs" />
                                   <button type="button" onClick={() => navigator.clipboard.writeText(manualRef)} className="bg-slate-800 px-3 rounded-r-lg border border-l-0 border-slate-700"><Copy className="w-4 h-4" /></button>
                               </div>
                           </div>
                           <div>
                               <label className="text-sm text-slate-400 mb-2 block">Upload Receipt</label>
                               <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer bg-slate-950 hover:bg-slate-900 transition-colors">
                                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                       {manualProofFile ? <Check className="w-8 h-8 text-green-500" /> : <UploadCloud className="w-8 h-8 text-slate-400" />}
                                       <p className="text-xs text-slate-500 mt-2">{manualProofFile ? manualProofFile.name : 'Click to Upload'}</p>
                                   </div>
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setManualProofFile(e.target.files[0])} />
                               </label>
                           </div>
                           <button type="submit" disabled={manualLoading} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center">
                               {manualLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Proof'}
                           </button>
                       </form>
                   </div>
               )}
            </div>
         )}

         {activeTab === 'WITHDRAW' && (
             <div className="max-w-xl mx-auto space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                     <button 
                         onClick={() => setWithdrawSource('COMMISSION')}
                         className={`p-4 rounded-xl border ${withdrawSource === 'COMMISSION' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                     >
                         <div className="font-bold text-xs uppercase mb-1">From Commission</div>
                         <div className="text-xl font-bold">₦{commissionBalance.toLocaleString()}</div>
                     </button>
                     <button 
                         onClick={() => setWithdrawSource('MAIN')}
                         className={`p-4 rounded-xl border ${withdrawSource === 'MAIN' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                     >
                         <div className="font-bold text-xs uppercase mb-1">From Main Wallet</div>
                         <div className="text-xl font-bold">₦{walletBalance.toLocaleString()}</div>
                     </button>
                 </div>

                 <div className="space-y-4">
                     <div>
                         <label className="text-sm text-slate-400 block mb-2">Withdraw To</label>
                         <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => setWithdrawDestination('MAIN_WALLET')}
                                className={`p-3 rounded-lg border text-sm font-bold ${withdrawDestination === 'MAIN_WALLET' ? 'bg-slate-800 border-white text-white' : 'border-slate-800 text-slate-400'}`}
                             >
                                 Main Wallet
                             </button>
                             <button 
                                onClick={() => setWithdrawDestination('BANK')}
                                className={`p-3 rounded-lg border text-sm font-bold ${withdrawDestination === 'BANK' ? 'bg-slate-800 border-white text-white' : 'border-slate-800 text-slate-400'}`}
                             >
                                 Bank Account
                             </button>
                         </div>
                     </div>

                     {withdrawDestination === 'BANK' && (
                         <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <div>
                                 <label className="text-xs text-slate-500 block mb-1">Select Bank</label>
                                 <select 
                                     value={selectedBankCode} 
                                     onChange={(e) => setSelectedBankCode(e.target.value)}
                                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                                 >
                                     <option value="">-- Choose Bank --</option>
                                     {banks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs text-slate-500 block mb-1">Account Number</label>
                                 <div className="relative">
                                     <input 
                                         type="text" 
                                         maxLength={10}
                                         value={accountNumber}
                                         onChange={(e) => setAccountNumber(e.target.value)}
                                         onBlur={handleResolveAccount}
                                         className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                                         placeholder="0123456789"
                                     />
                                     {resolvingAccount && <div className="absolute right-3 top-3.5"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>}
                                 </div>
                             </div>
                             {accountName && (
                                 <div className="flex items-center text-green-400 text-sm bg-green-500/10 p-2 rounded">
                                     <Check className="w-4 h-4 mr-2" /> {accountName}
                                 </div>
                             )}
                         </div>
                     )}

                     <div>
                         <label className="text-sm text-slate-400 block mb-2">Amount</label>
                         <input 
                            type="number" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-bold text-lg"
                            placeholder="0.00"
                         />
                     </div>

                     <button 
                        onClick={initiateWithdrawal}
                        disabled={withdrawLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors"
                     >
                         {withdrawLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Withdrawal'}
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};