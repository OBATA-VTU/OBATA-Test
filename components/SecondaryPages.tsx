import React from 'react';
import { CheckCircle, Zap, Gift, Copy, User, Lock, Mail, Code, Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ResellerPage: React.FC = () => (
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
              <button className="bg-white text-orange-700 font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-orange-50 transition-transform hover:scale-105">
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
);

export const RewardsPage: React.FC = () => {
    const { userProfile } = useAuth();
    const referralLink = `${window.location.origin}?ref=${userProfile?.username || 'guest'}`;

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

export const ApiDocsPage: React.FC = () => (
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
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-slate-300">
                        Authorization: Token YOUR_API_KEY
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-2">Endpoints</h3>
                    <div className="space-y-2">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">POST</span>
                                <span className="font-mono text-sm text-slate-300">/api/data</span>
                            </div>
                            <span className="text-xs text-slate-500">Purchase Data</span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">POST</span>
                                <span className="font-mono text-sm text-slate-300">/api/airtime</span>
                            </div>
                            <span className="text-xs text-slate-500">Purchase Airtime</span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">GET</span>
                                <span className="font-mono text-sm text-slate-300">/api/balance</span>
                            </div>
                            <span className="text-xs text-slate-500">Check Balance</span>
                        </div>
                    </div>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">
                    View Full Documentation
                </button>
            </div>
        </div>
    </div>
);

export const ProfilePage: React.FC = () => {
    const { userProfile } = useAuth();
    return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-500" /> Account Settings
            </h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm text-slate-400">Username</label>
                        <input type="text" readOnly value={userProfile?.username || ''} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-slate-400">Role</label>
                        <input type="text" readOnly value={userProfile?.role || ''} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm text-slate-400">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input type="email" readOnly value={userProfile?.email || ''} className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-slate-500 cursor-not-allowed" />
                    </div>
                </div>

                <hr className="border-slate-800 my-6" />

                <h3 className="text-lg font-bold text-white mb-4">Security</h3>
                <div className="space-y-4">
                     <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-slate-800 p-2 rounded-lg"><Lock className="w-4 h-4 text-slate-300" /></div>
                            <div>
                                <p className="text-sm font-bold text-white">Change Password</p>
                                <p className="text-xs text-slate-500">Update your login password</p>
                            </div>
                        </div>
                        <button className="text-blue-500 text-sm font-bold">Update</button>
                     </div>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4">Save Changes</button>
            </div>
        </div>
    </div>
    );
};