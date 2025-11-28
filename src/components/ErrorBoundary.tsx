import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or send to an error reporting service
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI tailored to the application's theme (e.g., for map errors)
      return (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 max-w-md text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">
              An error occurred while loading this component. Please try refreshing the page or contact support.
            </p>
            {this.state.error && (
              <p className="text-xs text-red-500 italic">
                Error details: {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
