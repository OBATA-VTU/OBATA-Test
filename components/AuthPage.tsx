import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
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
        // Enforce username constraints
        if (regUsername.length < 3) throw new Error("Username must be at least 3 characters.");
        const cleanUsername = regUsername.toLowerCase().replace(/\s/g, '');

        const q = query(collection(db, "users"), where("username", "==", cleanUsername));
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error(`Username '${cleanUsername}' is already taken.`);

        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: regEmail,
            username: cleanUsername,
            role: 'user',
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
          const userDoc = await import('firebase/firestore').then(m => m.getDoc(doc(db, 'users', user.uid)));
          
          if (!userDoc.exists()) {
              // Auto-generate unique username for Google signups
              const baseName = user.displayName?.split(' ')[0].toLowerCase() || 'user';
              const uniqueSuffix = Math.floor(Math.random() * 10000);
              const username = `${baseName}${uniqueSuffix}`;

              await setDoc(doc(db, 'users', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  username: username,
                  role: 'user',
                  walletBalance: 0,
                  commissionBalance: 0,
                  savingsBalance: 0,
                  referralCode: Math.random().toString(36).substring(7).toUpperCase(),
                  createdAt: serverTimestamp(),
                  apiKey: generateApiKey(),
                  photoURL: user.photoURL,
                  transactionPin: "0000",
                  emailNotifications: true
              });
          }
          onSuccess();
      } catch (e: any) { setError(e.message); }
      finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
         <div className="text-center mb-8">
             <div className="flex justify-center mb-4"><Logo className="h-12 w-12" /></div>
             <h1 className="text-2xl font-bold text-white">OBATA VTU</h1>
         </div>

         <div className="flex mb-6 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Login</button>
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>Register</button>
         </div>

         {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-6 flex"><AlertCircle className="w-4 h-4 mr-2 mt-0.5" />{error}</div>}

         {mode === 'LOGIN' ? (
             <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Username / Email</label>
                     <div className="relative mt-1"><User className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="text" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500" placeholder="Enter username" /></div>
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                     <div className="relative mt-1"><Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500" placeholder="••••••••" /></div>
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex justify-center">{isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}</button>
             </form>
         ) : (
             <form onSubmit={handleRegister} className="space-y-4">
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Preferred Username</label>
                     <input type="text" value={regUsername} onChange={e=>setRegUsername(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500" placeholder="Unique username" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                     <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500" placeholder="you@example.com" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                     <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-blue-500" placeholder="••••••••" />
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex justify-center">{isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}</button>
             </form>
         )}
         
         <div className="mt-6 pt-6 border-t border-slate-800">
             <button onClick={handleGoogle} className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 flex justify-center items-center">
                 <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" /> Sign in with Google
             </button>
         </div>
      </div>
    </div>
  );
};