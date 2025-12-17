import React from 'react';
import { CheckCircle, XCircle, Share2, X, Download, Copy, Zap } from 'lucide-react';
import { ApiResponse } from '../types';
import { Logo } from './Logo';
import { toast } from 'react-hot-toast';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: any; // Can be ApiResponse or generic object
  loading: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, response, loading }) => {
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center animate-bounce-slow shadow-2xl">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
           <p className="text-white font-bold text-xl mb-2">Processing Transaction</p>
           <p className="text-slate-400 text-sm">Please do not close this window.</p>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const data = response.data || response; // Handle different structures
  const isSuccess = response.success || data.status === 'SUCCESS' || data.status === 'success';
  const amount = data.amount || 0;
  const date = data.date?.toDate ? data.date.toDate().toLocaleString() : (data.date ? new Date(data.date).toLocaleString() : new Date().toLocaleString());
  const ref = data.reference || data.id || 'N/A';
  const description = data.description || 'Transaction';
  const recipient = data.metadata?.recipient || data.mobileNumber || data.accountNumber || 'Self';

  const handleShare = async () => {
      const text = `OBATA VTU Transaction Receipt\n\nStatus: ${isSuccess ? 'SUCCESS' : 'FAILED'}\nAmount: ₦${Number(amount).toLocaleString()}\nDate: ${date}\nRef: ${ref}\nDescription: ${description}`;
      try {
          if (navigator.share) {
              await navigator.share({ title: 'Transaction Receipt', text: text });
          } else {
              await navigator.clipboard.writeText(text);
              toast.success("Receipt copied to clipboard");
          }
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className={`h-2 bg-gradient-to-r ${isSuccess ? 'from-emerald-500 to-green-400' : 'from-red-500 to-rose-400'}`}></div>
        
        <div className="p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 transition-colors">
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-4">
                    <Logo className="w-12 h-12" showRing={false} />
                </div>
                <h2 className="text-slate-900 font-bold text-lg mb-1">Transaction Receipt</h2>
                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isSuccess ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{isSuccess ? 'Successful' : 'Failed'}</span>
                </div>
            </div>

            <div className="border-t border-b border-slate-100 py-6 mb-6">
                <p className="text-slate-400 text-xs uppercase font-bold text-center mb-2">Total Amount</p>
                <h1 className="text-4xl font-extrabold text-slate-900 text-center tracking-tight">
                    ₦{Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </h1>
            </div>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Date</span>
                    <span className="text-slate-800 font-medium text-right w-1/2">{date}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Reference</span>
                    <span className="text-slate-800 font-mono font-medium">{String(ref).substring(0, 18)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Description</span>
                    <span className="text-slate-800 font-medium text-right w-1/2">{description}</span>
                </div>
                {recipient !== 'Self' && (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Recipient</span>
                        <span className="text-slate-800 font-medium text-right">{recipient}</span>
                    </div>
                )}
            </div>

            <div className="mt-8 flex gap-3">
                <button onClick={handleShare} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center">
                    <Share2 className="w-4 h-4 mr-2" /> Share Receipt
                </button>
                <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">
                    Close
                </button>
            </div>
        </div>
        
        <div className="bg-slate-50 py-3 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center">
                <Zap className="w-3 h-3 mr-1 text-slate-400" /> Powered by OBATA VTU
            </p>
        </div>
      </div>
    </div>
  );
};