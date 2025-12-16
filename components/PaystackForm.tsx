import React, { useState } from 'react';
import { ApiConfig } from '../types';
import { Settings, CreditCard, Search, Loader2, Globe, ShieldCheck, Mail } from 'lucide-react';

interface PaystackFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
}

type ActionType = 'INITIALIZE' | 'VERIFY';

export const PaystackForm: React.FC<PaystackFormProps> = ({ onSubmit, isLoading }) => {
  const [action, setAction] = useState<ActionType>('INITIALIZE');
  
  const [secretKey, setSecretKey] = useState('');
  const [useProxy, setUseProxy] = useState(true);
  const [showConfig, setShowConfig] = useState(true);

  // Initialize Fields
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');

  // Verify Fields
  const [reference, setReference] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert amount to kobo for Paystack (Amount * 100)
    const amountInKobo = amount ? (parseFloat(amount) * 100).toString() : '0';

    let config: ApiConfig = {
      url: '',
      method: 'GET',
      headers: [
        { key: 'Authorization', value: `Bearer ${secretKey}` },
        { key: 'Content-Type', value: 'application/json' }
      ],
      useProxy
    };

    if (action === 'INITIALIZE') {
      config.url = 'https://api.paystack.co/transaction/initialize';
      config.method = 'POST';
      config.body = JSON.stringify({
        email,
        amount: amountInKobo,
        callback_url: "http://localhost:5173/callback_test"
      });
    } else {
      config.url = `https://api.paystack.co/transaction/verify/${reference}`;
      config.method = 'GET';
    }

    onSubmit(config);
  };

  const isFormValid = () => {
    if (!secretKey) return false;
    if (action === 'INITIALIZE') return email && amount;
    if (action === 'VERIFY') return reference;
    return false;
  };

  return (
    <div className="space-y-6">
      
      {/* API Configuration */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <button 
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-white"
        >
          <span className="flex items-center"><Settings className="w-3 h-3 mr-2" /> Paystack Settings</span>
          <span>{showConfig ? 'Hide' : 'Show'}</span>
        </button>
        
        {showConfig && (
          <div className="space-y-3 animate-fadeIn mt-2 pt-2 border-t border-slate-800">
             <div>
              <label className="block text-xs text-slate-500 mb-1">Secret Key (sk_test_...)</label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_test_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="flex items-end">
                 <label className="flex items-center space-x-2 cursor-pointer bg-slate-800 border border-slate-600 rounded px-3 py-2 w-full h-[38px]">
                    <input 
                      type="checkbox" 
                      checked={useProxy} 
                      onChange={(e) => setUseProxy(e.target.checked)} 
                      className="w-4 h-4 rounded text-blue-500 bg-slate-700 border-slate-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex items-center text-sm text-slate-200">
                      <Globe className="w-3 h-3 mr-1.5 text-blue-400" />
                      <span>Use CORS Proxy</span>
                    </div>
                 </label>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setAction('INITIALIZE')}
          className={`flex flex-col items-center justify-center p-3 rounded-md transition-all duration-200 ${
            action === 'INITIALIZE' 
              ? 'bg-slate-700 text-blue-400 shadow-md ring-1 ring-slate-600' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wide">Initialize Payment</span>
        </button>
        <button
          type="button"
          onClick={() => setAction('VERIFY')}
          className={`flex flex-col items-center justify-center p-3 rounded-md transition-all duration-200 ${
            action === 'VERIFY' 
              ? 'bg-slate-700 text-blue-400 shadow-md ring-1 ring-slate-600' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wide">Verify Transaction</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="min-h-[150px]">
          {action === 'INITIALIZE' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Customer Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="customer@example.com" 
                    className="w-full bg-slate-900 border border-slate-600 rounded-md pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Amount (NGN)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="5000" 
                  className="w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-blue-500" 
                />
              </div>
            </div>
          )}

          {action === 'VERIFY' && (
             <div className="space-y-4 animate-fadeIn">
               <div className="space-y-1">
                <label className="text-xs text-slate-400">Transaction Reference</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={reference} 
                    onChange={e => setReference(e.target.value)} 
                    placeholder="T1234567890" 
                    className="w-full bg-slate-900 border border-slate-600 rounded-md pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 font-mono" 
                  />
                </div>
              </div>
             </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wider transition-all duration-200 ${
            isLoading || !isFormValid()
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
              Processing...
            </>
          ) : (
            <>
              {action === 'INITIALIZE' ? <CreditCard className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              <span>{action === 'INITIALIZE' ? 'Initialize Payment' : 'Verify Transaction'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};