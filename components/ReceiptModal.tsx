import React from 'react';
import { CheckCircle, XCircle, Share2, X, Download } from 'lucide-react';
import { ApiResponse } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: ApiResponse | null;
  loading: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, response, loading }) => {
  if (!isOpen) return null;

  // Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center animate-bounce-slow">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-white font-bold text-lg">Processing Transaction...</p>
           <p className="text-slate-400 text-sm">Please do not close this window.</p>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const isSuccess = response.success;
  
  // Extract user-friendly message
  let message = "Transaction Completed";
  let amount = "0.00";
  let ref = "N/A";
  
  // Attempt to parse useful info from the response data, assuming it might be unstructured
  if (response.data) {
     if (typeof response.data === 'object') {
         message = response.data.message || (isSuccess ? 'Transaction Successful' : 'Transaction Failed');
         // Try to find amount or reference in common fields
         amount = response.data.amount || response.data.data?.amount || '0.00';
         ref = response.data.reference || response.data.data?.reference || response.data.requestId || 'N/A';
     } else if (typeof response.data === 'string') {
         message = response.data;
     }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Header Pattern */}
        <div className={`h-32 ${isSuccess ? 'bg-emerald-600' : 'bg-red-600'} flex items-center justify-center relative`}>
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
            <div className="bg-white p-4 rounded-full shadow-lg translate-y-8">
                {isSuccess ? (
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                ) : (
                    <XCircle className="w-12 h-12 text-red-600" />
                )}
            </div>
        </div>

        {/* Content */}
        <div className="pt-12 pb-8 px-8 text-center">
            <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-emerald-900' : 'text-red-900'}`}>
                {isSuccess ? 'Success!' : 'Failed'}
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {message}
            </p>

            {isSuccess && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Amount Paid</p>
                    <h3 className="text-3xl font-bold text-slate-900">₦{amount}</h3>
                    <div className="my-3 border-t border-dashed border-slate-200"></div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Ref:</span>
                        <span className="font-mono text-slate-700 font-bold">{String(ref).substring(0, 15)}...</span>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
                    Close
                </button>
                {isSuccess && (
                    <button className="flex items-center justify-center w-12 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};