import React from 'react';
import { ApiResponse } from '../types';
import { Loader2, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';

interface ResponseDisplayProps {
  response: ApiResponse | null;
  loading: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-xs font-mono animate-pulse">Waiting for response...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50">
        <Terminal className="w-16 h-16 mb-4" />
        <p className="text-sm font-mono">Ready to send request.</p>
      </div>
    );
  }

  const isError = !response.success || response.status >= 400;

  return (
    <div className="w-full h-full font-mono text-sm relative group">
      {/* Raw JSON View */}
      <pre className={`w-full min-h-full p-4 rounded-lg bg-opacity-50 overflow-x-auto ${isError ? 'text-red-300' : 'text-green-300'}`}>
        {JSON.stringify(response.data, null, 2)}
      </pre>
      
      {/* Visual Indicator Overlay (Fades out) */}
      <div className="absolute top-0 left-0 p-4 pointer-events-none opacity-100 group-hover:opacity-20 transition-opacity">
         {isError ? (
             <div className="flex items-center text-red-500 space-x-2">
                 <AlertTriangle className="w-5 h-5" />
                 <span className="font-bold">Error</span>
             </div>
         ) : (
             <div className="flex items-center text-green-500 space-x-2">
                 <CheckCircle className="w-5 h-5" />
                 <span className="font-bold">Success</span>
             </div>
         )}
      </div>
    </div>
  );
};