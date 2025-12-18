import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  onSuccess: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, initialMode = 'LOGIN' }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref')) setReferralCode(params.get('ref')!);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        if (regUsername.length < 3) throw new Error("Username must be at least 3 characters.");
        const cleanUsername = regUsername.toLowerCase().replace(/\s/g, '');

        const q = query(collection(db, "users"), where("username", "==", cleanUsername));
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error(`Username '${cleanUsername}' is taken.`);

        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: regEmail,
            username: cleanUsername,
            role: 'user',
            isAdmin: false,
            walletBalance: 0,
            commissionBalance: 0,
            savingsBalance: 0,
            referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            referredBy: referralCode || null,
            createdAt: serverTimestamp(),
            photoURL: `https://ui-avatars.com/api/?name=${cleanUsername}&background=0ea5e9&color=fff`,
            transactionPin: "0000",
            emailNotifications: true,
            banned: false
        });

        onSuccess();
    } catch (err: any) {
        setError(err.message.replace('Firebase:', '').trim());
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        let emailToUse = loginIdentifier;
        if (!loginIdentifier.includes('@')) {
            const q = query(collection(db, "users"), where("username", "==", loginIdentifier.toLowerCase()));
            const snap = await getDocs(q);
            if (snap.empty) throw new Error("Account not found.");
            emailToUse = snap.docs[0].data().email;
        }
        await signInWithEmailAndPassword(auth, emailToUse, password);
        onSuccess();
    } catch (err: any) {
        setError(err.message.replace('Firebase:', '').trim());
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-left relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>

      <button onClick={() => navigate('/')} className="absolute top-10 left-10 flex items-center text-slate-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] group">
          <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 shadow-2xl relative z-10">
         <div className="text-center mb-12">
             <div className="flex justify-center mb-6"><Logo className="h-16 w-16" /></div>
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">OBATA <span className="text-blue-500">VTU</span></h1>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Authorized Secure Connection</p>
         </div>

         <div className="flex mb-10 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>LOGIN</button>
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-4 rounded-xl text-[11px] font-black tracking-widest transition-all ${mode === 'REGISTER' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>SIGN UP</button>
         </div>

         {error && <div className="bg-rose-500/10 text-rose-400 p-5 rounded-2xl text-[10px] font-black uppercase mb-10 border border-rose-500/20 flex items-center animate-shake leading-relaxed"><AlertCircle className="w-5 h-5 mr-4 shrink-0" />{error}</div>}

         {mode === 'LOGIN' ? (
             <form onSubmit={handleLogin} className="space-y-8">
                 <div>
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-1">Username or Email</label>
                     <div className="relative">
                        <User className="absolute left-5 top-5 w-5 h-5 text-slate-800" />
                        <input type="text" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-blue-600 outline-none transition-all placeholder-slate-900 font-bold" placeholder="node_identity" />
                     </div>
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-1">Pass-Key</label>
                     <div className="relative">
                        <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-800" />
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-blue-600 outline-none transition-all placeholder-slate-900 font-bold" placeholder="••••••••" />
                     </div>
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] flex justify-center items-center shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-xs tracking-widest">
                    {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <>START SESSION <ArrowRight className="ml-3 w-4 h-4" /></>}
                 </button>
             </form>
         ) : (
             <form onSubmit={handleRegister} className="space-y-6">
                 <div>
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Choose Username</label>
                     <input type="text" value={regUsername} onChange={e=>setRegUsername(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-600 outline-none transition-all font-bold" placeholder="my_username" />
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Email Address</label>
                     <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-600 outline-none transition-all font-bold" placeholder="node@network.com" />
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Create Password</label>
                     <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-600 outline-none transition-all font-bold" placeholder="••••••••" />
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] flex justify-center items-center shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-xs tracking-widest mt-4">
                    {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'CREATE TERMINAL ID'}
                 </button>
             </form>
         )}
         
         <div className="mt-10 pt-10 border-t border-slate-800">
             <button onClick={() => signInWithPopup(auth, googleProvider).then(onSuccess)} className="w-full bg-white text-slate-900 font-black py-5 rounded-[2.2rem] hover:bg-slate-200 transition-all flex justify-center items-center active:scale-95 shadow-xl text-[10px] tracking-widest">
                 <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" /> USE GOOGLE PASSPORT
             </button>
         </div>
      </div>
    </div>
  );
};