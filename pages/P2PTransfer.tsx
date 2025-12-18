import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { ProcessingModal } from '../components/ProcessingModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { Search, Loader2, Send, ArrowRight, Wallet, Check, Building2, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBanks, resolveBankAccount } from '../services/api';

type TransferMode = 'P2P' | 'BANK';

export const P2PTransfer: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [mode, setMode] = useState<TransferMode>('P2P');
  
  // P2P State
  const [p2pSearch, setP2pSearch] = useState('');
  const [p2pRecipient, setP2pRecipient] = useState<any>(null);
  const [isSearchingP2P, setIsSearchingP2P] = useState(false);

  // Bank State
  const [banks, setBanks] = useState<any[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Common State
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Load Banks
  useEffect(() => {
      if (mode === 'BANK' && banks.length === 0) {
          getBanks().then(res => {
              // Fix: Correctly extracting array from nested API response
              if (res.success && res.data && Array.isArray(res.data.data)) {
                  setBanks(res.data.data);
              } else {
                  toast.error("Failed to load live bank list");
                  // Static fallback for emergency
                  setBanks([{name: 'Opay', code: '999992'}, {name: 'Palmpay', code: '999991'}]);
              }
          });
      }
  }, [mode, banks.length]);

  // Resolve Account Effect
  useEffect(() => {
      if (mode === 'BANK' && accountNumber.length === 10 && bankCode) {
          const resolve = async () => {
              setIsResolving(true);
              setAccountName('');
              const res = await resolveBankAccount(accountNumber, bankCode);
              setIsResolving(false);
              if (res.success && res.data && res.data.account_name) {
                  setAccountName(res.data.account_name);
                  toast.success("Account Verified");
              } else {
                  toast.error("Could not verify account details");
              }
          };
          resolve();
      } else {
          setAccountName('');
      }
  }, [accountNumber, bankCode, mode]);

  const getFee = () => {
      if (mode === 'P2P') return 0;
      const selectedBank = banks.find(b => b.code === bankCode)?.name?.toLowerCase() || '';
      if (selectedBank.includes('opay') || selectedBank.includes('palmpay')) return 0;
      return 10;
  };

  const handleP2PSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!p2pSearch) return;
      setIsSearchingP2P(true);
      setP2pRecipient(null);
      try {
          let q = query(collection(db, 'users'), where('username', '==', p2pSearch.toLowerCase()));
          let snap = await getDocs(q);
          if (snap.empty) {
              q = query(collection(db, 'users'), where('email', '==', p2pSearch.toLowerCase()));
              snap = await getDocs(q);
          }

          if (!snap.empty) {
              const doc = snap.docs[0];
              if (doc.id === currentUser?.uid) toast.error("You cannot send money to yourself.");
              else setP2pRecipient({ id: doc.id, ...doc.data() });
          } else {
              toast.error("Account not found.");
          }
      } catch (e) { toast.error("Search failed"); }
      finally { setIsSearchingP2P(false); }
  };

  const executeTransfer = async () => {
      if (!currentUser) return;
      setShowPin(false);
      setIsProcessing(true);
      const amt = parseFloat(amount);
      const fee = getFee();
      const total = amt + fee;

      try {
          await runTransaction(db, async (txn) => {
              const senderRef = doc(db, 'users', currentUser.uid);
              const senderDoc = await txn.get(senderRef);
              if ((senderDoc.data()?.walletBalance || 0) < total) throw new Error("Not enough money in wallet.");

              txn.update(senderRef, { walletBalance: (senderDoc.data()?.walletBalance || 0) - total });

              const ref = `TRF-${Date.now()}`;

              if (mode === 'P2P' && p2pRecipient) {
                  const recRef = doc(db, 'users', p2pRecipient.id);
                  const recDoc = await txn.get(recRef);
                  txn.update(recRef, { walletBalance: (recDoc.data()?.walletBalance || 0) + amt });
                  
                  txn.set(doc(collection(db, 'transactions')), {
                      userId: p2pRecipient.id,
                      type: 'CREDIT',
                      amount: amt,
                      description: `Money received from ${userProfile?.username}`,
                      status: 'SUCCESS',
                      date: serverTimestamp(),
                      reference: ref
                  });
              }

              txn.set(doc(collection(db, 'transactions')), {
                  userId: currentUser.uid,
                  type: 'TRANSFER',
                  amount: amt,
                  fee: fee,
                  description: mode === 'P2P' ? `Sent to ${p2pRecipient.username}` : `Sent to ${accountName} (${banks.find(b=>b.code===bankCode)?.name})`,
                  status: mode === 'P2P' ? 'SUCCESS' : 'PENDING',
                  date: serverTimestamp(),
                  reference: ref,
                  metadata: mode === 'BANK' ? { bankCode, accountNumber, accountName } : { recipientId: p2pRecipient.id }
              });
          });

          await refreshProfile();
          setReceiptData({
              success: true,
              data: {
                  amount: amt,
                  reference: `TRF-${Date.now()}`,
                  description: mode === 'P2P' ? `Sent to ${p2pRecipient.username}` : `Sent to ${accountName}`,
                  date: new Date()
              }
          });
          
          setAmount('');
          setP2pRecipient(null);
          setAccountName('');
          setAccountNumber('');
      } catch (e: any) {
          toast.error(e.message);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20 text-left">
        <TransactionPinModal isOpen={showPin} onClose={() => setShowPin(false)} onSuccess={executeTransfer} amount={parseFloat(amount) + getFee()} title="Confirm Transfer" />
        <ProcessingModal isOpen={isProcessing} text="Sending Money..." />
        <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

        <h1 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Send Money</h1>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-8">
            <button onClick={() => setMode('P2P')} className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'P2P' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                To Member
            </button>
            <button onClick={() => setMode('BANK')} className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'BANK' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                To Bank Account
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            
            {mode === 'P2P' && (
                <div className="space-y-6">
                    {!p2pRecipient ? (
                        <form onSubmit={handleP2PSearch} className="relative">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Search for member</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={p2pSearch} 
                                    onChange={e => setP2pSearch(e.target.value)} 
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-blue-500"
                                    placeholder="Enter username"
                                />
                                <button type="submit" disabled={isSearchingP2P} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 font-black disabled:opacity-50">
                                    {isSearchingP2P ? <Loader2 className="animate-spin" /> : <Search />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-slate-950 p-6 rounded-3xl flex items-center justify-between border border-slate-800">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">{p2pRecipient.username[0].toUpperCase()}</div>
                                <div>
                                    <p className="font-black text-white uppercase">{p2pRecipient.username}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{p2pRecipient.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setP2pRecipient(null)} className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-400">Change</button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'BANK' && (
                <div className="space-y-6">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Choose Bank</label>
                        <select 
                            value={bankCode} 
                            onChange={e => setBankCode(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xs outline-none focus:border-blue-500 appearance-none shadow-inner"
                        >
                            <option value="">-- SELECT BANK --</option>
                            {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Account Number</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                maxLength={10} 
                                value={accountNumber} 
                                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black tracking-[0.2em] focus:border-blue-500 outline-none"
                                placeholder="0123456789"
                            />
                            {isResolving && <div className="absolute right-5 top-5"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>}
                        </div>
                    </div>
                    {accountName && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex items-center text-emerald-400 text-xs font-black uppercase tracking-widest animate-fade-in">
                            <Check className="w-4 h-4 mr-3" /> <span>Account Found: <span className="text-white">{accountName}</span></span>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-10 border-t border-slate-800 pt-8 space-y-8">
                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block ml-1">Amount to send (₦)</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-3xl font-black outline-none focus:border-blue-500 shadow-inner"
                        placeholder="0"
                    />
                </div>
                
                {amount && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
                        <span className="text-slate-500">Service Charge</span>
                        <span className={`${getFee() === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {getFee() === 0 ? 'FREE' : `₦${getFee()}`}
                        </span>
                    </div>
                )}

                <button 
                    onClick={() => {
                        if (!amount || parseFloat(amount) <= 0) return toast.error("Please enter a valid amount.");
                        if ((mode === 'P2P' && !p2pRecipient) || (mode === 'BANK' && !accountName)) return toast.error("Recipient not verified.");
                        setShowPin(true);
                    }}
                    disabled={!amount || (mode === 'P2P' && !p2pRecipient) || (mode === 'BANK' && !accountName)}
                    className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-500 shadow-2xl active:scale-95 transition-all disabled:opacity-30"
                >
                    Confirm & Send
                </button>
            </div>
        </div>
    </div>
  );
};