import React, { useEffect, useRef, useState, useContext } from 'react';
import UiContext from '../context/UiContext';

/**
 * TradingView Advanced Chart - Gold, Silver, Platinum (same as TradingView).
 * Docs: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 *
 * Known: The widget may log "support-portal-problems 403" and "DataProblemModel" from inside
 * its iframe; these cannot be suppressed from our page. To hide them in DevTools, use the
 * console filter box and type: -tradingview -403 -DataProblemModel -support-portal
 */
const TradingViewChart = ({ symbol = 'OANDA:XAUUSD', theme = 'dark', height = 400, className = '' }) => {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const scriptLoadedRef = useRef(false);
  const { lang } = useContext(UiContext);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.querySelector('script[src*="tradingview"]')) return;

    setLoadError(false);
    scriptLoadedRef.current = true;

    try {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.onerror = () => setLoadError(true);

      script.innerHTML = JSON.stringify({
        symbol: symbol || 'OANDA:XAUUSD',
        interval: '60',
        timezone: 'Etc/UTC',
        theme,
        style: '1',
        locale: lang === 'ar' ? 'ar' : 'en',
        enable_publishing: false,
        allow_symbol_change: false,
        width: '100%',
        height,
        watchlist: ['OANDA:XAUUSD', 'OANDA:XAGUSD', 'OANDA:XPTUSD']
      });

      container.appendChild(script);
    } catch (err) {
      console.warn('TradingView Chart script error:', err);
      setLoadError(true);
    }

    return () => {
      scriptLoadedRef.current = false;
      if (container) {
        const scripts = container.querySelectorAll('script[src*="tradingview"]');
        scripts.forEach((s) => {
          if (s.parentNode) s.parentNode.removeChild(s);
        });
      }
    };
  }, [symbol, theme, height, lang]);

  if (loadError) {
    return (
      <div
        className={`rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/70 ${className}`}
        style={{ minHeight: height }}
      >
        {lang === 'ar' ? 'تعذر تحميل الشارت. حدّث الصفحة.' : 'Chart could not load. Refresh the page.'}
      </div>
    );
  }

  const chartId = `tradingview-chart-${(symbol || 'XAUUSD').replace(/[^a-zA-Z0-9]/g, '-')}`;
  return (
    <div
      id={chartId}
      className={`tradingview-widget-container ${className}`}
      ref={containerRef}
      style={{ minHeight: height }}
    >
      <div className="tradingview-widget-container__widget" />
    </div>
  );
};

export default TradingViewChart;
