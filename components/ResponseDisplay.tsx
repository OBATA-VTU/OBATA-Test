import React from 'react';
import { ApiResponse } from '../types';
import { AlertCircle, CheckCircle, Clock, Receipt, ShoppingBag, X } from 'lucide-react';

interface ResponseDisplayProps {
  response: ApiResponse | null;
  loading: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6 animate-fade-in-up">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-slate-800 border-b-cyan-500 rounded-full animate-spin animation-delay-500"></div>
        </div>
        <p className="animate-pulse font-medium text-lg">Processing Transaction...</p>
        <p className="text-xs text-slate-600">Please do not refresh the page.</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl p-10 bg-slate-900/30">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
           <ShoppingBag className="w-12 h-12 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-400 mb-2">No Active Orders</h3>
        <p className="text-sm text-center max-w-xs text-slate-500 leading-relaxed">
          Your transaction receipt will appear here automatically after you complete a purchase.
        </p>
      </div>
    );
  }

  const isSuccess = response.success;

  // Extract message safely
  let message = "Transaction Completed";
  let details: any = null;

  if (typeof response.data === 'object' && response.data !== null) {
      if (response.data.message) message = response.data.message;
      if (response.data.data) details = response.data.data;
      else details = response.data;
  } else if (typeof response.data === 'string') {
      message = response.data.substring(0, 100);
  }

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className={`flex-1 rounded-2xl p-8 border ${isSuccess ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-red-950/20 border-red-500/20'} flex flex-col items-center text-center relative overflow-hidden`}>
        
        {/* Background Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'} blur-3xl rounded-full -z-10`}></div>

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isSuccess ? <CheckCircle className="w-10 h-10" /> : <X className="w-10 h-10" />}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{isSuccess ? 'Transaction Successful' : 'Transaction Failed'}</h2>
        <p className="text-slate-400 mb-8 max-w-sm">{message}</p>

        {details && (
            <div className="w-full bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-left space-y-3">
                <div className="flex items-center space-x-2 text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">
                    <Receipt className="w-4 h-4" /> <span>Receipt Details</span>
                </div>
                {Object.entries(details).map(([key, value]) => {
                     if (typeof value === 'object' || value === null || key === 'full_response') return null;
                     return (
                        <div key={key} className="flex justify-between text-sm border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                            <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-slate-200 font-mono font-medium truncate max-w-[150px]">{String(value)}</span>
                        </div>
                     );
                })}
            </div>
        )}

        <div className="mt-auto pt-8 w-full">
            <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
                Start New Transaction
            </button>
        </div>
      </div>
    </div>
  );
};