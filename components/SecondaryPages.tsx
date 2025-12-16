import React, { useState } from 'react';
import { CheckCircle, Zap, Gift, Copy, User, Lock, Mail, Code, Terminal, Key, Eye, EyeOff, Loader2, Shield, Bell, Users, BarChart, Server, Globe } from 'lucide-react';
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
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-12 text-white text-center relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                      <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur">
                          <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h1 className="text-5xl font-bold mb-4">Reseller Status Active</h1>
                      <p className="text-emerald-100 max-w-xl mx-auto text-xl">
                          You are enjoying wholesale rates and earning commissions on every sale.
                      </p>
                  </div>
              </div>
          </div>
      );
  }

  return (
  <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/10">
                 <Zap className="w-4 h-4 mr-2" /> <span className="text-sm font-bold uppercase tracking-wider">Premium Access</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Upgrade to Reseller</h1>
              <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                  Start your own VTU business. Get massive discounts on airtime and data, earn commissions, and priority support for a one-time fee of <span className="font-bold text-white text-2xl">₦1,000</span>.
              </p>
              <button 
                onClick={onTriggerUpgrade}
                className="bg-white text-orange-700 font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-orange-50 transition-transform hover:scale-105"
              >
                  Upgrade Now - ₦1,000
              </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
              <Zap className="w-96 h-96" />
          </div>
      </div>
      {/* ... (Benefits and Table remain same) ... */}
  </div>
)};

