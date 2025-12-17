import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { ShieldCheck, Lock, Zap, Loader2 } from 'lucide-react';

interface PaystackFormProps {
  onSubmit: (config: ApiConfig) => void;
  isLoading: boolean;
  forcedAmount?: string; // This is the total amount to be charged (Principal + Fee)
  forcedAction?: 'INITIALIZE';
  onSuccess?: (reference: string) => void;
  title?: string;
  userEmail?: string;
}

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || '';
  } catch {
    return '';
  }
};

const PAYSTACK_PUBLIC_KEY = getEnv('VITE_PAYSTACK_PUBLIC_KEY') || '';

export const PaystackForm: React.FC<PaystackFormProps> = ({ onSubmit, isLoading, forcedAmount, title, onSuccess, userEmail }) => {
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
        alert("System Error: Payment Gateway Key missing.");
        return;
    }

    setProcessing(true);
    const paystack = await loadPaystack();
    
    // Amount must be in Kobo (Naira * 100)
    // forcedAmount is a string, parse it, multiply by 100
    const amountInKobo = Math.round(parseFloat(forcedAmount || '0') * 100);

    // @ts-ignore
    const handler = (paystack as any).setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: userEmail || 'customer@obatavtu.com',
      amount: amountInKobo,
      currency: 'NGN',
      metadata: {
         custom_fields: [
            { display_name: "Payment For", variable_name: "payment_for", value: title || "Wallet Funding" }
         ]
      },
      callback: function(response: any) {
        setProcessing(false);
        if (onSuccess) {
            onSuccess(response.reference);
        } else {
            alert(`Payment Successful! Ref: ${response.reference}`);
        }
      },
      onClose: function() {
        setProcessing(false);
        alert("Transaction Cancelled");
      }
    });

    handler.openIframe();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePay} className="space-y-5">
        <button
          type="submit"
          disabled={processing || isLoading}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white uppercase tracking-wider transition-all duration-200 ${
            processing || isLoading
              ? 'bg-slate-700 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] hover:shadow-emerald-500/25'
          }`}
        >
          {processing || isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Fund Wallet Securely</span>
            </>
          )}
        </button>
        
        <div className="flex justify-center items-center text-xs text-slate-500 space-x-2">
            <Lock className="w-3 h-3" />
            <span>Secured by Paystack</span>
        </div>
      </form>
    </div>
  );
};