import React from 'react';
import { ApiResponse } from '../types';
import { AlertCircle, CheckCircle, Clock, Database, FileJson, ShoppingBag } from 'lucide-react';

interface ResponseDisplayProps {
  response: ApiResponse | null;
  loading: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-slate-700 border-b-cyan-500 rounded-full animate-spin animation-delay-500"></div>
        </div>
        <p className="animate-pulse font-medium">Processing Transaction...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-700 rounded-xl p-10">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
           <ShoppingBag className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-400 mb-2">No Transactions Yet</h3>
        <p className="text-sm text-center max-w-xs">
          Select a service on the left, enter details, and click Purchase to see the transaction receipt here.
        </p>
      </div>
    );
  }

  const isSuccess = response.success;
  const statusColor = isSuccess ? 'text-emerald-400' : 'text-red-400';
  const borderColor = isSuccess ? 'border-emerald-500/30' : 'border-red-500/30';
  const bgBadge = isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10';

  return (
    <div className="flex flex-col h-full space-y-4 animate-fadeIn">
      {/* Status Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border ${borderColor} ${bgBadge}`}>
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          {isSuccess ? (
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-500" />
          )}
          <div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono ${statusColor}`}>
                {response.status || 'ERR'}
              </span>
              <span className={`font-medium ${statusColor}`}>
                {response.statusText || (response.status === 0 ? 'Network Error' : 'Unknown')}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Transaction Status Code</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-700/50">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
            <span className="font-mono text-slate-200">{response.duration}ms</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center">
            <span className="text-xs uppercase font-bold text-slate-500 mr-1.5">Size</span>
            <span className="font-mono text-slate-200">
              {JSON.stringify(response.data).length} B
            </span>
          </div>
        </div>
      </div>

      {/* Response Tabs/Body */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
           <div className="flex items-center space-x-2 text-slate-400">
              <FileJson className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Transaction Receipt (JSON)</span>
           </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <pre className="font-mono text-xs sm:text-sm text-blue-300 leading-relaxed">
            {typeof response.data === 'object' 
              ? JSON.stringify(response.data, null, 2) 
              : response.data}
          </pre>
        </div>
      </div>

       {/* Headers (Collapsed/Footer-like) */}
       <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-3">
         <details className="group">
           <summary className="flex items-center cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors">
              <div className="flex items-center">
                <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                API Response Headers
              </div>
           </summary>
           <div className="mt-3 grid grid-cols-1 gap-1 pl-4 border-l-2 border-slate-700">
             {Object.entries(response.headers).map(([key, value]) => (
               <div key={key} className="flex flex-col sm:flex-row sm:items-baseline text-xs font-mono">
                 <span className="text-orange-400 min-w-[150px] mr-2">{key}:</span>
                 <span className="text-slate-300 break-all">{value}</span>
               </div>
             ))}
             {Object.keys(response.headers).length === 0 && (
                <span className="text-slate-600 text-xs italic">No headers captured</span>
             )}
           </div>
         </details>
       </div>
    </div>
  );
};