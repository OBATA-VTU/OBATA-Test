import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ApiTester } from './components/ApiTester';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '1rem',
            border: '1px solid #334155'
          }
        }} 
      />
      <div className="w-full max-w-6xl">
        <ApiTester />
      </div>
    </div>
  );
};

export default App;