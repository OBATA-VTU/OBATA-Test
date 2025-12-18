import React from 'react';
import { CheckCircle, Share2, X, Download, Zap, Smartphone, Wifi, Tv, ShieldCheck, Copy } from 'lucide-react';
import { Logo } from './Logo';
import { toast } from 'react-hot-toast';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: any;
  loading: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, response, loading }) => {
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 p-8 rounded-3xl flex flex-col items-center animate-pulse">
           <Zap className="w-12 h-12 text-blue-500 animate-bounce mb-4" />
           <p className="text-white font-bold">Generating Receipt...</p>
        </div>
      </div>
    );
  }

  const data = response?.data || response;
  if (!data) return null;

  const isSuccess = response.success || data.status === 'SUCCESS' || data.status === 'success';
  const amount = data.amount || 0;
  const type = data.type || 'Transaction';
  const ref = data.reference || data.id || 'N/A';
  const date = data.date?.toDate ? data.date.toDate().toLocaleString() : new Date().toLocaleString();
  const description = data.description || 'Payment Successful';

  const handleShare = async () => {
    const shareText = `OBATA VTU RECEIPT\nAmount: ₦${amount}\nStatus: ${isSuccess ? 'SUCCESS' : 'FAILED'}\nRef: ${ref}\nDate: ${date}`;
    if (navigator.share) {
        await navigator.share({ title: 'Transaction Receipt', text: shareText });
    } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Receipt copied!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl text-slate-900">
        
        {/* Compact Header */}
        <div className={`p-8 text-center relative ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
            <div className="bg-white p-3 rounded-full inline-flex mb-4 shadow-lg">
                {isSuccess ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <X className="w-10 h-10 text-rose-500" />}
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Transaction Successful</h2>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">OBATA VTU Official Receipt</p>
        </div>

        <div className="p-8 space-y-6">
            <div className="text-center pb-6 border-b border-slate-100">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Amount</p>
                <h1 className="text-4xl font-black tracking-tighter">₦{Number(amount).toLocaleString()}</h1>
            </div>

            <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Service Type</span>
                    <span className="font-bold text-slate-800">{type}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Description</span>
                    <span className="font-bold text-slate-800 text-right max-w-[150px] truncate">{description}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Reference No.</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{ref.slice(-10)}</span>
                        <button onClick={() => {navigator.clipboard.writeText(ref); toast.success("Copied");}}><Copy className="w-3 h-3 text-blue-500" /></button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Transaction Date</span>
                    <span className="font-bold text-slate-800 text-xs">{date}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
                <button 
                    onClick={handleShare}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-black transition-all active:scale-95"
                >
                    <Share2 className="w-4 h-4 mr-2" /> Share Receipt
                </button>
                <button 
                    onClick={onClose}
                    className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Close
                </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-30 mt-4">
                <Logo className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secured by Inlomax</span>
            </div>
        </div>
      </div>
    </div>
  );
};