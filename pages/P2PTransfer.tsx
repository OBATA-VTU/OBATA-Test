import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { Search, UserCheck, Loader2, Send, ArrowRight, ShieldCheck, History, Wallet, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const P2PTransfer: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState<'SEARCH' | 'DETAILS' | 'CONFIRM'>('SEARCH');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recipient, setRecipient] = useState<any>(null);
  
  // Transfer State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 3) return;
    
    setIsSearching(true);
    setRecipient(null);
    
    try {
        let q = query(collection(db, 'users'), where('username', '==', searchQuery.toLowerCase()));
        let snap = await getDocs(q);
        
        if (snap.empty) {
            q = query(collection(db, 'users'), where('email', '==', searchQuery.toLowerCase()));
            snap = await getDocs(q);
        }

        if (!snap.empty) {
            const userDoc = snap.docs[0];
            const userData = userDoc.data();
            if (userData.uid === currentUser?.uid) {
                toast.error("Cannot transfer to self");
            } else {
                setRecipient({ id: userDoc.id, ...userData });
                setStep('DETAILS');
            }
        } else {
            toast.error("User not found");
        }
    } catch (e) {
        toast.error("Search error");
    } finally {
        setIsSearching(false);
    }
  };

  const executeTransfer = async () => {
      if (!currentUser || !recipient) return;
      setShowPin(false);
      const transferAmount = parseFloat(amount);

      try {
          await runTransaction(db, async (transaction) => {
              const senderRef = doc(db, 'users', currentUser.uid);
              const senderDoc = await transaction.get(senderRef);
              if (!senderDoc.exists()) throw "Sender error";
              if ((senderDoc.data().walletBalance || 0) < transferAmount) throw "Insufficient funds";

              const recipientRef = doc(db, 'users', recipient.id);
              const recipientDoc = await transaction.get(recipientRef);
              if (!recipientDoc.exists()) throw "Recipient error";

              transaction.update(senderRef, { walletBalance: (senderDoc.data().walletBalance || 0) - transferAmount });
              transaction.update(recipientRef, { walletBalance: (recipientDoc.data().walletBalance || 0) + transferAmount });

              const refId = `TRF-${Date.now()}`;
              const newTxnRef = doc(collection(db, 'transactions'));
              transaction.set(newTxnRef, {
                  userId: currentUser.uid,
                  type: 'TRANSFER',
                  amount: transferAmount,
                  description: `Transfer to ${recipient.username}`,
                  status: 'SUCCESS',
                  date: serverTimestamp(),
                  reference: refId,
                  metadata: { note, recipientId: recipient.id }
              });
              
              const recTxnRef = doc(collection(db, 'transactions'));
              transaction.set(recTxnRef, {
                  userId: recipient.id,
                  type: 'CREDIT',
                  amount: transferAmount,
                  description: `Received from ${userProfile?.username}`,
                  status: 'SUCCESS',
                  date: serverTimestamp(),
                  reference: refId,
                  metadata: { note, senderId: currentUser.uid }
              });
          });

          await refreshProfile();
          toast.success("Transfer Successful!");
          setStep('SEARCH');
          setRecipient(null);
          setAmount('');
          setNote('');
          setSearchQuery('');
      } catch (e: any) {
          toast.error(typeof e === 'string' ? e : e.message);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        <TransactionPinModal 
            isOpen={showPin}
            onClose={() => setShowPin(false)}
            onSuccess={executeTransfer}
            amount={parseFloat(amount)}
            title={`Send to ${recipient?.username}`}
        />

        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Transfer Funds</h1>
            <div className="flex space-x-2">
                <div className={`h-2 w-8 rounded-full transition-colors ${step === 'SEARCH' ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <div className={`h-2 w-8 rounded-full transition-colors ${step === 'DETAILS' ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            {step === 'SEARCH' && (
                <div className="relative z-10 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                            <Search className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Find Recipient</h2>
                        <p className="text-slate-400 text-sm">Enter username or email address</p>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 text-white text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none shadow-inner"
                            placeholder="username"
                        />
                        <button 
                            type="submit"
                            disabled={isSearching || !searchQuery}
                            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            )}

            {step === 'DETAILS' && recipient && (
                <div className="relative z-10 animate-fade-in">
                    <button onClick={() => setStep('SEARCH')} className="text-slate-500 hover:text-white mb-6 text-sm flex items-center"><ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Change Recipient</button>
                    
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 flex items-center space-x-4 border border-slate-700 mb-8">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {recipient.username.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Transfer To</p>
                            <h3 className="text-xl font-bold text-white">{recipient.username}</h3>
                            <p className="text-xs text-slate-500">{recipient.email}</p>
                        </div>
                        <div className="ml-auto">
                            <Check className="w-6 h-6 text-green-500" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Amount to Send</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-4 text-white text-2xl font-bold focus:border-blue-500 transition-colors"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            <p className="text-right text-xs text-slate-500 mt-2">Available: ₦{(userProfile?.walletBalance || 0).toLocaleString()}</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Note (Optional)</label>
                            <input 
                                type="text" 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white transition-colors focus:border-blue-500"
                                placeholder="Payment for..."
                            />
                        </div>

                        <button 
                            onClick={() => {
                                if (!amount || parseFloat(amount) <= 0) return toast.error("Invalid amount");
                                if (parseFloat(amount) > (userProfile?.walletBalance || 0)) return toast.error("Insufficient funds");
                                setShowPin(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
                        >
                            Proceed to Transfer
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};