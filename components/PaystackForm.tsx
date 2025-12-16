/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { CreditCard, Search, Loader2, ShieldCheck, Mail, Zap } from 'lucide-react';

interface PaystackFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
  forcedAmount?: string; // Optional: For reseller fee
  forcedAction?: 'INITIALIZE';
  onSuccess?: () => void;
  title?: string;
}

type ActionType = 'INITIALIZE' | 'VERIFY';

// Paystack Secret Key from Environment Variable
const PAYSTACK_SECRET = import.meta.env.VITE_PAYSTACK_SECRET_KEY || ''; // Usually Paystack Init happens on backend, but if client-side, use Public Key mostly for popups, but user asked for backend API style here.
// NOTE: For pure client side without backend, we usually use "https://js.paystack.co/v1/inline.js" with Public Key.
// However, to maintain the structure requested where we send a request object:
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''; 

export const PaystackForm: React.FC<PaystackFormProps> = ({ onSubmit, isLoading, forcedAmount, forcedAction, title }) => {
  const [action, setAction] = useState<ActionType>(forcedAction || 'INITIALIZE');
  
  // Use env var, do not show in UI
  const useProxy = true;

  // Initialize Fields
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(forcedAmount || '');

  // Verify Fields
  const [reference, setReference] = useState('');

  useEffect(() => {
    if(forcedAmount) setAmount(forcedAmount);
    if(forcedAction) setAction(forcedAction);
  }, [forcedAmount, forcedAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert amount to kobo for Paystack (Amount * 100)
    const amountInKobo = amount ? (parseFloat(amount) * 100).toString() : '0';

    let config: ApiConfig = {
      url: '',
      method: 'GET',
      headers: [
        { key: 'Authorization', value: `Bearer ${PAYSTACK_SECRET}` }, // This implies Secret Key usage which should be backend.
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
        callback_url: window.location.origin, // Redirect back to app
        metadata: {
            custom_fields: [
                { display_name: "Payment For", variable_name: "payment_for", value: title || "Wallet Funding" }
            ]
        }
      });
    } else {
      config.url = `https://api.paystack.co/transaction/verify/${reference}`;
      config.method = 'GET';
    }

    onSubmit(config);
  };

  const isFormValid = () => {
    if (action === 'INITIALIZE') return email && amount;
    if (action === 'VERIFY') return reference;
    return false;
  };

  if (!PAYSTACK_SECRET && !PAYSTACK_KEY) {
     return (
         <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center">
            <h3 className="text-red-500 font-bold mb-2">Configuration Error</h3>
            <p className="text-slate-400 text-sm">VITE_PAYSTACK_PUBLIC_KEY or VITE_PAYSTACK_SECRET_KEY missing in Environment Variables.</p>
         </div>
     )
  }

  return (
    <div className="space-y-6">
      
      {/* Title / Context */}
      {title && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-center space-x-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                  <h4 className="text-white font-bold text-sm">{title}</h4>
                  <p className="text-xs text-slate-400">Complete this payment to proceed.</p>
              </div>
          </div>
      )}

      {/* Tabs - Hide if forced */}
      {!forcedAction && (
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
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="min-h-[100px]">
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
                  disabled={!!forcedAmount}
                  className={`w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-blue-500 ${forcedAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <span>{action === 'INITIALIZE' ? 'Pay Now' : 'Verify Transaction'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};