import React, { useState } from 'react';
import { CheckCircle, Zap, Gift, Copy, User, Lock, Mail, Code, Terminal, Key, Eye, EyeOff, Loader2, Shield, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface ResellerPageProps {
    onTriggerUpgrade?: () => void;
}

export const ResellerPage: React.FC<ResellerPageProps> = ({ onTriggerUpgrade }) => {
  const { userProfile } = useAuth();
  
  if (userProfile?.isReseller) {
      return (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white text-center relative overflow-hidden">
                  <div className="relative z-10">
                      <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur">
                          <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-4xl font-bold mb-4">You are a Reseller</h1>
                      <p className="text-emerald-100 max-w-xl mx-auto text-lg mb-8">
                          Enjoy wholesale prices and priority support.
                      </p>
                  </div>
              </div>
          </div>
      );
  }

  return (
  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur">
                  <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Become a Reseller</h1>
              <p className="text-orange-100 max-w-xl mx-auto text-lg mb-8">
                  Unlock wholesale prices and earn huge profits. Upgrade your account today for a one-time fee of <span className="font-bold text-white">₦1,000</span>.
              </p>
              <button 
                onClick={onTriggerUpgrade}
                className="bg-white text-orange-700 font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-orange-50 transition-transform hover:scale-105"
              >
                  Upgrade Now - ₦1,000
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Benefits</h3>
              <ul className="space-y-3">
                  {[
                      'Cheaper Data Rates (e.g MTN 1GB @ ₦215)',
                      'High Priority Support',
                      'API Access for your own website',
                      'Special Reseller Discounts on Bills'
                  ].map((item, i) => (
                      <li key={i} className="flex items-center text-slate-300">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> {item}
                      </li>
                  ))}
              </ul>
          </div>
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Pricing Comparison</h3>
              <table className="w-full text-sm">
                  <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
                          <th className="text-left pb-2">Service</th>
                          <th className="pb-2">Normal User</th>
                          <th className="pb-2 text-amber-500">Reseller</th>
                      </tr>
                  </thead>
                  <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800"><td className="py-2">MTN 1GB</td><td className="text-center">₦250</td><td className="text-center font-bold text-amber-500">₦215</td></tr>
                      <tr className="border-b border-slate-800"><td className="py-2">Airtel 1GB</td><td className="text-center">₦240</td><td className="text-center font-bold text-amber-500">₦210</td></tr>
                      <tr><td className="py-2">Glo 1GB</td><td className="text-center">₦230</td><td className="text-center font-bold text-amber-500">₦200</td></tr>
                  </tbody>
              </table>
          </div>
      </div>
  </div>
)};

export const RewardsPage: React.FC = () => {
    const { userProfile, currentUser, refreshProfile } = useAuth();
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const referralLink = `${window.location.origin}?ref=${userProfile?.referralCode || 'guest'}`;

    const handleRedeem = async () => {
        if (!currentUser) return;
        if (!couponCode) return;
        setLoading(true);

        try {
            // Demo Coupon Logic - In real app, check a 'coupons' collection
            if (couponCode.toUpperCase() === 'OBATA2024') {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    walletBalance: increment(100) // Give 100 naira bonus
                });
                // Log transaction
                await addDoc(collection(db, 'transactions'), {
                    userId: currentUser.uid,
                    type: 'CREDIT',
                    amount: 100,
                    description: 'Coupon Redemption: OBATA2024',
                    status: 'SUCCESS',
                    date: serverTimestamp()
                });
                await refreshProfile();
                alert("Coupon Redeemed! ₦100 added to wallet.");
                setCouponCode('');
            } else {
                alert("Invalid or expired coupon code.");
            }
        } catch (e) {
            console.error(e);
            alert("Error redeeming coupon.");
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-purple-500" /> Rewards Hub
            </h2>
            
            {/* Referral */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-2">Refer & Earn</h3>
                <p className="text-slate-400 text-sm mb-4">Share your link and earn ₦500 when your referral upgrades to Reseller.</p>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                    <input type="text" readOnly value={referralLink} className="flex-1 bg-transparent px-4 text-slate-300 text-sm" />
                    <button 
                        onClick={() => navigator.clipboard.writeText(referralLink)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 flex items-center font-bold text-sm"
                    >
                        <Copy className="w-4 h-4 mr-2" /> Copy
                    </button>
                </div>
            </div>

            {/* Coupons */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Redeem Coupon</h3>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter Coupon Code" 
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-purple-500" 
                    />
                    <button 
                        onClick={handleRedeem}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center min-w-[100px]"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redeem'}
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};

export const ApiDocsPage: React.FC = () => {
    const { userProfile } = useAuth();
    return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <Terminal className="w-6 h-6 mr-2 text-green-500" /> Developer API
                </h1>
                <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">v1.0.0</span>
            </div>
            <p className="text-slate-400 mb-8">
                Integrate our VTU services into your own application. Use your API Key to authenticate requests.
            </p>

            <div className="space-y-6">
                <div>
                    <h3 className="text-white font-bold mb-2">Authentication</h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 break-all">
                        Authorization: Token {userProfile?.apiKey || 'OBATA_YOUR_API_KEY'}
                    </div>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">
                    View Full Documentation
                </button>
            </div>
        </div>
    </div>
    );
};

export const ProfilePage: React.FC = () => {
    const { userProfile, currentUser, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'ACCOUNT' | 'SECURITY'>('ACCOUNT');
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [newPin, setNewPin] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleUpdatePin = async () => {
        if (!currentUser) return;
        if (newPin.length !== 4 || isNaN(Number(newPin))) {
            alert("PIN must be 4 digits.");
            return;
        }
        
        // In a real app, verify currentPin matches userProfile.transactionPin here
        // For demo, we just allow update if field is not empty
        if (!currentPin) {
            alert("Enter current PIN to confirm changes.");
            return;
        }

        setLoading(true);
        try {
            if (currentPin !== userProfile?.transactionPin) {
                throw new Error("Current PIN is incorrect.");
            }

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                transactionPin: newPin
            });
            await refreshProfile();
            alert("Transaction PIN updated successfully!");
            setNewPin('');
            setCurrentPin('');
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <User className="w-48 h-48 text-white" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-amber-500">
                        <img 
                            src={userProfile?.photoURL || "https://i.ibb.co/9HLqrnZG/7c973cd9-cee7-40ed-af89-fd5dc5b5339e670713365240472949.jpg"} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover border-4 border-slate-900"
                        />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-slate-900"></div>
                </div>
                
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">{userProfile?.username || 'User'}</h1>
                    <p className="text-slate-400 mb-4">{userProfile?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${userProfile?.isReseller ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                            {userProfile?.isReseller ? 'Reseller Account' : 'Smart Earner'}
                        </span>
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                            Member since {userProfile?.createdAt?.toDate ? new Date(userProfile.createdAt.toDate()).getFullYear() : '2024'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 sticky top-24">
                    <button 
                        onClick={() => setActiveTab('ACCOUNT')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'ACCOUNT' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <User className="w-5 h-5" />
                        <span>Account Details</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('SECURITY')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'SECURITY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Shield className="w-5 h-5" />
                        <span>Security & PIN</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[400px]">
                    
                    {activeTab === 'ACCOUNT' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Code className="w-5 h-5 mr-2 text-blue-500" /> Referral Information
                                </h2>
                                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Your Referral Link</label>
                                    <div className="flex">
                                        <input type="text" readOnly value={`${window.location.origin}?ref=${userProfile?.referralCode}`} className="flex-1 bg-slate-900 border border-slate-700 rounded-l-lg p-3 text-slate-300 font-mono text-sm" />
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}?ref=${userProfile?.referralCode}`)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-r-lg font-bold transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-3">Share this link to earn commissions when your friends upgrade.</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Terminal className="w-5 h-5 mr-2 text-purple-500" /> Developer Access
                                </h2>
                                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">API Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                                        <input 
                                            type={showApiKey ? "text" : "password"} 
                                            readOnly 
                                            value={userProfile?.apiKey || ''} 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-12 py-3 text-white font-mono" 
                                        />
                                        <button 
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                                        >
                                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-3">Keep this key secret. Use it to authenticate API requests.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start space-x-3">
                                <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-amber-500 font-bold text-sm mb-1">Transaction Security</h4>
                                    <p className="text-amber-200/70 text-xs leading-relaxed">
                                        Your 4-digit PIN is required to authorize all payments and withdrawals. Do not share it with anyone.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white mb-6">Change Transaction PIN</h2>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">Current PIN</label>
                                        <input 
                                            type="password" 
                                            value={currentPin}
                                            onChange={(e) => setCurrentPin(e.target.value)}
                                            maxLength={4}
                                            placeholder="Enter current PIN"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white tracking-widest text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">New PIN</label>
                                        <div className="relative">
                                            <input 
                                                type={showPin ? "text" : "password"} 
                                                value={newPin} 
                                                onChange={(e) => setNewPin(e.target.value)}
                                                maxLength={4}
                                                placeholder="Enter new 4-digit PIN"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white tracking-widest text-center font-bold pr-10"
                                            />
                                            <button 
                                                onClick={() => setShowPin(!showPin)}
                                                className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                                            >
                                                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleUpdatePin}
                                        disabled={loading || newPin.length !== 4}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update PIN'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
    );
};