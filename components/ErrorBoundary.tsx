import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              We're sorry, but the application encountered an unexpected error. Our team has been notified.
            </p>

            <div className="bg-black/30 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32 border border-slate-800">
               <code className="text-xs text-red-400 font-mono">
                 {this.state.error?.toString()}
               </code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Reload
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-colors"
              >
                <Home className="w-4 h-4 mr-2" /> Home
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800">
                <a href="mailto:support@obatavtu.com" className="text-slate-500 hover:text-white text-sm">Contact Support</a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}