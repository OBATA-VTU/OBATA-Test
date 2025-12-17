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
  const [step, setStep] = useState<'INPUT' | 'CONFIRM'>('INPUT');
  
  // P2P State
  const [p2pSearch, setP2pSearch] = useState('');
  const [p2pRecipient, setP2pRecipient] = useState<any>(null);
  const [isSearchingP2P, setIsSearchingP2P] = useState(false);

  // Bank State
  const [banks, setBanks] = useState<{name: string, code: string}[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Common State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Load Banks
  useEffect(() => {
      if (mode === 'BANK' && banks.length === 0) {
          getBanks().then(res => {
              if (res.success) setBanks(res.data);
              else toast.error("Failed to load banks");
          });
      }
  }, [mode]);

  // Resolve Account Effect
  useEffect(() => {
      if (mode === 'BANK' && accountNumber.length === 10 && bankCode) {
          const resolve = async () => {
              setIsResolving(true);
              setAccountName('');
              const res = await resolveBankAccount(accountNumber, bankCode);
              setIsResolving(false);
              if (res.success) {
                  setAccountName(res.data.account_name);
                  toast.success("Account Verified");
              } else {
                  toast.error("Could not verify account");
              }
          };
          resolve();
      } else {
          setAccountName('');
      }
  }, [accountNumber, bankCode, mode]);

  // Fee Logic
  const getFee = () => {
      if (mode === 'P2P') return 0;
      const selectedBank = banks.find(b => b.code === bankCode)?.name.toLowerCase() || '';
      if (selectedBank.includes('opay') || selectedBank.includes('palmpay')) return 0;
      return 10;
  };

  const handleP2PSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!p2pSearch) return;
      setIsSearchingP2P(true);
      setP2pRecipient(null);
      try {
          // Search by username first, then email
          let q = query(collection(db, 'users'), where('username', '==', p2pSearch.toLowerCase()));
          let snap = await getDocs(q);
          if (snap.empty) {
              q = query(collection(db, 'users'), where('email', '==', p2pSearch.toLowerCase()));
              snap = await getDocs(q);
          }

          if (!snap.empty) {
              const doc = snap.docs[0];
              if (doc.id === currentUser?.uid) toast.error("Cannot transfer to self");
              else setP2pRecipient({ id: doc.id, ...doc.data() });
          } else {
              toast.error("User not found");
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
              if ((senderDoc.data()?.walletBalance || 0) < total) throw new Error("Insufficient funds");

              // Deduct from Sender
              txn.update(senderRef, { walletBalance: (senderDoc.data()?.walletBalance || 0) - total });

              const ref = `TRF-${Date.now()}`;

              // If P2P, Credit Recipient
              if (mode === 'P2P' && p2pRecipient) {
                  const recRef = doc(db, 'users', p2pRecipient.id);
                  const recDoc = await txn.get(recRef);
                  txn.update(recRef, { walletBalance: (recDoc.data()?.walletBalance || 0) + amt });
                  
                  // Credit Log
                  txn.set(doc(collection(db, 'transactions')), {
                      userId: p2pRecipient.id,
                      type: 'CREDIT',
                      amount: amt,
                      description: `Transfer from ${userProfile?.username}`,
                      status: 'SUCCESS',
                      date: serverTimestamp(),
                      reference: ref
                  });
              }

              // Debit Log (Sender)
              txn.set(doc(collection(db, 'transactions')), {
                  userId: currentUser.uid,
                  type: 'TRANSFER',
                  amount: amt,
                  fee: fee,
                  description: mode === 'P2P' ? `Transfer to ${p2pRecipient.username}` : `Transfer to ${accountName} (${banks.find(b=>b.code===bankCode)?.name})`,
                  status: mode === 'P2P' ? 'SUCCESS' : 'PENDING', // Bank transfers might be pending
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
          
          // Reset
          setStep('INPUT');
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <TransactionPinModal isOpen={showPin} onClose={() => setShowPin(false)} onSuccess={executeTransfer} amount={parseFloat(amount) + getFee()} title="Confirm Transfer" />
        <ProcessingModal isOpen={isProcessing} text="Processing Transfer..." />
        <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} response={receiptData} loading={false} />

        <h1 className="text-3xl font-bold text-white mb-6">Transfer Funds</h1>

        {/* Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-6">
            <button onClick={() => setMode('P2P')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'P2P' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                <User className="w-4 h-4 inline mr-2" /> To OBATA User
            </button>
            <button onClick={() => setMode('BANK')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'BANK' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                <Building2 className="w-4 h-4 inline mr-2" /> To Bank Account
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            
            {/* P2P SEARCH */}
            {mode === 'P2P' && (
                <div className="space-y-6">
                    {!p2pRecipient ? (
                        <form onSubmit={handleP2PSearch} className="relative">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Recipient Username/Email</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={p2pSearch} 
                                    onChange={e => setP2pSearch(e.target.value)} 
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500"
                                    placeholder="Enter username"
                                />
                                <button type="submit" disabled={isSearchingP2P} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-bold disabled:opacity-50">
                                    {isSearchingP2P ? <Loader2 className="animate-spin" /> : <Search />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{p2pRecipient.username[0].toUpperCase()}</div>
                                <div>
                                    <p className="font-bold text-white">{p2pRecipient.username}</p>
                                    <p className="text-xs text-slate-400">{p2pRecipient.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setP2pRecipient(null)} className="text-xs text-red-400 hover:text-red-300">Change</button>
                        </div>
                    )}
                </div>
            )}

            {/* BANK DETAILS */}
            {mode === 'BANK' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Bank</label>
                        <select 
                            value={bankCode} 
                            onChange={e => setBankCode(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500"
                        >
                            <option value="">-- Choose Bank --</option>
                            {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Account Number</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                maxLength={10} 
                                value={accountNumber} 
                                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 font-mono tracking-widest"
                                placeholder="0123456789"
                            />
                            {isResolving && <div className="absolute right-4 top-4"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>}
                        </div>
                    </div>
                    {accountName && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center text-emerald-400 text-sm animate-fade-in">
                            <Check className="w-4 h-4 mr-2" /> <span>Matched: <span className="font-bold text-white">{accountName}</span></span>
                        </div>
                    )}
                </div>
            )}

            {/* AMOUNT & PAY */}
            <div className="mt-8 border-t border-slate-800 pt-6 space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Amount to Transfer</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-2xl font-bold focus:border-blue-500"
                        placeholder="0.00"
                    />
                </div>
                
                {amount && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Processing Fee</span>
                        <span className={`font-bold ${getFee() === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                            {getFee() === 0 ? 'FREE' : `₦${getFee()}`}
                        </span>
                    </div>
                )}

                <button 
                    onClick={() => {
                        if (!amount || parseFloat(amount) <= 0) return toast.error("Invalid amount");
                        if ((mode === 'P2P' && !p2pRecipient) || (mode === 'BANK' && !accountName)) return toast.error("Invalid recipient");
                        setShowPin(true);
                    }}
                    disabled={!amount || (mode === 'P2P' && !p2pRecipient) || (mode === 'BANK' && !accountName)}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${mode === 'P2P' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Transfer Funds
                </button>
            </div>
        </div>
    </div>
  );
};