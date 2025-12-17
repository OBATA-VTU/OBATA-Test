import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TransactionPinModal } from '../components/TransactionPinModal';
import { Search, UserCheck, Loader2, Send, ArrowRight, ShieldCheck, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const P2PTransfer: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState<'SEARCH' | 'AMOUNT' | 'CONFIRM'>('SEARCH');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recipient, setRecipient] = useState<any>(null);
  
  // Transfer State
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 3) return;
    
    setIsSearching(true);
    setRecipient(null);
    
    try {
        // Query by username first
        let q = query(collection(db, 'users'), where('username', '==', searchQuery.toLowerCase()));
        let snap = await getDocs(q);
        
        // If not found, query by email
        if (snap.empty) {
            q = query(collection(db, 'users'), where('email', '==', searchQuery.toLowerCase()));
            snap = await getDocs(q);
        }

        if (!snap.empty) {
            const userDoc = snap.docs[0];
            const userData = userDoc.data();
            
            // Prevent self-transfer
            if (userData.uid === currentUser?.uid) {
                toast.error("You cannot transfer money to yourself.");
            } else {
                setRecipient({ id: userDoc.id, ...userData });
            }
        } else {
            toast.error("User not found.");
        }
    } catch (e) {
        console.error(e);
        toast.error("Error searching for user.");
    } finally {
        setIsSearching(false);
    }
  };

  const executeTransfer = async () => {
      if (!currentUser || !recipient) return;
      setShowPin(false);
      setIsProcessing(true);

      const transferAmount = parseFloat(amount);

      try {
          await runTransaction(db, async (transaction) => {
              // 1. Get Sender (Current User) Data
              const senderRef = doc(db, 'users', currentUser.uid);
              const senderDoc = await transaction.get(senderRef);
              if (!senderDoc.exists()) throw "Sender account error.";

              const senderBalance = senderDoc.data().walletBalance || 0;
              if (senderBalance < transferAmount) throw "Insufficient funds.";

              // 2. Get Recipient Data
              const recipientRef = doc(db, 'users', recipient.id);
              const recipientDoc = await transaction.get(recipientRef);
              if (!recipientDoc.exists()) throw "Recipient account invalid.";

              // 3. Perform Updates
              transaction.update(senderRef, { walletBalance: senderBalance - transferAmount });
              transaction.update(recipientRef, { walletBalance: (recipientDoc.data().walletBalance || 0) + transferAmount });

              // 4. Log Transaction for Sender
              const senderTxnRef = doc(collection(db, 'transactions'));
              transaction.set(senderTxnRef, {
                  userId: currentUser.uid,
                  type: 'TRANSFER',
                  amount: transferAmount,
                  description: `Transfer to ${recipient.username}`,
                  status: 'SUCCESS',
                  date: serverTimestamp(),
                  reference: `TRF-${Date.now()}`,
                  metadata: { note, recipientId: recipient.id }
              });

              // 5. Log Transaction for Recipient
              const recipientTxnRef = doc(collection(db, 'transactions'));
              transaction.set(recipientTxnRef, {
                  userId: recipient.id,
                  type: 'CREDIT',
                  amount: transferAmount,
                  description: `Received from ${userProfile?.username}`,
                  status: 'SUCCESS',
                  date: serverTimestamp(),
                  reference: `RCV-${Date.now()}`,
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
          console.error(e);
          toast.error(typeof e === 'string' ? e : e.message);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in-up">
        <TransactionPinModal 
            isOpen={showPin}
            onClose={() => setShowPin(false)}
            onSuccess={executeTransfer}
            amount={parseFloat(amount)}
            title={`Transfer to ${recipient?.username}`}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-8">
                <div className="bg-blue-500/10 p-3 rounded-full">
                    <Send className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">P2P Transfer</h1>
                    <p className="text-slate-400 text-sm">Send money instantly to other users.</p>
                </div>
            </div>

            {step === 'SEARCH' && (
                <div className="space-y-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase">Recipient Username or Email</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 transition-colors"
                                    placeholder="Enter username"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSearching || !searchQuery}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors"
                            >
                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                            </button>
                        </div>
                    </form>

                    {recipient && (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
                                    <img 
                                        src={recipient.photoURL || `https://ui-avatars.com/api/?name=${recipient.username}&background=random`} 
                                        alt={recipient.username}
                                        className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{recipient.username}</h3>
                                    <p className="text-xs text-slate-500">{recipient.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setStep('AMOUNT')}
                                className="flex items-center text-blue-400 font-bold hover:text-white transition-colors"
                            >
                                Next <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 'AMOUNT' && recipient && (
                <div className="space-y-6 animate-fade-in">
                     <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-2">
                            <UserCheck className="w-5 h-5 text-green-500" />
                            <span className="text-slate-300">Sending to: <span className="font-bold text-white">{recipient.username}</span></span>
                        </div>
                        <button onClick={() => setStep('SEARCH')} className="text-xs text-slate-500 hover:text-white">Change</button>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-400 uppercase block mb-2">Amount (₦)</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-2xl font-bold focus:border-blue-500 transition-colors"
                            placeholder="0.00"
                        />
                         <p className="text-right text-xs text-slate-500 mt-2">Balance: ₦{(userProfile?.walletBalance || 0).toLocaleString()}</p>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-400 uppercase block mb-2">Description (Optional)</label>
                        <input 
                            type="text" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 transition-colors"
                            placeholder="What's this for?"
                        />
                    </div>

                    <button 
                        onClick={() => {
                            if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
                            if (parseFloat(amount) > (userProfile?.walletBalance || 0)) return toast.error("Insufficient balance");
                            setShowPin(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Review Transfer
                    </button>
                </div>
            )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-center space-x-8 text-slate-500">
             <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2" /> Secure</div>
             <div className="flex items-center"><History className="w-5 h-5 mr-2" /> Instant</div>
             <div className="flex items-center"><UserCheck className="w-5 h-5 mr-2" /> Free</div>
        </div>
    </div>
  );
};