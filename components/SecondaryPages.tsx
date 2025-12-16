import React, { useState } from 'react';
import { CheckCircle, Zap, Gift, Copy, User, Lock, Mail, Code, Terminal, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    const { userProfile } = useAuth();
    const referralLink = `${window.location.origin}?ref=${userProfile?.referralCode || 'guest'}`;

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
                    <input type="text" placeholder="Enter Coupon Code" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-purple-500" />
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold">Redeem</button>
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
    const { userProfile } = useAuth();
    const [showApiKey, setShowApiKey] = useState(false);
    const [showPin, setShowPin] = useState(false);

    return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-8">
                <img 
                    src={userProfile?.photoURL || "https://i.ibb.co/9HLqrnZG/7c973cd9-cee7-40ed-af89-fd5dc5b5339e670713365240472949.jpg"} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-2 border-slate-700 object-cover"
                />
                <div>
                    <h2 className="text-2xl font-bold text-white">{userProfile?.username || 'User'}</h2>
                    <p className="text-slate-400">{userProfile?.email}</p>
                    <div className="flex items-center mt-2">
                         <span className={`text-xs px-2 py-1 rounded font-bold ${userProfile?.isReseller ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                             {userProfile?.isReseller ? 'Reseller Account' : 'Standard Account'}
                         </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* Basic Info */}
                <div className="space-y-1">
                    <label className="text-sm text-slate-400">Referral Code</label>
                    <div className="flex">
                        <input type="text" readOnly value={userProfile?.referralCode || ''} className="flex-1 bg-slate-950 border border-slate-700 rounded-l-lg p-3 text-white font-mono" />
                         <button 
                            onClick={() => navigator.clipboard.writeText(userProfile?.referralCode || '')}
                            className="bg-slate-800 border border-l-0 border-slate-700 rounded-r-lg px-4 hover:bg-slate-700 text-slate-300"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <hr className="border-slate-800 my-6" />

                <h3 className="text-lg font-bold text-white mb-4">Security & Keys</h3>
                
                {/* Transaction PIN */}
                <div className="space-y-1">
                    <label className="text-sm text-slate-400">Transaction PIN</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                            type={showPin ? "text" : "password"} 
                            readOnly 
                            value={userProfile?.transactionPin || ''} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-white font-mono tracking-widest" 
                        />
                        <button 
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                        >
                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Used for verifying purchases.</p>
                </div>

                {/* API Key */}
                <div className="space-y-1">
                    <label className="text-sm text-slate-400">API Key</label>
                    <div className="relative">
                        <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                            type={showApiKey ? "text" : "password"} 
                            readOnly 
                            value={userProfile?.apiKey || ''} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-10 py-3 text-white font-mono" 
                        />
                        <button 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                        >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4">Save Changes</button>
            </div>
        </div>
    </div>
    );
};