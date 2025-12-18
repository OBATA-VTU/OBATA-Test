import React from 'react';
import { CheckCircle, Share2, X, Zap, Copy } from 'lucide-react';
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
           <p className="text-white font-bold uppercase text-xs tracking-widest">Generating Transaction Receipt...</p>
        </div>
      </div>
    );
  }

  const data = response?.data || response;
  if (!data) return null;

  const isSuccess = response.success || data.status === 'SUCCESS' || data.status === 'success';
  const amount = data.amount || 0;
  const type = data.type || 'Service';
  const ref = data.reference || data.id || 'N/A';
  const date = data.date?.toDate ? data.date.toDate().toLocaleString() : new Date().toLocaleString();
  const description = data.description || 'Processed Successfully';

  const handleShare = async () => {
    const shareText = `OBATA VTU RECEIPT\nType: ${type}\nAmount: ₦${amount}\nRef: ${ref}\nDate: ${date}\nStatus: SUCCESS`;
    if (navigator.share) {
        await navigator.share({ title: 'Transaction Receipt', text: shareText });
    } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Receipt copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl text-slate-900 animate-fade-in-up">
        
        <div className={`p-10 text-center relative ${isSuccess ? 'bg-blue-600' : 'bg-rose-500'}`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <div className="bg-white p-3 rounded-full inline-flex mb-4 shadow-xl">
                {isSuccess ? <CheckCircle className="w-10 h-10 text-blue-600" /> : <X className="w-10 h-10 text-rose-500" />}
            </div>
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">Success!</h2>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Transaction Confirmed</p>
        </div>

        <div className="p-8 space-y-8">
            <div className="text-center pb-6 border-b border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Transaction Amount</p>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 font-mono">₦{Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</h1>
            </div>

            <div className="space-y-4 text-[11px] font-bold uppercase tracking-wide">
                <div className="flex justify-between items-center text-slate-500">
                    <span>Service Category</span>
                    <span className="text-slate-900 font-black">{type}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Description</span>
                    <span className="text-slate-900 font-black text-right max-w-[150px] truncate">{description}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Transaction ID</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900">{ref.slice(-12)}</span>
                        <button onClick={() => {navigator.clipboard.writeText(ref); toast.success("ID Copied");}}><Copy className="w-3.5 h-3.5 text-blue-600" /></button>
                    </div>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Time Captured</span>
                    <span className="text-slate-900 font-black text-[9px]">{date}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <button 
                    onClick={handleShare}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-xl"
                >
                    <Share2 className="w-4 h-4 mr-3" /> Share Proof
                </button>
                <button 
                    onClick={onClose}
                    className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-30 mt-2">
                <Logo className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Verified by Obata Systems</span>
            </div>
        </div>
      </div>
    </div>
  );
};