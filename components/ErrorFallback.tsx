import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  componentStack?: string;
  resetError?: () => void;
}

/**
 * ErrorFallback - Component displayed when an error occurs
 * Used by PostHogErrorBoundary to show a user-friendly error message
 */
export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#111111] px-4">
      <div className="text-white text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-[#d4d4d4] text-sm">
            We're sorry, but something unexpected happened. Please try reloading the app.
          </p>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-xl text-left">
            <p className="text-red-400 text-xs font-mono break-all">
              {error.toString()}
            </p>
            {error.stack && (
              <pre className="text-red-300 text-xs mt-2 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleReload}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Reload App
          </button>
          
          {resetError && (
            <button
              onClick={resetError}
              className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
