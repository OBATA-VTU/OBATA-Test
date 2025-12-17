import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  text?: string;
  subText?: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, text = "Processing Transaction", subText = "Please do not close this window..." }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="flex flex-col items-center justify-center p-8 text-center">
         <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
            <div className="relative bg-slate-900 border border-slate-700 p-6 rounded-full shadow-2xl">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
         </div>
         <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">{text}</h2>
         <p className="text-slate-400 max-w-xs mx-auto text-sm">{subText}</p>
         
         <div className="mt-8 flex space-x-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
         </div>
      </div>
    </div>
  );
};