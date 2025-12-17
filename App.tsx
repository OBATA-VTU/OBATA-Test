import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TransactionTerminal } from './components/TransactionTerminal';

const App = () => {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid #1f2937',
            borderRadius: '0.75rem'
          }
        }} 
      />
      <div className="w-full max-w-5xl py-8 px-4 md:py-12">
        <TransactionTerminal />
      </div>
    </div>
  );
};

export default App;