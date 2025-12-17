import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
// Fixed: Module '"../services/api"' has no exported member 'verifyPayment'. Using verifyTransaction instead.
import { verifyTransaction } from '../services/api';

export const PaymentVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'FAILED'>('VERIFYING');

  useEffect(() => {
      if (!reference) {
          setStatus('FAILED');
          return;
      }
      
      const checkPayment = async () => {
          try {
              // Fixed: Using verifyTransaction instead of verifyPayment
              const res = await verifyTransaction(reference);
              if (res.success && res.data.status === 'success') {
                  setStatus('SUCCESS');
                  setTimeout(() => navigate('/dashboard'), 3000);
              } else {
                  setStatus('FAILED');
              }
          } catch (e) {
              console.error(e);
              setStatus('FAILED');
          }
      };

      checkPayment();
  }, [reference, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {status === 'VERIFYING' && (
            <div className="text-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white">Verifying Payment...</h2>
                <p className="text-slate-400">Please wait while we confirm your transaction.</p>
            </div>
        )}
        {status === 'SUCCESS' && (
            <div className="text-center animate-fade-in-up">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-400">Your wallet has been funded.</p>
                <p className="text-sm text-slate-500 mt-4">Redirecting to dashboard...</p>
            </div>
        )}
        {status === 'FAILED' && (
            <div className="text-center animate-fade-in-up">
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-slate-400">We couldn't verify this transaction.</p>
                <button onClick={() => navigate('/wallet')} className="mt-6 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">Return to Wallet</button>
            </div>
        )}
    </div>
  );
};