import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Shield } from 'lucide-react';
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
  
  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');

  // Register Fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [wantReseller, setWantReseller] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);
  }, []);

  // Helper Generators
  const generateApiKey = () => `OBATA_${Math.random().toString(36).substring(2).toUpperCase()}`;
  
  const checkUsernameExists = async (username: string) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const getEmailByUsername = async (username: string) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().email;
    }
    return null;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await import('firebase/firestore').then(mod => mod.getDoc(docRef));

      if (!docSnap.exists()) {
         const generatedUsername = user.displayName?.replace(/\s/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
         await setDoc(docRef, {
            uid: user.uid,
            email: user.email,
            username: generatedUsername,
            role: 'user',
            walletBalance: 0,
            commissionBalance: 0,
            savingsBalance: 0,
            referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            referredBy: referralCode || null,
            createdAt: serverTimestamp(),
            apiKey: generateApiKey(),
            photoURL: user.photoURL,
            transactionPin: "0000",
            emailNotifications: true,
            banned: false
         });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
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
            const fetchedEmail = await getEmailByUsername(loginIdentifier);
            if (!fetchedEmail) throw new Error("Username not found.");
            emailToUse = fetchedEmail;
        }

        await signInWithEmailAndPassword(auth, emailToUse, password);
        onSuccess();
    } catch (err: any) {
        setError(err.message.replace('Firebase:', '').trim());
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const usernameTaken = await checkUsernameExists(regUsername);
        if (usernameTaken) throw new Error(`Username '${regUsername}' is already taken.`);

        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: regEmail,
            username: regUsername,
            role: 'user', // Reseller requires payment logic later
            walletBalance: 0,
            commissionBalance: 0,
            savingsBalance: 0,
            referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            referredBy: referralCode || null,
            createdAt: serverTimestamp(),
            apiKey: generateApiKey(),
            photoURL: "https://ui-avatars.com/api/?background=random",
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* ... Same UI as before but wrapped in page logic ... */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="flex justify-center mb-4"><Logo className="h-16 w-16" /></div>
        <h1 className="text-3xl font-bold text-white mb-2">OBATA VTU</h1>
        <p className="text-slate-400">Secure. Fast. Reliable.</p>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
         <div className="flex mb-8 bg-slate-800/50 p-1 rounded-lg">
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Login</button>
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Register</button>
         </div>

         {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-6 flex"><AlertCircle className="w-4 h-4 mr-2 mt-0.5" />{error}</div>}

         {mode === 'LOGIN' ? (
             <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Username/Email</label>
                     <div className="relative mt-1"><User className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="text" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white" placeholder="Enter username" /></div>
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                     <div className="relative mt-1"><Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white" placeholder="••••••••" /></div>
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex justify-center">{isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}</button>
             </form>
         ) : (
             <form onSubmit={handleRegister} className="space-y-4">
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                     <input type="text" value={regUsername} onChange={e=>setRegUsername(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white" placeholder="username" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                     <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white" placeholder="email@example.com" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                     <input type="password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white" placeholder="••••••••" />
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex justify-center">{isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}</button>
             </form>
         )}
         
         <div className="mt-6 pt-6 border-t border-slate-800">
             <button onClick={handleGoogleSignIn} className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 flex justify-center items-center">
                 Sign in with Google
             </button>
         </div>
      </div>
    </div>
  );
};
