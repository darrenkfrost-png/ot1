import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Phone, Home } from 'lucide-react';
import { CLINIC } from '../constants';
import { isDeploySkewError, reloadForFreshDeploy } from '../utils/chunkGuard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  /** True once we have decided to reload, so we render nothing rather than
   *  flashing the error card during the moment before the page goes away. */
  recovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    recovering: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    /*
     * The common cause of a crash here is not a bug in the page - it is a tab
     * that was open when a deploy landed, now asking for files that have been
     * renamed. That is recoverable: one reload picks up the current version.
     * The budget in chunkGuard is what stops this becoming a reload loop when
     * the server is genuinely unhealthy.
     */
    if (isDeploySkewError(error)) {
      if (reloadForFreshDeploy()) {
        this.setState({ recovering: true });
        return;
      }
    }

    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.recovering) return null;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      /*
       * Written for a patient, not an engineer. Someone who came here to book
       * an appointment and hit a broken screen needs the clinic's phone
       * number more than they need a stack trace.
       */
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6 text-red-400">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              This page didn&apos;t load
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Something went wrong at our end, not yours. Reloading usually fixes it.
              If it keeps happening, please call the clinic and we will book you in
              over the phone.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold tracking-wide transition-colors"
              >
                <RefreshCw size={18} /> Reload the page
              </button>

              <a
                href={`tel:${CLINIC.telephoneLink}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold tracking-wide transition-colors"
              >
                <Phone size={18} /> Call {CLINIC.telephone}
              </a>

              {/*
                A hard navigation, not a router link: the router is part of
                what has just failed, so it cannot be trusted to get us home.
              */}
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-medium tracking-wide transition-colors"
              >
                <Home size={18} /> Back to the home page
              </a>
            </div>

            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer hover:text-slate-400 transition-colors">
                Technical details
              </summary>
              <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono overflow-auto max-h-32 text-slate-500">
                {this.state.error?.toString() || 'Unknown rendering error occurred.'}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
