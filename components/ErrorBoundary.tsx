

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches rendering errors in the component tree and displays a fallback UI.
 */
// Heed to my warning bro think extensively before you do anything and ensure you gimme the best.
// Using React.Component explicitly to resolve property access issues with state and props in this environment.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declaring state property to resolve "Property 'state' does not exist" errors
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  // Explicitly declaring props property to resolve "Property 'props' does not exist" errors
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  // Update state so the next render will show the fallback UI
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Lifecycle method to log error details
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    // Access hasError from state
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

    // Return children from props when no error occurred
    return this.props.children;
  }
}