import React, { useEffect, useRef, useState } from 'react';

/**
 * TradingView Ticker Tape widget - live prices for Gold, Silver, Platinum (TradingView data).
 * Embed: https://www.tradingview.com/widget-docs/widgets/tickers/ticker-tape/
 */
const TradingViewTicker = ({ theme = 'dark', height = 46, className = '' }) => {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || scriptLoadedRef.current) return;
    setLoadError(false);
    scriptLoadedRef.current = true;

    try {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.onerror = () => {
        setLoadError(true);
      };
      script.onload = () => {
        // Script loaded successfully
      };
      script.innerHTML = JSON.stringify({
        symbols: [
          { description: 'Gold', proName: 'OANDA:XAUUSD' },
          { description: 'Silver', proName: 'OANDA:XAGUSD' },
          { description: 'Platinum', proName: 'OANDA:XPTUSD' }
        ],
        showSymbolLogo: true,
        colorTheme: theme,
        isTransparent: false,
        displayMode: 'compact',
        width: '100%',
        height: height
      });
      container.appendChild(script);
    } catch (err) {
      console.warn('TradingView Ticker script error:', err);
      setLoadError(true);
    }

    return () => {
      scriptLoadedRef.current = false;
      if (container) {
        const scripts = container.querySelectorAll('script[src*="tradingview"]');
        scripts.forEach(s => {
          if (s.parentNode) {
            s.parentNode.removeChild(s);
          }
        });
      }
    };
  }, [theme, height]);

  if (loadError) {
    return (
      <div className={`rounded-xl border border-white/10 bg-white/5 p-3 text-center text-sm text-gray-400 ${className}`} style={{ minHeight: height }}>
        Live ticker unavailable. Check back later.
      </div>
    );
  }

  return (
    <div className={`tradingview-widget-container ${className}`} ref={containerRef} style={{ height }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
};

export default TradingViewTicker;
