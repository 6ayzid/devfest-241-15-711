import React, { Component, type ReactNode } from 'react';
import { AlertCircleIcon, RefreshIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-error-container)',
              color: 'var(--md-sys-color-on-error-container)',
              borderRadius: '28px',
            }}
            className="p-8 max-w-lg text-center space-y-4 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-white/40 dark:bg-black/20 mx-auto flex items-center justify-center">
              <AlertCircleIcon size={32} />
            </div>
            <h2 className="text-xl font-bold">
              Something went wrong / একটি ত্রুটি ঘটেছে
            </h2>
            <p className="text-sm opacity-90">
              The application encountered an unexpected error. Your documents and data in storage remain safe.
            </p>
            <button
              onClick={this.handleReset}
              className="m3-btn m3-btn-s bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] inline-flex items-center gap-2 rounded-[20px] px-6 py-2 font-bold cursor-pointer hover:opacity-95"
            >
              <RefreshIcon size={16} />
              <span>Reload / পুনরায় লোড করুন</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