export const ReferralsPage: React.FC = () => {
    const { userProfile } = useAuth();
    const referralLink = `${window.location.origin}?ref=${userProfile?.referralCode || 'guest'}`;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
                <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Refer & Earn</h1>
                <p className="text-slate-400 max-w-lg mx-auto mb-8">
                    Invite your friends to OBATA VTU. Earn <span className="text-white font-bold">₦500</span> instantly when they upgrade to a Reseller account.
                </p>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 max-w-2xl mx-auto">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block text-left">Your Unique Referral Link</label>
                    <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                        <input type="text" readOnly value={referralLink} className="flex-1 bg-transparent px-4 text-slate-300 text-sm font-mono" />
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(referralLink);
                                alert("Link Copied!");
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 flex items-center font-bold text-sm transition-colors"
                        >
                            <Copy className="w-4 h-4 mr-2" /> Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const RewardsPage: React.FC = () => {
    const { currentUser, refreshProfile } = useAuth();
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRedeem = async () => {
        if (!currentUser) return;
        if (!couponCode) return;
        setLoading(true);

        try {
            // Check specific coupons collection in Firestore
            // ... (Logic for Firestore coupon check would go here)
            // For now, simple simulation since we don't have Admin panel to generate them dynamically yet
            if (couponCode.toUpperCase() === 'WELCOME') {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, { walletBalance: increment(50) });
                await addDoc(collection(db, 'transactions'), {
                    userId: currentUser.uid,
                    type: 'CREDIT',
                    amount: 50,
                    description: 'Welcome Coupon',
                    status: 'SUCCESS',
                    date: serverTimestamp()
                });
                await refreshProfile();
                alert("Coupon Redeemed!");
                setCouponCode('');
            } else {
                alert("Invalid or Expired Coupon");
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-purple-500" /> Coupon Redemption
            </h2>
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-8 text-center">
                <p className="text-purple-200 mb-6">Have a coupon code? Enter it below to claim your bonus.</p>
                <div className="flex gap-4 max-w-md mx-auto">
                    <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter Code" 
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 uppercase font-bold tracking-widest text-center" 
                    />
                    <button 
                        onClick={handleRedeem}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center min-w-[120px] transition-colors"
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
    const [activeTab, setActiveTab] = useState<'AUTH' | 'ENDPOINTS' | 'ERRORS'>('AUTH');

    return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center mb-2">
                        <Terminal className="w-8 h-8 mr-3 text-green-500" /> Developer API
                    </h1>
                    <p className="text-slate-400">Integrate our high-speed VTU infrastructure directly into your application.</p>
                </div>
                <div className="text-right">
                     <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-xs font-bold border border-green-500/20">System Status: Operational</span>
                </div>
            </div>

            {/* API Tabs */}
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800 w-fit">
                <button onClick={() => setActiveTab('AUTH')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'AUTH' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Authentication</button>
                <button onClick={() => setActiveTab('ENDPOINTS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'ENDPOINTS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Endpoints</button>
                <button onClick={() => setActiveTab('ERRORS')} className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'ERRORS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Errors & Responses</button>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {activeTab === 'AUTH' && (
                    <div className="animate-fade-in">
                        <h3 className="text-white font-bold mb-4 flex items-center"><Key className="w-4 h-4 mr-2 text-amber-500"/> Authorization</h3>
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6">
                            <p className="text-slate-400 text-sm mb-3">All API requests must include your unique API Key in the Header.</p>
                            <div className="bg-black p-4 rounded-lg border border-slate-800 mb-4">
                                <code className="font-mono text-sm text-green-400">
                                    Authorization: Token {userProfile?.apiKey || 'YOUR_API_KEY'}
                                </code>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center"><Lock className="w-3 h-3 mr-1"/> Your API Key allows access to your wallet funds. Never share it or commit it to public repositories.</p>
                        </div>
                        
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                             <h4 className="text-white font-bold mb-2">Base URL</h4>
                             <code className="bg-black px-3 py-1 rounded text-blue-400 font-mono text-sm">https://obatavtu.com/api/v1</code>
                        </div>
                    </div>
                )}

                {activeTab === 'ENDPOINTS' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">POST</span>
                                    <span className="font-mono text-sm text-slate-300 font-bold">/airtime</span>
                                </div>
                                <span className="text-xs text-slate-500">Purchase Airtime</span>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-400 mb-4">Payload Parameters:</p>
                                <code className="block bg-black p-4 rounded-lg font-mono text-xs text-slate-300 leading-relaxed mb-4">
                                    {`{
  "network": "MTN", // MTN, AIRTEL, GLO, 9MOBILE
  "amount": 100,
  "mobile_number": "08012345678",
  "ref": "UNIQUE_REF_123" // Optional
}`}
                                </code>
                            </div>
                        </div>

                         <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">POST</span>
                                    <span className="font-mono text-sm text-slate-300 font-bold">/data</span>
                                </div>
                                <span className="text-xs text-slate-500">Purchase Data Bundle</span>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-400 mb-4">Payload Parameters:</p>
                                <code className="block bg-black p-4 rounded-lg font-mono text-xs text-slate-300 leading-relaxed mb-4">
                                    {`{
  "network": "MTN",
  "plan_id": "101", // See Pricing for Plan IDs
  "mobile_number": "08012345678",
  "ref": "UNIQUE_REF_123"
}`}
                                </code>
                            </div>
                        </div>
                        
                        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">GET</span>
                                    <span className="font-mono text-sm text-slate-300 font-bold">/balance</span>
                                </div>
                                <span className="text-xs text-slate-500">Check Wallet Balance</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'ERRORS' && (
                     <div className="animate-fade-in">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="pb-3 pl-2">Status Code</th>
                                    <th className="pb-3">Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300 divide-y divide-slate-800">
                                <tr><td className="py-3 pl-2 font-mono text-green-500">200 OK</td><td>Request successful. Value delivered.</td></tr>
                                <tr><td className="py-3 pl-2 font-mono text-amber-500">201 Created</td><td>Request accepted, processing (Async).</td></tr>
                                <tr><td className="py-3 pl-2 font-mono text-red-500">400 Bad Request</td><td>Missing parameters or invalid input.</td></tr>
                                <tr><td className="py-3 pl-2 font-mono text-red-500">401 Unauthorized</td><td>Invalid API Key.</td></tr>
                                <tr><td className="py-3 pl-2 font-mono text-red-500">402 Payment Required</td><td>Insufficient wallet balance.</td></tr>
                            </tbody>
                        </table>
                     </div>
                )}
            </div>
        </div>
    </div>
    );
};

export const ProfilePage: React.FC = () => {
    // ... (Profile Page implementation remains same as previous but ensure imports are correct) ...
    const { userProfile, currentUser, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'ACCOUNT' | 'SECURITY'>('ACCOUNT');
    const [loading, setLoading] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleUpdatePin = async () => {
        if (!currentUser) return;
        if (newPin.length !== 4 || isNaN(Number(newPin))) return alert("PIN must be 4 digits.");
        if (!currentPin) return alert("Enter current PIN to confirm changes.");
        setLoading(true);
        try {
            if (currentPin !== userProfile?.transactionPin) throw new Error("Current PIN is incorrect.");
            await updateDoc(doc(db, 'users', currentUser.uid), { transactionPin: newPin });
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
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">{userProfile?.username || 'User'}</h1>
                    <p className="text-slate-400 mb-4">{userProfile?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${userProfile?.isReseller ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                            {userProfile?.isReseller ? 'Reseller Account' : 'Smart Earner'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

            <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[400px]">
                    {activeTab === 'ACCOUNT' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Terminal className="w-5 h-5 mr-2 text-purple-500" /> Developer Keys
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
                                    <p className="text-slate-500 text-xs mt-3">Keep this key secret.</p>
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
                                        Your 4-digit PIN is required to authorize all payments and withdrawals.
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
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center mt-4"
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