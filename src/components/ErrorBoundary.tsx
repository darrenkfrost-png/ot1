import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6 text-red-400">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Glitch Detected</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We encountered an unexpected error while rendering this interface. Our fallback systems are active. Please reload the frame to restore standard operation.
            </p>
            <div className="p-4 bg-slate-950 rounded-xl mb-8 border border-slate-800 text-xs text-slate-500 font-mono overflow-auto max-h-32">
              {this.state.error?.toString() || "Unknown rendering error occurred."}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold tracking-wide transition-colors"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
