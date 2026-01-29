import React from 'react';

/**
 * Catches errors from third-party widgets (e.g. TradingView) so the app doesn't crash
 * with "Script error" from cross-origin scripts.
 */
class WidgetErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Widget error (caught by boundary):', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback, title } = this.props;
      if (fallback) return fallback;
      return (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center"
          role="alert"
        >
          <p className="text-sm font-medium text-amber-200">
            {title || 'Widget could not be loaded'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Live widget is temporarily unavailable. Please refresh the page later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default WidgetErrorBoundary;
