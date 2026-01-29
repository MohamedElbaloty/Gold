import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';
import TradingViewTicker from '../components/TradingViewTicker';
import TradingViewChart from '../components/TradingViewChart';
import TradingViewNews from '../components/TradingViewNews';
import WidgetErrorBoundary from '../components/WidgetErrorBoundary';

const HomePage = () => {
  const { lang, theme } = useContext(UiContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogFromUrl = searchParams.get('catalog') || '';

  const [prices, setPrices] = useState(null);
  const [categories, setCategories] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogProductsLoading, setCatalogProductsLoading] = useState(false);
  const [selectedCatalogSlug, setSelectedCatalogSlug] = useState('');
  const CATALOG_INITIAL_LIMIT = 6;
  const CATALOG_MORE_STEP = 6;
  const [catalogDisplayLimit, setCatalogDisplayLimit] = useState(CATALOG_INITIAL_LIMIT);
  const [error, setError] = useState('');
  const [selectedChartMetal, setSelectedChartMetal] = useState('gold');

  const labels = useMemo(
    () => ({
      store: lang === 'ar' ? 'المتجر' : 'Store',
      news: lang === 'ar' ? 'الأخبار' : 'News',
      chart: lang === 'ar' ? 'RealTime Metal Price Chart' : 'RealTime Metal Price Chart',
      gold: lang === 'ar' ? 'الذهب (XAU/USD)' : 'Gold (XAU/USD)',
      silver: lang === 'ar' ? 'الفضة (XAG/USD)' : 'Silver (XAG/USD)',
      platinum: lang === 'ar' ? 'البلاتين (XPT/USD)' : 'Platinum (XPT/USD)',
      newsFromTv: lang === 'ar' ? 'أخبار الذهب والفضة والبلاتين من TradingView' : 'Gold, Silver & Platinum News from TradingView',
      newsNoteAr: 'العناوين من مصدر TradingView وقد تكون بالإنجليزية.',
      newsNoteEn: 'Headlines from TradingView; interface follows your language.',
      viewAll: lang === 'ar' ? 'عرض المزيد' : 'Show more',
      catalog: lang === 'ar' ? 'الكتالوج' : 'Catalog',
      catalogAll: lang === 'ar' ? 'الكل' : 'All',
      catalogEmpty: lang === 'ar' ? 'لا يوجد منتجات' : 'No products found',
      catalogSearch: lang === 'ar' ? 'بحث' : 'Search',
      cart: lang === 'ar' ? 'السلة' : 'Cart',
      more: lang === 'ar' ? 'المزيد' : 'More'
    }),
    [lang]
  );

  // Spot-only (global price) — poll periodically for homepage display
  useEffect(() => {
    let mounted = true;
    async function fetchSpot() {
      try {
        const res = await api.get('/api/pricing/spot');
        if (mounted) setPrices(res.data);
      } catch (_) {
        // Keep existing prices on poll failure; initial load error handled below
      }
    }
    fetchSpot();
    const t = setInterval(fetchSpot, 30000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  // Categories — initial load + poll (news on homepage from TradingView widget)
  useEffect(() => {
    let mounted = true;
    setError('');
    async function load() {
      try {
        const catsRes = await api.get('/api/store/categories').catch(() => ({ data: { categories: [] } }));
        if (!mounted) return;
        setCategories(catsRes?.data?.categories || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || 'Failed to load data');
      }
    }
    load();
    const poll = setInterval(load, 60 * 1000);
    return () => { mounted = false; clearInterval(poll); };
  }, [lang]);

  // Sync selected catalog from URL (e.g. /?catalog=pamp-bullion)
  useEffect(() => {
    setSelectedCatalogSlug(catalogFromUrl);
  }, [catalogFromUrl]);

  // Reset catalog display limit when category changes
  useEffect(() => {
    setCatalogDisplayLimit(CATALOG_INITIAL_LIMIT);
  }, [selectedCatalogSlug]);

  // Fetch catalog products when category changes
  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setCatalogProductsLoading(true);
      try {
        const params = { limit: 24 };
        if (selectedCatalogSlug) params.categorySlug = selectedCatalogSlug;
        const res = await api.get('/api/store/products', { params });
        if (mounted) setCatalogProducts(res.data.products || []);
      } catch (e) {
        if (mounted) setCatalogProducts([]);
      } finally {
        if (mounted) setCatalogProductsLoading(false);
      }
    }
    loadProducts();
    return () => { mounted = false; };
  }, [selectedCatalogSlug]);

  const currency = prices?.currency || 'SAR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {error ? <div className="mt-3 text-sm text-red-500">{error}</div> : null}

      {/* Hero: split between store (شراء الذهب) and trading (تداول الذهب) */}
      <section className="mt-4 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-gold mb-3">
              {lang === 'ar' ? 'شراء الذهب' : 'Buy Physical Gold'}
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-4">
              {lang === 'ar'
                ? 'تسوّق السبائك والعملات الذهبية المعتمدة مباشرة من المتجر مع أسعار مرتبطة بالأسعار العالمية.'
                : 'Shop bullion and certified gold products directly from the store with prices linked to live markets.'}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            {prices?.gold?.perGram24k && (
              <div className="text-xs text-white/70">
                <div className="font-semibold">
                  {lang === 'ar' ? 'سعر 24 قيراط / جرام' : '24k / gram'}
                </div>
                <div className="text-lg font-bold text-brand-gold">
                  {Number(prices.gold.perGram24k).toFixed(3)} {currency}
                </div>
              </div>
            )}
            <Link
              to="/store/catalog"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-brand-gold text-black text-sm font-semibold"
            >
              {lang === 'ar' ? 'الذهاب للمتجر' : 'Go to Store'}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-gold mb-3">
              {lang === 'ar' ? 'تداول الذهب' : 'Trade Gold'}
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-4">
              {lang === 'ar'
                ? 'فتح وإغلاق صفقات شراء وبيع ذهب حقيقية. أسعار الشراء والبيع خاصة بالمنصة وتضم هامشنا.'
                : 'Open and close real gold buy/sell positions. Buy/sell prices are platform-specific and include our spread.'}
            </p>
          </div>
          <div className="flex items-center justify-end mt-2">
            <Link
              to="/trading"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold"
            >
              {lang === 'ar' ? 'بدء التداول' : 'Start Trading'}
            </Link>
          </div>
        </div>
      </section>

      {/* TradingView live global prices (ticker strip with green/red) */}
      <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">
              {lang === 'ar' ? 'أسعار عالمية بالدولار' : 'Live global prices in USD'}
            </span>
          </div>
          {prices && (
            <span className="text-[10px] sm:text-xs text-white/60">
              {lang === 'ar'
                ? `تقريباً بالريال: ذهب ≈ ${Number(prices.gold?.perGram24k || 0).toFixed(3)} ${currency}/جم، فضة ≈ ${Number(
                    prices.silver?.perKg || 0
                  ).toFixed(2)} ${currency}/كجم، بلاتين ≈ ${Number(prices.platinum?.perGram || 0).toFixed(3)} ${currency}/جم`
                : `Approx in SAR: Gold ≈ ${Number(prices.gold?.perGram24k || 0).toFixed(3)} ${currency}/g, Silver ≈ ${Number(
                    prices.silver?.perKg || 0
                  ).toFixed(2)} ${currency}/kg, Platinum ≈ ${Number(prices.platinum?.perGram || 0).toFixed(3)} ${currency}/g`}
            </span>
          )}
        </div>
        <WidgetErrorBoundary title={lang === 'ar' ? 'تعذر تحميل شريط TradingView' : 'TradingView ticker unavailable'}>
          <TradingViewTicker theme={theme === 'dark' ? 'dark' : 'light'} height={46} className="w-full" />
        </WidgetErrorBoundary>
      </div>

      {/* Catalog - part of home: sidebar + products (before local chart) */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <aside className="md:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-sm font-semibold text-white">{lang === 'ar' ? 'التصنيفات' : 'Categories'}</div>
              <div className="mt-3 flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCatalogSlug('');
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('catalog');
                      return next;
                    });
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-sm ${
                    !selectedCatalogSlug ? 'bg-brand-gold/20 text-brand-gold font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {labels.catalogAll}
                </button>
                {categories.map((c) => {
                  const isActive = selectedCatalogSlug === c.slug;
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        setSelectedCatalogSlug(c.slug);
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.set('catalog', c.slug);
                          return next;
                        });
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-sm ${
                        isActive ? 'bg-brand-gold/20 text-brand-gold font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="md:col-span-9">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-white/80 text-sm">
                  {selectedCatalogSlug
                    ? (categories.find((c) => c.slug === selectedCatalogSlug)?.name || selectedCatalogSlug)
                    : labels.catalogAll}
                </span>
                <Link
                  to="/cart"
                  className="h-9 px-4 rounded-xl bg-brand-gold text-black text-sm font-medium flex items-center"
                >
                  {labels.cart}
                </Link>
              </div>
              {catalogProductsLoading ? (
                <div className="py-10 text-center text-white/70">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
              ) : catalogProducts.length === 0 ? (
                <div className="py-10 text-center text-white/70">{labels.catalogEmpty}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalogProducts.slice(0, catalogDisplayLimit).map((p) => {
                      const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
                      return (
                        <Link
                          key={p._id}
                          to={`/store/product/${p.slug || p._id}`}
                          className="group rounded-2xl border border-white/10 bg-black/20 overflow-hidden hover:border-brand-gold/60 transition"
                        >
                          <div className="aspect-[4/3] bg-white/5 flex items-center justify-center overflow-hidden">
                            {img ? (
                              <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/40" />
                            )}
                          </div>
                          <div className="p-4">
                            <div className="text-sm font-semibold text-white line-clamp-2">{p.title}</div>
                            <div className="mt-1 text-xs text-white/60">
                              {p.weightGrams ? `${p.weightGrams}g` : ''}
                              {p.weightGrams && p.karat ? ' • ' : ''}
                              {p.karat ? `${p.karat}K` : ''}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-base font-semibold text-brand-gold">
                                {Number(p.price?.amount || 0).toFixed(3)} {p.price?.currency || 'SAR'}
                              </div>
                              <span className="text-xs text-white/60">{lang === 'ar' ? 'عرض' : 'View'}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {catalogProducts.length > catalogDisplayLimit && (
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setCatalogDisplayLimit((prev) => prev + CATALOG_MORE_STEP)}
                        className="px-6 py-2.5 rounded-xl bg-brand-gold/20 text-brand-gold text-sm font-medium border border-brand-gold/40 hover:bg-brand-gold/30 transition"
                      >
                        {labels.more}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* RealTime Metal Price Chart — فوق الشارت تختار المعدن، الشارت المختار بعرض الصفحة */}
      <div className="mt-6 w-full">
        <div className="rounded-2xl border border-white/10 bg-black/30 text-white p-4">
          <div className="mb-3 text-center text-sm font-semibold">{labels.chart}</div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSelectedChartMetal('gold')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedChartMetal === 'gold'
                  ? 'bg-brand-gold text-black'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {labels.gold}
            </button>
            <button
              type="button"
              onClick={() => setSelectedChartMetal('silver')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedChartMetal === 'silver'
                  ? 'bg-brand-gold text-black'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {labels.silver}
            </button>
            <button
              type="button"
              onClick={() => setSelectedChartMetal('platinum')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedChartMetal === 'platinum'
                  ? 'bg-brand-gold text-black'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {labels.platinum}
            </button>
          </div>
          <div className="w-full">
            <WidgetErrorBoundary title={lang === 'ar' ? 'تعذر تحميل الشارت' : 'Chart could not load'}>
              <TradingViewChart
                key={selectedChartMetal}
                symbol={
                  selectedChartMetal === 'gold'
                    ? 'OANDA:XAUUSD'
                    : selectedChartMetal === 'silver'
                    ? 'OANDA:XAGUSD'
                    : 'OANDA:XPTUSD'
                }
                theme={theme === 'dark' ? 'dark' : 'light'}
                height={400}
                className="w-full"
              />
            </WidgetErrorBoundary>
          </div>
        </div>
      </div>

      {/* أخبار السوق من TradingView — تحت الشارت */}
      <div className="mt-6 w-full">
        <div className="rounded-2xl border border-white/10 bg-black/30 text-white p-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-brand-gold/70" />
            <div className="text-base font-semibold">{labels.newsFromTv}</div>
            <div className="h-px w-12 bg-brand-gold/70" />
          </div>
          <p className="text-center text-xs text-white/60 mb-3">{lang === 'ar' ? labels.newsNoteAr : labels.newsNoteEn}</p>
          <WidgetErrorBoundary title={lang === 'ar' ? 'تعذر تحميل الأخبار' : 'News could not load'}>
            <TradingViewNews key={lang} theme={theme === 'dark' ? 'dark' : 'light'} height={400} className="w-full" />
          </WidgetErrorBoundary>
          <div className="mt-4 text-center">
            <Link to="/news" className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-brand-gold text-black text-sm font-medium">
              {labels.viewAll}
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-16">
        <div className="flex items-center justify-center gap-4 text-white mb-8">
          <div className="h-px w-16 bg-brand-gold/70" />
          <div className="text-lg font-semibold">
            {lang === 'ar' ? 'عن ذهب السعودية' : 'About Saudi Gold'}
          </div>
          <div className="h-px w-16 bg-brand-gold/70" />
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-brand-gold text-base md:text-lg font-semibold mb-6">
            {lang === 'ar'
              ? 'ذهب السعودية: علامة سعودية متخصصة في السبائك والمجوهرات الذهبية، برخصة تجارية من وزارة التجارة'
              : 'Saudi Gold: a Saudi brand specialized in bullion and gold jewelry, licensed by the Ministry of Commerce in Saudi Arabia'}
          </h3>
          <p className="text-white/75 text-sm md:text-base leading-relaxed mb-8">
            {lang === 'ar'
              ? 'نحن نحرص دائماً على تطوير والحفاظ على علاقة الثقة المتبادلة بين منظمتنا وعملائها، ونحن واثقون بما فيه الكفاية من الفوائد التي تعود علينا من هذه الثقة، ولهذا السبب فإن التزامنا الدائم مع عملائنا أدى إلى إنجاز لا تشوبه شائبة، وجعلنا في طليعة السوق التجاري لتجارة المعادن الثمينة في السعودية، ما يميزنا هو ميلنا لتبني الابتكارات التكنولوجية ومواكبة أحدث التطورات من خلال التسوق الإلكتروني من موقع الشركة وإضافة تصاميم حصرية من المجوهرات وكذلك السبائك الذهبية.'
              : 'We are always aware of the fact of developing and maintaining a relationship of mutual trust between our organization and its customers, and we are confident enough of the benefits that accrue to us from this trust, and for this reason our permanent commitment with our customers led to an impeccable achievement, and made us set our feet at the forefront of the commercial market For precious metals trade in Saudi Arabia, which distinguishes us is our tendency to adopt technological innovations and keep pace with the latest developments through electronic shopping from the company\'s website and the addition of exclusive designs of jewellery as well as gold bars.'}
          </p>

          <button className="inline-flex items-center justify-center h-12 px-8 rounded-xl border-2 border-brand-gold text-brand-gold font-semibold hover:bg-brand-gold hover:text-black transition">
            {lang === 'ar' ? 'اعرف المزيد' : 'Learn More'}
          </button>
        </div>
      </div>

      {/* Go to Store */}
      <div className="mt-16 text-center">
        <Link to="/store/catalog" className="text-sm text-brand-gold hover:opacity-90">
          {lang === 'ar' ? 'اذهب للمتجر' : 'Go to store'}
        </Link>
      </div>

      {/* Footer spacing */}
      <div className="mt-10" />
    </div>
  );
};

export default HomePage;

