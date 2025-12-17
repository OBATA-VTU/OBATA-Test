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
  const [banksLoading, setBanksLoading] = useState(false);

  // Modal States
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
      if (currentUser) {
          const uniqueRef = `MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`;
          setManualRef(uniqueRef);
      }
  }, [currentUser, fundingMethod]);

  // Fetch Banks from API Proxy
  useEffect(() => {
      const fetchBanksList = async () => {
          if (activeTab === 'WITHDRAW' && banks.length === 0) {
              setBanksLoading(true);
              try {
                  const res = await getBanks();
                  if (res.success && Array.isArray(res.data)) {
                      setBanks(res.data);
                  } else {
                      toast.error("Failed to fetch live banks. Using common list.");
                      // Fallback
                      setBanks([
                          { name: 'Access Bank', code: '044' },
                          { name: 'GTBank', code: '058' },
                          { name: 'Zenith Bank', code: '057' },
                          { name: 'UBA', code: '033' },
                          { name: 'First Bank', code: '011' },
                          { name: 'Kuda Bank', code: '50211' },
                          { name: 'OPay', code: '999992' },
                          { name: 'PalmPay', code: '999991' },
                      ]);
                  }
              } catch (e) {
                  toast.error("Bank service unavailable.");
              } finally {
                  setBanksLoading(false);
              }
          }
      };
      fetchBanksList();
  }, [activeTab]);

  // Resolve Account
  const handleResolve = async () => {
      if(accountNumber.length !== 10 || !selectedBankCode) return;
      setResolvingAccount(true);
      setAccountName('');
      
      try {
          const res = await resolveBankAccount(accountNumber, selectedBankCode);
          if(res.success && res.data) {
              setAccountName(res.data.account_name);
              toast.success("Account verified!");
          } else {
              setAccountName('');
              toast.error(res.error || "Could not resolve account.");
          }
      } catch (e) {
          toast.error("Error resolving account");
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
                reference: reference
            });
        }

        await refreshProfile();
        setAmount('');
        setReceiptData({
            success: true,
            data: {
                message: "Wallet Funded Successfully",
                amount: fundingAmount,
                reference: reference
            }
        });
    } catch (e) {
        console.error(e);
        toast.error("Error updating wallet.");
    } finally {
        setIsProcessing(false);
    }
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
          
          const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
              method: 'POST',
              body: formData
          });
          const uploadData = await uploadRes.json();
          const proofUrl = uploadData.data.url;

          if (isFirebaseInitialized) {
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
          }

          toast.success("Funding Request Submitted! Admin will review.");
          setAmount('');
          setManualProofFile(null);
          setManualRef(`MAN-${currentUser.uid.substring(0,4).toUpperCase()}-${Date.now().toString().substring(6)}`);
      } catch (error: any) {
          toast.error("Submission failed: " + error.message);
      } finally {
          setManualLoading(false);
          setIsProcessing(false);
      }
  };

  const initiateWithdrawal = () => {
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0) {
          toast.error("Invalid amount");
          return;
      }
      
      const balance = withdrawSource === 'COMMISSION' ? commissionBalance : walletBalance;
      if (amt > balance) {
          toast.error("Insufficient balance.");
          return;
      }

      if (withdrawDestination === 'BANK' && (!accountNumber || !selectedBankCode)) {
          toast.error("Please enter bank details");
          return;
      }

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
                      transaction.update(userRef, {
                          commissionBalance: increment(-amt),
                          walletBalance: increment(amt)
                      });
                  } else if (withdrawSource === 'COMMISSION' && withdrawDestination === 'BANK') {
                      transaction.update(userRef, {
                          commissionBalance: increment(-amt)
                      });
                  } else if (withdrawSource === 'MAIN' && withdrawDestination === 'BANK') {
                      transaction.update(userRef, {
                          walletBalance: increment(-amt)
                      });
                  }

                  const txnRef = doc(collection(db, 'transactions'));
                  transaction.set(txnRef, {
                      userId: currentUser.uid,
                      type: 'DEBIT',
                      amount: amt,
                      description: `${withdrawSource} Withdrawal to ${withdrawDestination === 'BANK' ? 'Bank' : 'Main Wallet'}`,
                      status: withdrawDestination === 'BANK' ? 'PENDING' : 'SUCCESS', 
                      destination: withdrawDestination,
                      bankDetails: withdrawDestination === 'BANK' ? { bankCode: selectedBankCode, accountNumber, accountName } : null,
                      date: serverTimestamp(),
                      reference: `WDR-${Date.now()}`
                  });
              });
          }

          await refreshProfile();
          setWithdrawAmount('');
          
          if (withdrawDestination === 'MAIN_WALLET') {
              setReceiptData({
                  success: true,
                  data: {
                      message: "Withdrawal to Main Wallet Successful",
                      amount: amt,
                      reference: `WDR-${Date.now()}`
                  }
              });
          } else {
              toast.success("Withdrawal placed! Processing to bank.");
          }

      } catch (e: any) {
          toast.error("Withdrawal failed: " + e.message);
      } finally {
          setWithdrawLoading(false);
          setIsProcessing(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20">
      <PinVerifyModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onVerified={handleWithdraw}
          title={`Confirm Withdrawal`}
          amount={parseFloat(withdrawAmount).toString()}
      />
      <ProcessingModal isOpen={isProcessing || (isLoading && activeTab === 'FUND')} text={activeTab === 'FUND' ? "Processing Funding..." : "Processing Withdrawal..."} />
      <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-8 rounded-[2rem] border border-blue-800/30 shadow-xl">
            <p className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-wider">Main Balance</p>
            <h1 className="text-4xl font-black text-white mb-2 font-mono">₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
            <div className="flex items-center text-xs text-blue-400 font-bold bg-blue-500/10 w-fit px-2 py-1 rounded"><Wallet className="w-3 h-3 mr-1.5" /> For Services</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-8 rounded-[2rem] border border-emerald-800/30 shadow-xl">
            <p className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-wider">Commissions</p>
            <h1 className="text-4xl font-black text-white mb-2 font-mono">₦{commissionBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
            <div className="flex items-center text-xs text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded"><ArrowUpRight className="w-3 h-3 mr-1.5" /> Referral Earnings</div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button onClick={() => setActiveTab('FUND')} className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'FUND' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}>
           Fund Wallet
        </button>
        <button onClick={() => setActiveTab('WITHDRAW')} className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'WITHDRAW' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}>
           Withdraw Funds
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
         {activeTab === 'FUND' && (
            <div className="animate-fade-in">
               <h3 className="text-2xl font-bold text-white mb-8">Select Method</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                   <div 
                      onClick={() => setFundingMethod('AUTO')}
                      className={`cursor-pointer p-6 rounded-3xl border-2 flex items-center space-x-4 transition-all duration-300 ${fundingMethod === 'AUTO' ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                   >
                       <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20"><CreditCard className="w-6 h-6" /></div>
                       <div>
                           <p className="font-black text-white">Instant Funding</p>
                           <p className="text-xs text-slate-500">Auto-credit via Paystack.</p>
                       </div>
                   </div>
                   <div 
                      onClick={() => setFundingMethod('MANUAL')}
                      className={`cursor-pointer p-6 rounded-3xl border-2 flex items-center space-x-4 transition-all duration-300 ${fundingMethod === 'MANUAL' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                   >
                       <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-500/20"><Wallet className="w-6 h-6" /></div>
                       <div>
                           <p className="font-black text-white">Manual Transfer</p>
                           <p className="text-xs text-slate-500">0% Fees. Bank Deposit.</p>
                       </div>
                   </div>
               </div>

               {fundingMethod === 'AUTO' ? (
                   <div className="max-w-md mx-auto space-y-8">
                       <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                           <p className="text-xs text-slate-500 font-bold uppercase mb-3 tracking-widest text-center">Amount to Fund</p>
                           <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-500">₦</span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-10 pr-4 py-5 text-white text-3xl font-black focus:border-blue-500 outline-none text-center font-mono"
                                />
                           </div>
                           
                           {fundingAmount >= 100 && (
                               <div className="mt-8 pt-8 border-t border-slate-800 space-y-3">
                                   <div className="flex justify-between text-sm">
                                       <span className="text-slate-500 font-medium">Standard Processing Fee (1.5%)</span>
                                       <span className="text-rose-400 font-bold">₦{paystackCharge.toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between text-white font-black text-xl pt-2">
                                       <span>Total Payable</span>
                                       <span className="text-emerald-400">₦{totalPaystackAmount.toLocaleString()}</span>
                                   </div>
                               </div>
                           )}
                       </div>

                       {fundingAmount >= 100 ? (
                           <PaystackForm 
                               onSubmit={onSubmit} 
                               isLoading={isLoading} 
                               forcedAmount={totalPaystackAmount.toString()}
                               forcedAction="INITIALIZE"
                               title={`Wallet Funding`}
                               onSuccess={(ref) => handleAutoFundSuccess(ref)}
                               userEmail={userProfile?.email || undefined}
                           />
                       ) : (
                           <p className="text-center text-slate-500 text-sm italic">Minimum funding amount is ₦100</p>
                       )}
                   </div>
               ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       <div className="bg-slate-950 rounded-3xl p-8 border border-slate-800">
                           <h4 className="font-black text-white mb-6 uppercase tracking-wider text-sm flex items-center"><Building className="w-4 h-4 mr-2 text-blue-500" /> Bank Details</h4>
                           <div className="space-y-6">
                               <div>
                                   <p className="text-xs text-slate-500 font-bold uppercase mb-1">Bank Provider</p>
                                   <p className="font-black text-white text-xl">PALMPAY</p>
                               </div>
                               <div>
                                   <p className="text-xs text-slate-500 font-bold uppercase mb-1">AccountNumber</p>
                                   <div className="flex items-center space-x-3">
                                       <p className="font-black text-white text-3xl tracking-tighter text-blue-500 font-mono">8142452729</p>
                                       <button onClick={() => { navigator.clipboard.writeText('8142452729'); toast.success("Copied!"); }} className="bg-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                                   </div>
                               </div>
                               <div>
                                   <p className="text-xs text-slate-500 font-bold uppercase mb-1">Recipient Name</p>
                                   <p className="font-bold text-slate-300">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                               </div>
                           </div>
                       </div>
                       <form onSubmit={handleManualSubmit} className="space-y-6">
                           <div>
                               <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Amount Paid</label>
                               <input 
                                  type="number" 
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold"
                                  placeholder="5000"
                                  required
                               />
                           </div>
                           <div>
                               <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Reference Code</label>
                               <div className="flex">
                                   <input type="text" value={manualRef} readOnly className="flex-1 bg-slate-950 border border-slate-800 rounded-l-2xl p-4 text-slate-400 font-mono text-sm" />
                                   <button type="button" onClick={() => { navigator.clipboard.writeText(manualRef); toast.success("Copied!"); }} className="bg-slate-800 px-4 rounded-r-2xl border border-l-0 border-slate-800"><Copy className="w-4 h-4" /></button>
                               </div>
                           </div>
                           <div>
                               <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Upload Receipt Image</label>
                               <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-3xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 transition-all group">
                                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                       {manualProofFile ? <Check className="w-8 h-8 text-emerald-500" /> : <UploadCloud className="w-8 h-8 text-slate-600 group-hover:text-blue-500 transition-colors" />}
                                       <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{manualProofFile ? manualProofFile.name : 'Choose File'}</p>
                                   </div>
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setManualProofFile(e.target.files[0])} />
                               </label>
                           </div>
                           <button type="submit" disabled={manualLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                               {manualLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'SUBMIT PROOF'}
                           </button>
                       </form>
                   </div>
               )}
            </div>
         )}

         {activeTab === 'WITHDRAW' && (
             <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                 <div className="grid grid-cols-2 gap-4">
                     <button 
                         onClick={() => setWithdrawSource('COMMISSION')}
                         className={`p-6 rounded-3xl border-2 transition-all duration-300 ${withdrawSource === 'COMMISSION' ? 'bg-emerald-500/5 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                     >
                         <div className="font-bold text-xs uppercase mb-2">FROM COMMISSIONS</div>
                         <div className="text-2xl font-black font-mono">₦{commissionBalance.toLocaleString()}</div>
                     </button>
                     <button 
                         onClick={() => setWithdrawSource('MAIN')}
                         className={`p-6 rounded-3xl border-2 transition-all duration-300 ${withdrawSource === 'MAIN' ? 'bg-blue-500/5 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                     >
                         <div className="font-bold text-xs uppercase mb-2">FROM WALLET</div>
                         <div className="text-2xl font-black font-mono">₦{walletBalance.toLocaleString()}</div>
                     </button>
                 </div>

                 <div className="space-y-6">
                     <div>
                         <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-4 text-center">Withdraw Destination</label>
                         <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => setWithdrawDestination('MAIN_WALLET')}
                                className={`py-4 rounded-2xl border-2 text-sm font-black transition-all ${withdrawDestination === 'MAIN_WALLET' ? 'bg-slate-800 border-white text-white' : 'border-slate-800 text-slate-600 hover:text-white'}`}
                             >
                                 Main Wallet
                             </button>
                             <button 
                                onClick={() => setWithdrawDestination('BANK')}
                                className={`py-4 rounded-2xl border-2 text-sm font-black transition-all ${withdrawDestination === 'BANK' ? 'bg-slate-800 border-white text-white' : 'border-slate-800 text-slate-600 hover:text-white'}`}
                             >
                                 Bank Account
                             </button>
                         </div>
                     </div>

                     {withdrawDestination === 'BANK' && (
                         <div className="space-y-5 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                             <div>
                                 <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Bank Choice</label>
                                 <div className="relative">
                                     <select 
                                         value={selectedBankCode} 
                                         onChange={(e) => setSelectedBankCode(e.target.value)}
                                         className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 appearance-none"
                                     >
                                         <option value="">-- {banksLoading ? 'Fetching Banks...' : 'Select Bank'} --</option>
                                         {banks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                                     </select>
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                         {banksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                     </div>
                                 </div>
                             </div>
                             <div>
                                 <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Account No</label>
                                 <div className="relative">
                                     <input 
                                         type="text" 
                                         maxLength={10}
                                         value={accountNumber}
                                         onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                         onBlur={handleResolve}
                                         className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white font-black tracking-widest focus:border-blue-500 outline-none font-mono"
                                         placeholder="0123456789"
                                     />
                                     {resolvingAccount && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>}
                                 </div>
                             </div>
                             {accountName && (
                                 <div className="flex items-center text-emerald-400 text-sm font-black bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                                     <Check className="w-4 h-4 mr-2" /> {accountName}
                                 </div>
                             )}
                         </div>
                     )}

                     <div>
                         <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Withdraw Amount</label>
                         <input 
                            type="number" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-2xl outline-none focus:border-blue-500 transition-all font-mono"
                            placeholder="0.00"
                         />
                     </div>

                     <button 
                        onClick={initiateWithdrawal}
                        disabled={withdrawLoading || banksLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                     >
                         {withdrawLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'EXECUTE WITHDRAWAL'}
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};