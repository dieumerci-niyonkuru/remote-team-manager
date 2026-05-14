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
        <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-gray-800/20 border border-gray-800 p-10 rounded-[40px] backdrop-blur-3xl">
            <div className="w-20 h-20 bg-rose-600/20 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-2xl shadow-rose-600/20">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">System Interruption</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We encountered an unexpected error while processing this module. Your data remains safe.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <RotateCcw size={20} />
              Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
