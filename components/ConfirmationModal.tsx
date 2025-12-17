import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  details: { label: string; value: string }[];
  amount: number;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, details, amount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white">Confirm Transaction</h3>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6">
            <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800">
                <p className="text-slate-500 text-xs text-center uppercase mb-1">Total Amount</p>
                <h2 className="text-3xl font-bold text-white text-center">₦{amount.toLocaleString()}</h2>
            </div>
            
            <div className="space-y-3 mb-6">
                {details.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 text-slate-400 hover:text-white transition-colors font-bold">Cancel</button>
                <button 
                    onClick={onConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg"
                >
                    Proceed
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};