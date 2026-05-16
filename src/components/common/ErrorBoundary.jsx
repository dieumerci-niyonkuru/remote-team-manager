import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Platform Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060b18] flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-brand/5 blur-[120px] pointer-events-none" />
          <div className="max-w-md w-full bg-[#0d1425]/40 border border-white/5 p-12 rounded-[48px] backdrop-blur-3xl shadow-2xl relative z-10">
            <div className="w-24 h-24 bg-rose-600/10 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto mb-10 border border-rose-500/20">
              <AlertTriangle size={48} />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">System Halt</h1>
            <p className="text-gray-400 mb-10 leading-relaxed font-medium">
              A critical module encountered an unexpected interruption. We've captured the diagnostics and your workspace state is preserved.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-lg"
              >
                <RotateCcw size={22} />
                REBOOT PLATFORM
              </button>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="w-full text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                Attempt Recovery Without Reboot
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
