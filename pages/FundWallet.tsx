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
  const [amount, setAmount] = useState('');
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const fundingAmount = parseFloat(amount) || 0;
  const charge = Math.ceil(fundingAmount * 0.02); 
  const totalToPay = fundingAmount + charge;

  const handlePaystackSuccess = async (reference: string) => {
      if (!currentUser) return;
      setLoading(true);
      try {
          await updateDoc(doc(db, 'users', currentUser.uid), { walletBalance: increment(fundingAmount), hasFunded: true });
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid, type: 'FUNDING', amount: fundingAmount, charge, totalPaid: totalToPay, status: 'SUCCESS',
              method: 'PAYSTACK', reference, description: 'Wallet Funded Successfully', date: serverTimestamp()
          });
          await refreshProfile();
          setAmount('');
          setReceiptData({ success: true, data: { amount: fundingAmount, reference, description: 'Instant Wallet Funding' } });
      } catch (e) { toast.error("Funding Error."); }
      finally { setLoading(false); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualFile || !currentUser || !amount) return;
      setLoading(true);
      try {
          const proofUrl = await uploadImageToImgBB(manualFile);
          await addDoc(collection(db, 'transactions'), {
              userId: currentUser.uid, userEmail: userProfile?.email, type: 'FUNDING', amount: parseFloat(amount),
              status: 'PENDING', method: 'MANUAL', proofUrl, description: 'Manual Funding Request', date: serverTimestamp()
          });
          toast.success("Submitted for review!");
          setAmount('');
          setManualFile(null);
      } catch (e: any) { toast.error("Failed."); }
      finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up pb-20">
        <ProcessingModal isOpen={loading} text="Securing Funds..." />
        <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

        <div className="text-left px-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Add Money</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Select your preferred funding method</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setActiveTab('AUTO')} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left ${activeTab === 'AUTO' ? 'bg-blue-600/10 border-blue-500 shadow-2xl' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                <Zap className={`w-8 h-8 mb-6 ${activeTab === 'AUTO' ? 'text-blue-400' : 'text-slate-500'}`} />
                <h3 className="text-xl font-black text-white uppercase italic">Instant Payment</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Cards & USSD • 2% Fee</p>
            </button>
            <button onClick={() => setActiveTab('MANUAL')} className={`p-8 rounded-[2.5rem] border-2 transition-all text-left ${activeTab === 'MANUAL' ? 'bg-emerald-600/10 border-emerald-500 shadow-2xl' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                <Building2 className={`w-8 h-8 mb-6 ${activeTab === 'MANUAL' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <h3 className="text-xl font-black text-white uppercase italic">Bank Transfer</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Direct Bank App • 0% Fee</p>
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            {activeTab === 'AUTO' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Funding Amount (₦)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-3xl font-black text-white outline-none focus:border-blue-500" placeholder="0" />
                        {fundingAmount > 0 && (
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 font-bold text-xs uppercase tracking-widest">
                                <div className="flex justify-between text-slate-500"><span>Principal</span><span>₦{fundingAmount}</span></div>
                                <div className="flex justify-between text-rose-500"><span>System Fee</span><span>+ ₦{charge}</span></div>
                                <div className="flex justify-between text-white border-t border-slate-800 pt-3 text-lg font-black"><span>Total</span><span>₦{totalToPay}</span></div>
                            </div>
                        )}
                    </div>
                    <div className="pt-8 md:pt-0">
                        {fundingAmount >= 100 ? (
                            <PaystackForm onSubmit={() => {}} isLoading={loading} forcedAmount={totalToPay.toString()} onSuccess={handlePaystackSuccess} userEmail={userProfile?.email || undefined} />
                        ) : (
                            <div className="text-center py-10 opacity-30">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Minimum ₦100 Required</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-slate-950 p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden">
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">Official Account</p>
                        <h4 className="text-2xl font-black text-white italic mb-1 uppercase">Palmpay</h4>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-4xl font-black text-white font-mono tracking-tighter">8142452729</span>
                            <button onClick={() => {navigator.clipboard.writeText('8142452729'); toast.success("Copied!");}} className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                        <Building2 className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5" />
                    </div>
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount Paid" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black" required />
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-950 transition-all">
                            {manualFile ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <UploadCloud className="w-10 h-10 text-slate-700" />}
                            <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-500">{manualFile ? manualFile.name : 'Upload Payment Receipt'}</p>
                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setManualFile(e.target.files[0])} />
                        </label>
                        <button type="submit" disabled={loading || !manualFile} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all">Verify My Payment</button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};