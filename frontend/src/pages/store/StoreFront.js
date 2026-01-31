import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';
import TradingViewTicker from '../../components/TradingViewTicker';
import WidgetErrorBoundary from '../../components/WidgetErrorBoundary';

const StoreFront = () => {
  const { lang, theme } = useContext(UiContext);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const [prices, setPrices] = useState(null);
  const prevSpotRef = useRef(null);
  const [spotDelta, setSpotDelta] = useState({ gold: null, silver: null, platinum: null });

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'متجر شراء الذهب' : 'Gold Store',
      subtitle:
        lang === 'ar'
          ? 'أسعار بالريال مرتبطة بالسوق + كاتالوجات السبائك المعتمدة + أهم الأخبار.'
          : 'Live SAR pricing + certified bullion catalogs + key market news.',
      catalogs: lang === 'ar' ? 'الكتالوجات' : 'Catalogs',
      all: lang === 'ar' ? 'الكل' : 'All',
      loading: lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...',
      emptyCats: lang === 'ar' ? 'لا توجد كاتالوجات' : 'No catalogs',
      cart: lang === 'ar' ? 'السلة' : 'Cart',
      viewAllNews: lang === 'ar' ? 'عرض كل الأخبار' : 'View all news',
      marketNews: lang === 'ar' ? 'أخبار السوق' : 'Market news',
      marketNewsHint:
        lang === 'ar'
          ? 'آخر الأخبار المتعلقة بالذهب والمعادن.'
          : 'Latest news related to gold and metals.',
      pricesTitle: lang === 'ar' ? 'أسعار السوق بالريال (تحديث مباشر)' : 'Live market prices in SAR',
      gold24: lang === 'ar' ? 'الذهب (24K) / جرام' : 'Gold (24k) / gram',
      silverKg: lang === 'ar' ? 'الفضة / كجم' : 'Silver / kg',
      platinumG: lang === 'ar' ? 'البلاتين / جرام' : 'Platinum / gram',
      tvTitle: lang === 'ar' ? 'شريط TradingView (عالمي بالدولار)' : 'TradingView ticker (USD)'
    }),
    [lang]
  );

  // Spot-only (global price) — poll frequently for near-realtime display
  useEffect(() => {
    let mounted = true;
    async function fetchSpot() {
      try {
        const res = await api.get('/api/pricing/spot');
        if (mounted) setPrices(res.data);
      } catch (_) {
        // Keep existing prices on poll failure
      }
    }
    fetchSpot();
    const t = setInterval(fetchSpot, 2500);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  // Track deltas for UI (up/down) when spot updates
  useEffect(() => {
    const next = {
      gold: prices?.gold?.perGram24k ?? null,
      silver: prices?.silver?.perKg ?? null,
      platinum: prices?.platinum?.perGram ?? null
    };
    const prev = prevSpotRef.current;
    if (prev) {
      setSpotDelta({
        gold: next.gold != null && prev.gold != null ? next.gold - prev.gold : null,
        silver: next.silver != null && prev.silver != null ? next.silver - prev.silver : null,
        platinum: next.platinum != null && prev.platinum != null ? next.platinum - prev.platinum : null
      });
    }
    prevSpotRef.current = next;
  }, [prices]);

  // Load categories once
  useEffect(() => {
    let mounted = true;
    setCategoriesLoading(true);
    api
      .get('/api/store/categories')
      .then((res) => {
        if (!mounted) return;
        setCategories(Array.isArray(res.data?.categories) ? res.data.categories : []);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      })
      .finally(() => {
        if (mounted) setCategoriesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load news list
  useEffect(() => {
    let mounted = true;
    setNewsLoading(true);
    api
      .get('/api/news/feed', { params: { lang, limit: 6 } })
      .then((res) => {
        if (!mounted) return;
        const data = res.data?.articles || res.data || [];
        setNewsArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setNewsArticles([]);
      })
      .finally(() => {
        if (mounted) setNewsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [lang]);

  const currency = prices?.currency || 'SAR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
              <span className="h-2 w-2 rounded-full bg-brand-gold" />
              {lang === 'ar' ? 'شراء الذهب' : 'Buy gold'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{labels.title}</h1>
            <p className="max-w-3xl text-gray-600 dark:text-white/70">{labels.subtitle}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/cart"
              className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-brand-gold text-black text-sm font-semibold hover:opacity-90"
            >
              {labels.cart}
            </Link>
            <Link
              to="/store/catalog"
              className="inline-flex items-center justify-center h-11 px-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-transparent text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {lang === 'ar' ? 'استعرض الكتالوج' : 'Browse catalog'}
            </Link>
          </div>
        </div>
      </div>

      {/* Live SAR cards + TradingView ticker */}
      <div className="mt-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200/70 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{labels.pricesTitle}</div>
          <div className="text-xs text-gray-500 dark:text-white/50">
            {prices?.timestamp ? (
              <>
                {lang === 'ar' ? 'آخر تحديث: ' : 'Updated: '}
                {new Date(prices.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-GB')}
              </>
            ) : null}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Gold */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gradient-to-b from-brand-gold/10 to-white/40 dark:to-black/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-700/70 dark:text-white/60">{labels.gold24}</div>
                <div className="h-8 w-8 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                  <span className="text-brand-gold text-sm font-bold">Au</span>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="text-2xl font-extrabold text-brand-gold tracking-tight">
                  {prices?.gold?.perGram24k != null ? Number(prices.gold.perGram24k).toFixed(3) : '--'}
                  <span className="ml-1 text-xs font-semibold text-gray-700/60 dark:text-white/50">{currency}</span>
                </div>
                {spotDelta.gold != null && spotDelta.gold !== 0 ? (
                  <div className={`text-xs font-semibold ${spotDelta.gold > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {spotDelta.gold > 0 ? '▲' : '▼'} {Math.abs(spotDelta.gold).toFixed(3)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-white/30">—</div>
                )}
              </div>
            </div>

            {/* Silver */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gradient-to-b from-gray-200/40 to-white/40 dark:from-white/10 dark:to-black/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-700/70 dark:text-white/60">{labels.silverKg}</div>
                <div className="h-8 w-8 rounded-2xl bg-white/10 border border-gray-300/40 dark:border-white/20 flex items-center justify-center">
                  <span className="text-gray-700 dark:text-white/80 text-sm font-bold">Ag</span>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {prices?.silver?.perKg != null ? Number(prices.silver.perKg).toFixed(2) : '--'}
                  <span className="ml-1 text-xs font-semibold text-gray-700/60 dark:text-white/50">{currency}</span>
                </div>
                {spotDelta.silver != null && spotDelta.silver !== 0 ? (
                  <div className={`text-xs font-semibold ${spotDelta.silver > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {spotDelta.silver > 0 ? '▲' : '▼'} {Math.abs(spotDelta.silver).toFixed(2)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-white/30">—</div>
                )}
              </div>
            </div>

            {/* Platinum */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gradient-to-b from-sky-200/30 to-white/40 dark:from-sky-400/10 dark:to-black/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-700/70 dark:text-white/60">{labels.platinumG}</div>
                <div className="h-8 w-8 rounded-2xl bg-sky-400/10 border border-sky-300/30 dark:border-sky-300/20 flex items-center justify-center">
                  <span className="text-sky-800 dark:text-sky-200 text-sm font-bold">Pt</span>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="text-2xl font-extrabold text-sky-800 dark:text-sky-200 tracking-tight">
                  {prices?.platinum?.perGram != null ? Number(prices.platinum.perGram).toFixed(3) : '--'}
                  <span className="ml-1 text-xs font-semibold text-gray-700/60 dark:text-white/50">{currency}</span>
                </div>
                {spotDelta.platinum != null && spotDelta.platinum !== 0 ? (
                  <div className={`text-xs font-semibold ${spotDelta.platinum > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {spotDelta.platinum > 0 ? '▲' : '▼'} {Math.abs(spotDelta.platinum).toFixed(3)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-white/30">—</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200/70 dark:border-white/10">
          <div className="px-5 sm:px-6 py-3 text-xs font-semibold text-gray-700/70 dark:text-white/60">
            {labels.tvTitle}
          </div>
          <div className="px-3 sm:px-4 pb-4">
            <WidgetErrorBoundary title={lang === 'ar' ? 'تعذر تحميل شريط TradingView' : 'TradingView ticker unavailable'}>
              <TradingViewTicker theme={theme === 'dark' ? 'dark' : 'light'} height={46} className="w-full" />
            </WidgetErrorBoundary>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.catalogs}</h2>
        </div>

        {categoriesLoading ? (
          <div className="py-6 text-center text-gray-500 dark:text-white/60">{labels.loading}</div>
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.length === 0 ? (
              <div className="col-span-full py-8 text-center text-gray-600 dark:text-white/60">{labels.emptyCats}</div>
            ) : null}
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/store/catalog/${c.slug}`}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/20 p-4 hover:border-brand-gold/60 hover:bg-brand-gold/5 transition text-center"
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{c.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{labels.marketNews}</div>
            <div className="text-sm text-gray-600 dark:text-white/60">{labels.marketNewsHint}</div>
          </div>
          <Link to="/news" className="text-sm text-brand-gold hover:opacity-90">
            {labels.viewAllNews}
          </Link>
        </div>

        {newsLoading ? (
          <div className="py-6 text-center text-gray-500 dark:text-white/60">{labels.loading}</div>
        ) : newsArticles.length === 0 ? (
          <div className="py-6 text-center text-gray-600 dark:text-white/70">{lang === 'ar' ? 'لا توجد أخبار حالياً.' : 'No news at the moment.'}</div>
        ) : (
          <ul className="space-y-3">
            {newsArticles.slice(0, 6).map((a, i) => (
              <li key={a.id || a._id || i}>
                <a
                  href={a.sourceUrl || a.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-900 dark:text-white transition"
                >
                  <div className="text-sm font-medium line-clamp-2">{a.title || a.headline || ''}</div>
                  {a.publishedAt ? (
                    <div className="mt-1 text-xs text-gray-600 dark:text-white/60">
                      {new Date(a.publishedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StoreFront;

