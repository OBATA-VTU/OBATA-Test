import React, { useRef } from 'react';
import { CheckCircle, XCircle, Share2, X, Download, Zap, Receipt, Calendar, Hash, User, MessageSquare, Smartphone, Wifi, Tv, Printer, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { toast } from 'react-hot-toast';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: any;
  loading: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, response, loading }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] flex flex-col items-center animate-pulse shadow-2xl">
           <div className="relative mb-10">
              <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin"></div>
              <Receipt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-500" />
           </div>
           <p className="text-white font-black text-2xl mb-2 tracking-tighter">PREPARING PROOF</p>
           <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Securing digital signature...</p>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const data = response.data || response;
  const isSuccess = response.success || data.status === 'SUCCESS' || data.status === 'success';
  const amount = data.amount || 0;
  const date = data.date?.toDate ? data.date.toDate().toLocaleString() : (data.date ? new Date(data.date).toLocaleString() : new Date().toLocaleString());
  const ref = data.reference || data.id || 'N/A';
  const description = data.description || 'Service Payment';
  const recipient = data.metadata?.recipient || data.mobileNumber || data.accountNumber || 'Self Service';

  const handleShare = async () => {
      const text = `OBATA VTU RECEIPT\n---\nStatus: ${isSuccess ? 'SUCCESSFUL' : 'FAILED'}\nAmount: ₦${Number(amount).toLocaleString()}\nReference: ${ref}\nDate: ${date}\nDescription: ${description}`;
      try {
          if (navigator.share) {
              await navigator.share({ title: 'Transaction Receipt', text: text });
          } else {
              await navigator.clipboard.writeText(text);
              toast.success("Receipt text copied!");
          }
      } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-sm relative">
        
        {/* Ticket Container with negative space cut-outs */}
        <div ref={receiptRef} className="bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative text-slate-900 group">
            
            {/* Top Security Line */}
            <div className={`h-4 w-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-1000`}></div>
            
            <div className="p-10 pt-12">
                {/* Branding */}
                <div className="flex flex-col items-center mb-12 border-b border-slate-100 pb-10">
                    <Logo className="h-16 w-16 mb-4" showRing={false} />
                    <h2 className="text-3xl font-black tracking-tighter">OBATA VTU</h2>
                    <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">
                        <ShieldCheck className="w-3 h-3 mr-2 text-blue-500" />
                        <span>System Authenticated</span>
                    </div>
                </div>

                {/* Amount Focal Point */}
                <div className="mb-14 text-center relative">
                    <div className={`absolute -top-12 -right-4 p-5 rounded-full ${isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} border-4 border-white shadow-2xl`}>
                        {isSuccess ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>
                    
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Total Transaction Value</p>
                    <div className="inline-flex items-center">
                        <span className="text-2xl font-black text-slate-300 mr-2">₦</span>
                        <h1 className="text-7xl font-black tracking-tighter text-slate-900 tabular-nums">
                            {Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0})}
                        </h1>
                    </div>
                </div>

                {/* Details Matrix */}
                <div className="space-y-7 px-2 mb-12">
                    <div className="flex justify-between items-center group/item">
                        <div className="flex items-center text-slate-400">
                            <MessageSquare className="w-4 h-4 mr-3 group-hover/item:text-blue-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Description</span>
                        </div>
                        <span className="text-sm font-black text-slate-800 text-right max-w-[140px] truncate">{description}</span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <div className="flex items-center text-slate-400">
                            <User className="w-4 h-4 mr-3 group-hover/item:text-blue-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Recipient</span>
                        </div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">{recipient}</span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <div className="flex items-center text-slate-400">
                            <Calendar className="w-4 h-4 mr-3 group-hover/item:text-blue-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Timestamp</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-800">{date}</span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <div className="flex items-center text-slate-400">
                            <Hash className="w-4 h-4 mr-3 group-hover/item:text-blue-600 transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Reference</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{ref}</span>
                    </div>
                </div>

                {/* Decorative Ticket Perforation */}
                <div className="relative h-px bg-slate-100 my-12 overflow-visible">
                    <div className="absolute -left-[56px] -top-5 w-10 h-10 bg-slate-950 rounded-full shadow-inner border-r border-slate-900"></div>
                    <div className="absolute -right-[56px] -top-5 w-10 h-10 bg-slate-950 rounded-full shadow-inner border-l border-slate-900"></div>
                </div>

                {/* Aesthetic Barcode */}
                <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity duration-700 cursor-pointer">
                    <div className="h-16 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#000_3px,#000_6px)] mb-3"></div>
                    <p className="text-[9px] font-mono text-slate-500 font-black uppercase tracking-[1em] ml-4">{ref}</p>
                </div>
            </div>

            {/* Actions Section */}
            <div className="bg-slate-50 p-10 flex gap-5 border-t border-slate-100">
                <button 
                    onClick={handleShare} 
                    className="flex-1 bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center active:scale-95 shadow-2xl shadow-slate-900/20"
                >
                    <Share2 className="w-5 h-5 mr-3" /> Share 
                </button>
                <button 
                    onClick={onClose} 
                    className="w-20 bg-white border border-slate-200 text-slate-400 py-5 rounded-[2rem] transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 flex items-center justify-center shadow-sm"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Floating Accent Zap */}
        <div className="absolute -top-16 -left-6 bg-amber-400 p-6 rounded-[2rem] shadow-3xl -rotate-12 animate-float border-4 border-slate-950">
            <Zap className="w-10 h-10 text-white fill-current" />
        </div>
      </div>
    </div>
  );
};