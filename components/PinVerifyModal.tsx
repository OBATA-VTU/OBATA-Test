import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PinVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  amount?: string;
  title?: string;
}

export const PinVerifyModal: React.FC<PinVerifyModalProps> = ({ isOpen, onClose, onVerified, amount, title = "Authorize Transaction" }) => {
  const { userProfile } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = () => {
    const enteredPin = pin.join('');
    if (enteredPin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    if (enteredPin === userProfile?.transactionPin) {
      onVerified();
      setPin(['', '', '', '']);
      setError('');
    } else {
      setError('Incorrect PIN');
      setPin(['', '', '', '']);
      document.getElementById('pin-0')?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-blue-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            {amount && <p className="text-2xl font-bold text-emerald-400 mb-2">₦{amount}</p>}
            <p className="text-slate-400 text-sm mb-8">Enter your 4-digit transaction PIN to confirm.</p>

            <div className="flex gap-3 mb-6">
                {pin.map((digit, i) => (
                    <input
                        key={i}
                        id={`pin-${i}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-12 text-center text-2xl font-bold bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                ))}
            </div>

            {error && (
                <div className="flex items-center text-red-400 text-sm mb-6 bg-red-500/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            <button 
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
                Confirm Payment
            </button>
        </div>
      </div>
    </div>
  );
};