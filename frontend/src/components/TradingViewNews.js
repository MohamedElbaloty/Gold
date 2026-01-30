import React, { useEffect, useRef, useState, useContext } from 'react';
import UiContext from '../context/UiContext';

/**
 * TradingView Top Stories news widget - market news from TradingView.
 * Focused on precious metals (gold, silver, platinum) via XAUUSD symbol feed.
 * Embed: https://www.tradingview.com/widget-docs/widgets/news/top-stories/
 */
const TradingViewNews = ({ theme = 'dark', height = 400, className = '' }) => {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const { lang } = useContext(UiContext);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setLoadError(false);
    // Always clean previous widget so we never get two (e.g. Strict Mode or theme/lang change)
    const widgetEl = container.querySelector('.tradingview-widget-container__widget');
    if (widgetEl) widgetEl.innerHTML = '';
    container.querySelectorAll('script[src*="tradingview"]').forEach(s => {
      if (s.parentNode) s.parentNode.removeChild(s);
    });

    try {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
      script.async = true;
      script.onerror = () => setLoadError(true);
      script.onload = () => {};
      // feedMode: 'symbol' = news for this symbol; locale = UI language (dates, labels). Headlines are from TradingView feed (often English).
      script.innerHTML = JSON.stringify({
        feedMode: 'symbol',
        symbol: 'OANDA:XAUUSD',
        colorTheme: theme,
        isTransparent: false,
        displayMode: 'regular',
        width: '100%',
        height: height,
        locale: lang === 'ar' ? 'ar' : 'en'
      });
      container.appendChild(script);
    } catch (err) {
      console.warn('TradingView News script error:', err);
      setLoadError(true);
    }

    return () => {
      if (!container) return;
      container.querySelectorAll('script[src*="tradingview"]').forEach(s => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
      const w = container.querySelector('.tradingview-widget-container__widget');
      if (w) w.innerHTML = '';
    };
  }, [theme, height, lang]);

  if (loadError) {
    return (
      <div className={`rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400 ${className}`} style={{ minHeight: Math.min(height, 200) }}>
        Market news widget unavailable. Check back later.
      </div>
    );
  }

  return (
    <div className={`tradingview-widget-container ${className}`} ref={containerRef} style={{ height }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
};

export default TradingViewNews;
