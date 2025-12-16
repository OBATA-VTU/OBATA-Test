import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Logo } from './Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Shield, Check } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, initialMode = 'LOGIN' }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');

  // Register Fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('USER');
  const [referralCode, setReferralCode] = useState('');

  // URL Query Params for Referral
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);
  }, []);

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
      
      // Check if user doc exists, if not create it
      // Note: For simplicity, username for Google signups is generated
      const docRef = doc(db, 'users', user.uid);
      const existingDoc = await import('firebase/firestore').then(mod => mod.getDoc(docRef));

      if (!existingDoc.exists()) {
         const generatedUsername = user.displayName?.replace(/\s/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
         await setDoc(docRef, {
            uid: user.uid,
            username: generatedUsername,
            email: user.email,
            role: 'USER',
            walletBalance: 0,
            referralCode: generatedUsername,
            referredBy: referralCode || null,
            createdAt: serverTimestamp()
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
        // Check if input is username (no @ symbol)
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
        // 1. Check Username uniqueness
        const usernameTaken = await checkUsernameExists(regUsername);
        if (usernameTaken) {
            throw new Error(`Username '${regUsername}' is already taken. Try ${regUsername}${Math.floor(Math.random()*100)}`);
        }

        // 2. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        const user = userCredential.user;

        // 3. Create Firestore Document
        // If Reseller selected, we start as USER but store 'pending_reseller' locally or handle via UI flow next
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            username: regUsername,
            email: regEmail,
            role: 'USER', // Always start as USER, upgrade later if selected
            walletBalance: 0,
            referralCode: regUsername,
            referredBy: referralCode || null,
            createdAt: serverTimestamp(),
            pendingUpgrade: regRole === 'RESELLER' ? true : false
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
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="flex justify-center mb-4">
            <Logo className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">OBATA VTU</h1>
        <p className="text-slate-400">Secure. Fast. Reliable.</p>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
         <div className="flex mb-8 bg-slate-800/50 p-1 rounded-lg">
            <button 
                onClick={() => setMode('LOGIN')} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Login
            </button>
            <button 
                onClick={() => setMode('REGISTER')} 
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Register
            </button>
         </div>

         {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 flex items-start">
                 <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                 <span>{error}</span>
             </div>
         )}

         {mode === 'LOGIN' ? (
             <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Username or Email</label>
                     <div className="relative">
                         <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                         <input 
                            type="text" 
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter username or email"
                         />
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Password</label>
                     <div className="relative">
                         <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                         <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                         />
                     </div>
                 </div>
                 <div className="text-right">
                     <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot Password?</a>
                 </div>
                 <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center"
                 >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>}
                 </button>
             </form>
         ) : (
             <form onSubmit={handleRegister} className="space-y-4">
                 <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Username (Unique)</label>
                     <div className="relative">
                         <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                         <input 
                            type="text" 
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="choose_username"
                         />
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Email Address</label>
                     <div className="relative">
                         <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                         <input 
                            type="email" 
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="you@example.com"
                         />
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Password</label>
                     <div className="relative">
                         <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                         <input 
                            type="password" 
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                         />
                     </div>
                 </div>
                 
                 {/* Role Selection */}
                 <div className="grid grid-cols-2 gap-3 pt-2">
                     <div 
                        onClick={() => setRegRole('USER')}
                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center text-center transition-all ${regRole === 'USER' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                     >
                         <Shield className={`w-6 h-6 mb-2 ${regRole === 'USER' ? 'text-blue-500' : 'text-slate-500'}`} />
                         <span className="text-xs font-bold">Smart Earner</span>
                         <span className="text-[10px] text-slate-500">Free Account</span>
                     </div>
                     <div 
                        onClick={() => setRegRole('RESELLER')}
                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center text-center transition-all ${regRole === 'RESELLER' ? 'bg-amber-600/10 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                     >
                         <Shield className={`w-6 h-6 mb-2 ${regRole === 'RESELLER' ? 'text-amber-500' : 'text-slate-500'}`} />
                         <span className="text-xs font-bold">Reseller</span>
                         <span className="text-[10px] text-amber-500">₦1,000 Fee</span>
                     </div>
                 </div>

                 {regRole === 'RESELLER' && (
                     <div className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                         Note: A one-time fee of ₦1,000 will be required immediately after registration to activate Reseller status.
                     </div>
                 )}

                 {referralCode && (
                     <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Referral Code</label>
                        <input type="text" value={referralCode} readOnly className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-slate-400 cursor-not-allowed" />
                     </div>
                 )}

                 <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center"
                 >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>}
                 </button>
             </form>
         )}

         <div className="mt-6 pt-6 border-t border-slate-800">
             <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center"
             >
                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                 Sign in with Google
             </button>
         </div>
      </div>
    </div>
  );
};