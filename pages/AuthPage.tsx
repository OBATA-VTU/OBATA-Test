import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { Logo } from '../components/Logo';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Shield, Check } from 'lucide-react';
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
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // PIN Setup (Placeholder state)
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);
    
    // Check if user is already logged in (optional redundancy, dealt by App.tsx generally)
    if (auth.currentUser) {
       onSuccess();
    }
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
            transactionPin: "0000", // Default, should prompt change later
            emailNotifications: true,
            banned: false
         });
         // Trigger PIN setup logic here if needed
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
            role: 'user',
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
        
        // Instead of immediate success, show PIN setup
        // For now, we will just proceed to success as per instruction "placeholder logic"
        // In a real app, set state to ShowPinSetup, asking user to enter a pin, then updateDoc
        onSuccess(); 
    } catch (err: any) {
        setError(err.message.replace('Firebase:', '').trim());
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Left Side - Image/Marketing */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-10"></div>
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover" alt="Background" />
          
          <div className="relative z-20 p-12 text-white max-w-lg">
             <div className="mb-8 animate-fade-in-up">
                <Logo className="h-16 w-16 mb-6" />
                <h1 className="text-5xl font-extrabold mb-6 leading-tight">Fastest VTU Platform in Nigeria.</h1>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                   Join thousands of smart Nigerians who use OBATA for instant data top-ups, airtime, and bill payments at unbeatable rates.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center"><div className="bg-blue-500/30 p-1 rounded-full mr-3"><Check className="w-4 h-4" /></div> <span>Instant Wallet Funding</span></div>
                    <div className="flex items-center"><div className="bg-blue-500/30 p-1 rounded-full mr-3"><Check className="w-4 h-4" /></div> <span>99.9% Uptime Guarantee</span></div>
                    <div className="flex items-center"><div className="bg-blue-500/30 p-1 rounded-full mr-3"><Check className="w-4 h-4" /></div> <span>24/7 Customer Support</span></div>
                </div>
             </div>
          </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-950">
         <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <div className="lg:hidden flex justify-center mb-4"><Logo className="h-12 w-12" /></div>
                <h2 className="text-3xl font-bold text-white mb-2">{mode === 'LOGIN' ? 'Welcome Back!' : 'Create Account'}</h2>
                <p className="text-slate-400">
                    {mode === 'LOGIN' ? 'Enter your details to access your account.' : 'Start your journey with us today.'}
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="bg-slate-900 p-1.5 rounded-xl flex border border-slate-800">
                <button 
                    onClick={() => setMode('LOGIN')} 
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => setMode('REGISTER')} 
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Register
                </button>
            </div>

            {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm flex items-start border border-red-500/20"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{error}</div>}

            {mode === 'LOGIN' ? (
                <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Username or Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                            <input 
                                type="text" 
                                value={loginIdentifier} 
                                onChange={e=>setLoginIdentifier(e.target.value)} 
                                required 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                                placeholder="Enter username" 
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                             <button type="button" className="text-xs text-blue-400 hover:text-blue-300">Forgot?</button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e=>setPassword(e.target.value)} 
                                required 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex justify-center items-center transition-all shadow-lg shadow-blue-900/20">
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5 ml-2" /></>}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Username</label>
                            <input 
                                type="text" 
                                value={regUsername} 
                                onChange={e=>setRegUsername(e.target.value)} 
                                required 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 px-4 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                                placeholder="User" 
                            />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Referral (Opt)</label>
                            <input 
                                type="text" 
                                value={referralCode} 
                                onChange={e=>setReferralCode(e.target.value)} 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 px-4 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                                placeholder="Code" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                            <input 
                                type="email" 
                                value={regEmail} 
                                onChange={e=>setRegEmail(e.target.value)} 
                                required 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                                placeholder="you@example.com" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                            <input 
                                type="password" 
                                value={regPassword} 
                                onChange={e=>setRegPassword(e.target.value)} 
                                required 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex justify-center items-center transition-all shadow-lg shadow-blue-900/20">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-950 text-slate-500">Or continue with</span></div>
            </div>

            <button onClick={handleGoogleSignIn} className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-200 flex justify-center items-center transition-colors">
                 <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" /> Sign in with Google
            </button>
         </div>
      </div>
    </div>
  );
};