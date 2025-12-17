import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  onSuccess: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, initialMode = 'LOGIN' }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const generateApiKey = () => `OBATA_${Math.random().toString(36).substring(2).toUpperCase()}`;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        if (regUsername.length < 3) throw new Error("Username must be at least 3 characters.");
        const cleanUsername = regUsername.toLowerCase().replace(/\s/g, '');

        const q = query(collection(db, "users"), where("username", "==", cleanUsername));
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error(`Username '${cleanUsername}' is already taken.`);

        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        const user = userCredential.user;

        // Security Rules: allow create: if isOwner(userId)
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: regEmail,
            username: cleanUsername,
            role: 'user',
            isAdmin: false, // Required for security rule checks
            walletBalance: 0,
            commissionBalance: 0,
            savingsBalance: 0,
            referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            referredBy: referralCode || null,
            createdAt: serverTimestamp(),
            apiKey: generateApiKey(),
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
            if (snap.empty) throw new Error("Username not found.");
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

  const handleGoogle = async () => {
      setIsLoading(true);
      try {
          const res = await signInWithPopup(auth, googleProvider);
          const user = res.user;
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (!userDoc.exists()) {
              const baseName = user.displayName?.split(' ')[0].toLowerCase() || 'user';
              const uniqueSuffix = Math.floor(Math.random() * 10000);
              const username = `${baseName}${uniqueSuffix}`;

              await setDoc(doc(db, 'users', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  username: username,
                  role: 'user',
                  isAdmin: false,
                  walletBalance: 0,
                  commissionBalance: 0,
                  savingsBalance: 0,
                  referralCode: Math.random().toString(36).substring(7).toUpperCase(),
                  createdAt: serverTimestamp(),
                  apiKey: generateApiKey(),
                  photoURL: user.photoURL,
                  transactionPin: "0000",
                  emailNotifications: true,
                  banned: false
              });
          }
          onSuccess();
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
         <div className="text-center mb-8">
             <div className="flex justify-center mb-4"><Logo className="h-14 w-14" /></div>
             <h1 className="text-3xl font-black text-white tracking-tighter">OBATA VTU</h1>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Secure Connection Protocol</p>
         </div>

         <div className="flex mb-8 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${mode === 'LOGIN' ? 'bg-slate-800 text-white shadow-xl shadow-white/5' : 'text-slate-500 hover:text-white'}`}>LOGIN</button>
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${mode === 'REGISTER' ? 'bg-slate-800 text-white shadow-xl shadow-white/5' : 'text-slate-500 hover:text-white'}`}>REGISTER</button>
         </div>

         {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl text-xs font-bold mb-8 flex border border-rose-500/20 items-center animate-shake"><AlertCircle className="w-5 h-5 mr-3 shrink-0" />{error}</div>}

         {mode === 'LOGIN' ? (
             <form onSubmit={handleLogin} className="space-y-6">
                 <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Identity Identifier</label>
                     <div className="relative"><User className="absolute left-4 top-4 w-5 h-5 text-slate-700" /><input type="text" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all placeholder-slate-800 font-bold" placeholder="Username or Email" /></div>
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Security Key</label>
                     <div className="relative"><Lock className="absolute left-4 top-4 w-5 h-5 text-slate-700" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all placeholder-slate-800 font-bold" placeholder="••••••••" /></div>
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex justify-center items-center shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">{isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'AUTHORIZE SESSION'}</button>
             </form>
         ) : (
             <form onSubmit={handleRegister} className="space-y-6">
                 <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Username</label>
                     <input type="text" value={regUsername} onChange={e=>setRegUsername(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="unique_id" />
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Email</label>
                     <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="node@network.com" />
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Password</label>
                     <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="••••••••" />
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex justify-center items-center shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">{isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'INITIALIZE NODE'}</button>
             </form>
         )}
         
         <div className="mt-8 pt-8 border-t border-slate-800">
             <button onClick={handleGoogle} className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all flex justify-center items-center active:scale-95">
                 <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-3" alt="Google" /> GOOGLE PASSPORT
             </button>
         </div>
      </div>
    </div>
  );
};