import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: number;
  title?: string;
}

export const TransactionPinModal: React.FC<TransactionPinModalProps> = ({ 
  isOpen, onClose, onSuccess, amount, title = "Authorize Transaction" 
}) => {
  const { userProfile } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  useEffect(() => {
      if (isOpen) {
          setPin(['', '', '', '']);
          setError('');
          setTimeout(() => document.getElementById('pin-0')?.focus(), 100);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-advance
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
    
    // Auto-submit on fill
    if (index === 3 && value) {
        const finalPin = newPin.slice(0, 3).join('') + value;
        verifyPin(finalPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const verifyPin = (enteredPin: string) => {
      // In production, compare hashed PINs
      if (enteredPin === userProfile?.transactionPin) {
          onSuccess();
          onClose();
      } else {
          setError("Incorrect PIN. Please try again.");
          setPin(['', '', '', '']);
          document.getElementById('pin-0')?.focus();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2">
            <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-blue-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            {amount && <p className="text-2xl font-bold text-emerald-400 mb-4">₦{amount.toLocaleString()}</p>}
            <p className="text-slate-400 text-sm mb-6">Enter your 4-digit PIN to confirm.</p>

            <div className="flex gap-4 mb-6">
                {pin.map((digit, i) => (
                    <input
                        key={i}
                        id={`pin-${i}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                        placeholder="•"
                    />
                ))}
            </div>

            {error && (
                <div className="flex items-center text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}
            
            <p className="text-xs text-slate-500 cursor-pointer hover:text-blue-400">Forgot PIN?</p>
        </div>
      </div>
    </div>
  );
};
