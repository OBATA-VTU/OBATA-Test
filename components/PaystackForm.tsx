import React, { useState } from 'react';
import { ApiConfig } from '../types';
import { CreditCard, ShieldCheck, Mail, Zap, Loader2 } from 'lucide-react';

interface PaystackFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
  forcedAmount?: string;
  forcedAction?: 'INITIALIZE';
  onSuccess?: () => void;
  title?: string;
}

const PAYSTACK_PUBLIC_KEY = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || '';

export const PaystackForm: React.FC<PaystackFormProps> = ({ onSubmit, isLoading, forcedAmount, forcedAction, title, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(forcedAmount || '');
  const [processing, setProcessing] = useState(false);

  // Load Paystack script dynamically
  const loadPaystack = () => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve((window as any).PaystackPop);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve((window as any).PaystackPop);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PAYSTACK_PUBLIC_KEY) {
        alert("Paystack Public Key missing!");
        return;
    }

    setProcessing(true);
    const paystack = await loadPaystack();
    
    // @ts-ignore
    const handler = (paystack as any).setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: parseFloat(amount) * 100, // Kobo
      currency: 'NGN',
      metadata: {
         custom_fields: [
            { display_name: "Payment For", variable_name: "payment_for", value: title || "Wallet Funding" }
         ]
      },
      callback: function(response: any) {
        setProcessing(false);
        // Verify payment on backend normally, here we assume success for client-side
        // You would typically call an API endpoint here to verify reference
        if (onSuccess) {
            onSuccess();
        } else {
            // For Wallet Funding, we just pass verification to main handler
             onSubmit({
                url: `https://api.paystack.co/transaction/verify/${response.reference}`,
                method: 'GET',
                headers: [{ key: 'Authorization', value: `Bearer ${(import.meta as any).env.VITE_PAYSTACK_SECRET_KEY || ''}` }], // WARNING: Only if user insists on client side verification. ideally send ref to backend.
                useProxy: true
            });
        }
      },
      onClose: function() {
        setProcessing(false);
        alert('Transaction was not completed, window closed.');
      }
    });

    handler.openIframe();
  };

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

      <form onSubmit={handlePay} className="space-y-5">
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
                    required
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
                  required
                  className={`w-full bg-slate-900 border border-slate-600 rounded-md p-2.5 text-sm text-white focus:border-blue-500 ${forcedAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

        <button
          type="submit"
          disabled={processing || isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wider transition-all duration-200 ${
            processing || isLoading
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]'
          }`}
        >
          {processing || isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay securely with Paystack</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};