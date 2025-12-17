import React, { useState } from 'react';
import { CreditCard, Wallet, Copy, UploadCloud, Loader2, CheckCircle, ArrowRight, Zap, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PaystackForm } from '../components/PaystackForm';
import { ProcessingModal } from '../components/ProcessingModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { uploadImageToImgBB } from '../services/api';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';

export const FundWallet: React.FC = () => {
  const { currentUser, refreshProfile, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'AUTO' | 'MANUAL'>('AUTO');
  
  // States
  const [amount, setAmount] = useState('');
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Calculation Logic for Auto Funding
  const fundingAmount = parseFloat(amount) || 0;
  // Charge is 2% (2 Naira per 100 Naira)
  const charge = Math.ceil(fundingAmount * 0.02); 
  const totalToPay = fundingAmount + charge;

  const handlePaystackSuccess = async (reference: string) => {
      if (!currentUser) return;
      setLoading(true);
      try {
          // Backend verification should happen here usually.
          // We credit the PRINCIPAL amount (user gets what they asked for, they paid extra for charge).
          await updateDoc(doc(db, 'users', currentUser.uid), { walletBalance: increment(fundingAmount), hasFunded: true });
          
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid,
              type: 'FUNDING',
              amount: fundingAmount, // Credit amount
              charge: charge, // Fee paid
              totalPaid: totalToPay,
              status: 'SUCCESS',
              method: 'PAYSTACK',
              reference: reference,
              description: 'Wallet Funding via Paystack',
              date: serverTimestamp()
          });
          
          await refreshProfile();
          setAmount('');
          
          setReceiptData({
              success: true,
              data: {
                  message: `Wallet Funded with ₦${fundingAmount}`,
                  amount: fundingAmount,
                  reference: reference
              }
          });
      } catch (e) { 
          console.error(e);
          toast.error("Error crediting wallet. Ref: " + reference);
      } finally {
          setLoading(false);
      }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualFile || !currentUser) return;
      setLoading(true);

      try {
          const proofUrl = await uploadImageToImgBB(manualFile);
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid,
              userEmail: userProfile?.email,
              type: 'FUNDING',
              amount: fundingAmount,
              status: 'PENDING',
              method: 'MANUAL',
              proofUrl,
              description: 'Manual Bank Transfer Funding',
              date: serverTimestamp()
          });
          
          toast.success("Proof submitted successfully! Admin will verify.");
          setAmount('');
          setManualFile(null);
      } catch (e: any) {
          toast.error("Error: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
        <ProcessingModal isOpen={loading} text="Processing Funding..." />
        <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">Fund Your Wallet</h1>
            <p className="text-slate-400">Choose a method to add funds instantly.</p>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={() => setActiveTab('AUTO')}
                className={`p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group ${activeTab === 'AUTO' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
            >
                <div className={`absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${activeTab === 'AUTO' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Zap className="w-6 h-6" />
                    </div>
                    {activeTab === 'AUTO' && <CheckCircle className="w-6 h-6 text-blue-500" />}
                </div>
                <h3 className={`text-xl font-bold mb-1 ${activeTab === 'AUTO' ? 'text-white' : 'text-slate-300'}`}>Instant Funding</h3>
                <p className="text-xs text-slate-500">Cards, USSD, Bank Transfer via Paystack. Automated credit.</p>
            </button>

            <button 
                onClick={() => setActiveTab('MANUAL')}
                className={`p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group ${activeTab === 'MANUAL' ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
            >
                <div className={`absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${activeTab === 'MANUAL' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Building2 className="w-6 h-6" />
                    </div>
                    {activeTab === 'MANUAL' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                </div>
                <h3 className={`text-xl font-bold mb-1 ${activeTab === 'MANUAL' ? 'text-white' : 'text-slate-300'}`}>Manual Transfer</h3>
                <p className="text-xs text-slate-500">Direct transfer to our account. 0% fees. Admin verification required.</p>
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {activeTab === 'AUTO' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white">How much to fund?</h3>
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Amount to Credit (₦)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-4 text-slate-500 font-bold">₦</span>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-4 text-white text-2xl font-bold focus:border-blue-500 transition-colors"
                                    placeholder="1000"
                                />
                            </div>
                        </div>

                        {fundingAmount > 0 && (
                            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Amount to Wallet</span>
                                    <span className="text-white font-bold">₦{fundingAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Transaction Fee (2%)</span>
                                    <span className="text-amber-500 font-bold">+ ₦{charge.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-slate-800 pt-3 mt-2 flex justify-between items-center">
                                    <span className="text-slate-300 font-bold">Total Payable</span>
                                    <span className="text-2xl font-bold text-emerald-400">₦{totalToPay.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 md:pl-12 pt-8 md:pt-0">
                        {fundingAmount >= 100 ? (
                            <PaystackForm 
                                onSubmit={() => {}}
                                isLoading={loading}
                                forcedAmount={totalToPay.toString()} // Pass Total
                                forcedAction="INITIALIZE"
                                onSuccess={handlePaystackSuccess}
                                title="Fund Wallet"
                                userEmail={userProfile?.email || undefined}
                            />
                        ) : (
                            <div className="text-center text-slate-500">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Enter an amount of at least ₦100 to proceed.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-white/10">
                         <div className="relative z-10">
                             <p className="text-xs text-purple-200 font-bold uppercase mb-4 tracking-widest">Official Bank Account</p>
                             <div className="mb-6">
                                <p className="text-sm opacity-80 mb-1">Bank Name</p>
                                <h3 className="text-2xl font-bold">PALMPAY</h3>
                             </div>
                             <div className="mb-6">
                                <p className="text-sm opacity-80 mb-1">Account Number</p>
                                <div className="flex items-center space-x-3">
                                    <span className="text-4xl font-mono font-bold tracking-wider">8142452729</span>
                                    <button onClick={() => navigator.clipboard.writeText('8142452729')} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"><Copy className="w-5 h-5" /></button>
                                </div>
                             </div>
                             <div>
                                <p className="text-sm opacity-80 mb-1">Account Name</p>
                                <p className="font-bold text-lg uppercase">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                             </div>
                         </div>
                         <div className="absolute -bottom-10 -right-10 opacity-10">
                             <Building2 className="w-64 h-64" />
                         </div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Upload Proof</h3>
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase block mb-2">Amount Sent</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs font-bold uppercase block mb-2">Payment Receipt</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors bg-slate-950/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {manualFile ? (
                                        <>
                                            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                                            <p className="text-sm text-emerald-400 font-bold">{manualFile.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
                                            <p className="text-sm text-slate-400">Click to upload screenshot</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setManualFile(e.target.files[0])} />
                            </label>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !manualFile || !amount}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
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