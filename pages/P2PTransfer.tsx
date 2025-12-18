
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Added increment to the imports
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ProcessingModal } from '../components/ProcessingModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { Search, Loader2, Send, ArrowRight, Wallet, Check, Building2, User, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBanks, resolveBankAccount } from '../services/api';

type TransferMode = 'P2P' | 'BANK';

export const P2PTransfer: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [mode, setMode] = useState<TransferMode>('P2P');
  
  const [p2pSearch, setP2pSearch] = useState('');
  const [p2pRecipient, setP2pRecipient] = useState<any>(null);
  const [isSearchingP2P, setIsSearchingP2P] = useState(false);

  const [banks, setBanks] = useState<any[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
      if (mode === 'BANK' && banks.length === 0) {
          getBanks().then(res => {
              if (res.success && res.data && Array.isArray(res.data.data)) {
                  setBanks(res.data.data);
              } else if (res.data?.data) {
                  setBanks(res.data.data);
              } else {
                  setBanks([{name: 'Opay', code: '999992'}, {name: 'Palmpay', code: '999991'}]);
              }
          });
      }
  }, [mode]);

  useEffect(() => {
      if (mode === 'BANK' && accountNumber.length === 10 && bankCode) {
          const resolve = async () => {
              setIsResolving(true);
              setAccountName('');
              try {
                  const res = await resolveBankAccount(accountNumber, bankCode);
                  // Fixed Bank Verification logic
                  const resolvedData = res.data?.data || res.data;
                  if (resolvedData?.account_name) {
                      setAccountName(resolvedData.account_name);
                      toast.success("Details Verified");
                  } else {
                      toast.error("Account not found");
                  }
              } catch (e) { toast.error("Verification failed"); }
              finally { setIsResolving(false); }
          };
          resolve();
      }
  }, [accountNumber, bankCode, mode]);

  const getFee = () => mode === 'P2P' ? 0 : 10;

  const handleP2PSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!p2pSearch) return;
      setIsSearchingP2P(true);
      setP2pRecipient(null);
      try {
          const isEmail = p2pSearch.includes('@');
          const q = query(collection(db, 'users'), where(isEmail ? 'email' : 'username', '==', p2pSearch.toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
              const d = snap.docs[0];
              if (d.id === currentUser?.uid) toast.error("Cannot send to self.");
              else setP2pRecipient({ id: d.id, ...d.data() });
          } else {
              toast.error("User not found.");
          }
      } catch (e) { toast.error("Error searching."); }
      finally { setIsSearchingP2P(false); }
  };

  const executeTransfer = async () => {
      if (!currentUser) return;
      setShowPin(false);
      setIsProcessing(true);
      const amt = parseFloat(amount);
      const total = amt + getFee();

      try {
          await runTransaction(db, async (txn) => {
              const senderRef = doc(db, 'users', currentUser.uid);
              const senderDoc = await txn.get(senderRef);
              if ((senderDoc.data()?.walletBalance || 0) < total) throw new Error("Low Balance.");
              txn.update(senderRef, { walletBalance: (senderDoc.data()?.walletBalance || 0) - total });
              
              if (mode === 'P2P' && p2pRecipient) {
                  const recRef = doc(db, 'users', p2pRecipient.id);
                  txn.update(recRef, { walletBalance: increment(amt) });
                  txn.set(doc(collection(db, 'transactions')), {
                      userId: p2pRecipient.id, type: 'CREDIT', amount: amt, description: `Received from ${userProfile?.username}`,
                      status: 'SUCCESS', date: serverTimestamp(), reference: `P2P-${Date.now()}`
                  });
              }

              txn.set(doc(collection(db, 'transactions')), {
                  userId: currentUser.uid, type: 'TRANSFER', amount: amt, fee: getFee(),
                  description: mode === 'P2P' ? `Sent to ${p2pRecipient.username}` : `Sent to ${accountName}`,
                  status: mode === 'P2P' ? 'SUCCESS' : 'PENDING', date: serverTimestamp(), reference: `TRF-${Date.now()}`
              });
          });

          await refreshProfile();
          setReceiptData({ success: true, data: { amount: amt, description: mode === 'P2P' ? `To ${p2pRecipient.username}` : `To ${accountName}` } });
          setAmount(''); setP2pRecipient(null); setAccountName(''); setAccountNumber('');
      } catch (e: any) { toast.error(e.message); }
      finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20 text-left">
        <TransactionPinModal isOpen={showPin} onClose={() => setShowPin(false)} onSuccess={executeTransfer} amount={parseFloat(amount) + getFee()} />
        <ProcessingModal isOpen={isProcessing} text="Transmitting Funds..." />
        <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

        <h1 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">Send Money</h1>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setMode('P2P')} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${mode === 'P2P' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>To OBATA User</button>
            <button onClick={() => setMode('BANK')} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all ${mode === 'BANK' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>To Bank Account</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            {mode === 'P2P' && (
                <div className="space-y-6">
                    {!p2pRecipient ? (
                        <form onSubmit={handleP2PSearch} className="relative">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Search by Username or Email</label>
                            <div className="flex gap-2">
                                <input type="text" value={p2pSearch} onChange={e => setP2pSearch(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none" placeholder="Enter identity..." />
                                <button type="submit" disabled={isSearchingP2P} className="bg-blue-600 px-8 rounded-2xl"><Search className="w-5 h-5 text-white" /></button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-slate-950 p-6 rounded-3xl flex items-center justify-between border border-slate-800">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">{p2pRecipient.username[0].toUpperCase()}</div>
                                <div><p className="font-black text-white uppercase">{p2pRecipient.username}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p2pRecipient.email}</p></div>
                            </div>
                            <button onClick={() => setP2pRecipient(null)} className="text-[10px] font-black text-rose-500 uppercase">Change</button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'BANK' && (
                <div className="space-y-6">
                    <select value={bankCode} onChange={e => setBankCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none">
                        <option value="">-- SELECT TARGET BANK --</option>
                        {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                    </select>
                    <div className="relative">
                        <input type="text" maxLength={10} value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black tracking-[0.2em]" placeholder="0123456789" />
                        {isResolving && <div className="absolute right-5 top-5"><Loader2 className="animate-spin text-blue-500" /></div>}
                    </div>
                    {accountName && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center">
                            <Check className="w-4 h-4 mr-3" /> NAME: <span className="text-white ml-2">{accountName}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-10 border-t border-slate-800 pt-8 space-y-8">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-3xl font-black outline-none" placeholder="₦ 0" />
                <button onClick={() => setShowPin(true)} disabled={!amount || (mode === 'P2P' && !p2pRecipient) || (mode === 'BANK' && !accountName)} className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-blue-600 shadow-2xl active:scale-95 disabled:opacity-30">Confirm Transfer</button>
            </div>
        </div>
    </div>
  );
};
