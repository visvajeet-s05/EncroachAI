import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in React lifecycle:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#131820] border border-[#E74C3C]/40 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#E74C3C]/10 border border-[#E74C3C]/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[#E74C3C]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">View Render Issue</h3>
            <p className="text-xs text-[#8B94A3] mb-4 font-mono">
              {this.state.error?.message || 'An unexpected rendering anomaly occurred in the corridor visualizer.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] font-mono text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

