import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Prevent "Script error" from third-party widgets (e.g. TradingView) from showing the crash overlay.
// Cross-origin scripts often throw this generic message; the app continues to work.
function isThirdPartyScriptError(message, source) {
  const msg = String(message || '').trim();
  const isScriptError = msg === 'Script error.' || msg === 'Script error' || msg === '';
  const isTradingView = source && (source.includes('tradingview.com') || source.includes('s3.tradingview.com'));
  return isScriptError || isTradingView;
}

// Disable React error overlay for third-party script errors
if (typeof window !== 'undefined' && window.addEventListener) {
  // Override React's error overlay handler (webpack-dev-server)
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (isThirdPartyScriptError(message, source)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Third-party script error suppressed:', { message, source });
      }
      return true; // Prevent default error handling and overlay
    }
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Also prevent error overlay from showing via handleError (React's internal)
  const originalHandleError = window.__REACT_ERROR_OVERLAY_GLOBAL_HANDLER__;
  if (originalHandleError) {
    window.__REACT_ERROR_OVERLAY_GLOBAL_HANDLER__ = function(error, isFatal) {
      if (error && isThirdPartyScriptError(error.message || error.toString(), error.source)) {
        console.warn('React overlay suppressed for third-party error:', error);
        return;
      }
      return originalHandleError(error, isFatal);
    };
  }
}

window.addEventListener('error', (event) => {
  if (isThirdPartyScriptError(event.message, event.filename)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Third-party script error suppressed:', event.message);
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return true;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (isThirdPartyScriptError(msg)) {
    event.preventDefault();
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Third-party script rejection suppressed:', msg);
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
