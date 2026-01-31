import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';

function isGoldSilverPlatinumNews(article) {
  const text = `${article?.title || ''} ${article?.summary || ''}`.toLowerCase();
  const hasGold = text.includes('gold') || text.includes('xau') || text.includes('ذهب') || text.includes('الذهب');
  const hasSilver = text.includes('silver') || text.includes('xag') || text.includes('فضة') || text.includes('الفضة');
  const hasPlatinum = text.includes('platinum') || text.includes('xpt') || text.includes('بلاتين') || text.includes('البلاتين');
  return hasGold || hasSilver || hasPlatinum;
}

const StoreFront = () => {
  const { lang } = useContext(UiContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const selectedCatalogSlug = searchParams.get('catalog') || '';

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [prices, setPrices] = useState(null);
  const prevSpotRef = useRef(null);
  const [spotDelta, setSpotDelta] = useState({ gold: null, silver: null, platinum: null });

  const productsRef = useRef(null);
  const CATALOG_INITIAL_LIMIT = 6;
  const CATALOG_MORE_STEP = 6;
  const [catalogDisplayLimit, setCatalogDisplayLimit] = useState(CATALOG_INITIAL_LIMIT);

  const labels = useMemo(
    () => ({
      catalogs: lang === 'ar' ? 'الكتالوجات' : 'Catalogs',
      all: lang === 'ar' ? 'الكل' : 'All',
      loading: lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...',
      cart: lang === 'ar' ? 'السلة' : 'Cart',
      search: lang === 'ar' ? 'بحث' : 'Search',
      empty: lang === 'ar' ? 'لا يوجد منتجات' : 'No products found',
      more: lang === 'ar' ? 'المزيد' : 'More',
      viewAllNews: lang === 'ar' ? 'عرض كل الأخبار' : 'View all news',
      marketNews: lang === 'ar' ? 'أخبار الذهب' : 'Gold news',
      marketNewsHint:
        lang === 'ar'
          ? 'آخر الأخبار المتعلقة بالذهب والمعادن.'
          : 'Latest news related to gold and metals.',
      pricesTitle: lang === 'ar' ? 'أسعار الذهب بالريال (تحديث مباشر)' : 'Live gold prices in SAR',
      gold24: lang === 'ar' ? 'الذهب (24K) / جرام' : 'Gold (24k) / gram',
      silverKg: lang === 'ar' ? 'الفضة / كجم' : 'Silver / kg',
      platinumG: lang === 'ar' ? 'البلاتين / جرام' : 'Platinum / gram',
      tvTitle: lang === 'ar' ? 'السعر العالمي بالدولار' : 'Global price in USD'
    }),
    [lang]
  );

  const fallbackNewsCards = useMemo(() => {
    const now = new Date().toISOString();
    if (lang === 'ar') {
      return [
        {
          id: 'fallback-egypt-gold',
          title: 'مستوى قياسي جديد.. أسعار الذهب في مصر اليوم الخميس',
          summary: 'ملخص سريع لتحركات أسعار الذهب وتفاعل الأسواق، مع متابعة تأثيرات الأسعار العالمية على المنطقة.',
          publishedAt: now,
          sourceName: 'محتوى تجريبي'
        },
        {
          id: 'fallback-libreville',
          title: 'مأساة ليبرفيل: قصة سقوط طائرة منتخب زامبيا في المحيط ثم التتويج بكأس أمم أفريقيا بعد 19 عاماً',
          summary: 'قصة إنسانية رياضية عن مأساة كبيرة ثم عودة تاريخية للتتويج بعد سنوات طويلة.',
          publishedAt: now,
          sourceName: 'محتوى تجريبي'
        }
      ];
    }
    return [
      {
        id: 'fallback-egypt-gold',
        title: 'New record level: Gold prices in Egypt today (Thursday)',
        summary: 'A quick snapshot of gold price moves and market reaction, tracking how global prices ripple across the region.',
        publishedAt: now,
        sourceName: 'Demo content'
      },
      {
        id: 'fallback-libreville',
        title: 'Libreville tragedy: Zambia team plane crash, then AFCON glory 19 years later',
        summary: 'A human sports story of a national tragedy followed by a historic comeback years later.',
        publishedAt: now,
        sourceName: 'Demo content'
      }
    ];
  }, [lang]);

  const categoryName = (c) => {
    if (!c) return '';
    return (lang === 'ar' ? c.nameAr || c.name : c.nameEn || c.name) || '';
  };

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

  // Load products (same logic as /store/catalog, but embedded in /store)
  useEffect(() => {
    let mounted = true;
    setProductsLoading(true);
    const params = { limit: 24, q: q || undefined };
    if (selectedCatalogSlug) params.categorySlug = selectedCatalogSlug;
    api
      .get('/api/store/products', { params })
      .then((res) => {
        if (!mounted) return;
        setProducts(Array.isArray(res.data?.products) ? res.data.products : []);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setProductsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [q, selectedCatalogSlug]);

  // Load news list
  useEffect(() => {
    let mounted = true;
    setNewsLoading(true);
    (async () => {
      try {
        let finalArticles = [];
        try {
          const res = await api.get('/api/news/feed', { params: { lang, limit: 24 } });
          const articlesData = res.data?.articles || res.data || [];
          finalArticles = Array.isArray(articlesData) ? articlesData : [];
        } catch (_) {}

        if (finalArticles.length === 0) {
          try {
            const resInternal = await api.get('/api/news', { params: { lang, limit: 24 } });
            const internalData = resInternal.data?.articles || resInternal.data || [];
            if (Array.isArray(internalData) && internalData.length > 0) finalArticles = internalData;
          } catch (_) {}
        }

        finalArticles = Array.isArray(finalArticles) ? finalArticles.filter(isGoldSilverPlatinumNews) : [];
        if (mounted) setNewsArticles(finalArticles.length > 0 ? finalArticles.slice(0, 6) : fallbackNewsCards);
      } catch {
        if (mounted) setNewsArticles([]);
      } finally {
        if (mounted) setNewsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [lang, fallbackNewsCards]);

  const currency = prices?.currency || 'SAR';

  // Reset catalog display limit when filters change
  useEffect(() => {
    setCatalogDisplayLimit(CATALOG_INITIAL_LIMIT);
  }, [q, selectedCatalogSlug]);

  const selectCatalog = (slug) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) next.set('catalog', slug);
      else next.delete('catalog');
      return next;
    });
    setTimeout(() => {
      productsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur overflow-hidden">
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
          <div className="px-5 sm:px-6 py-3 flex items-center gap-2 text-xs font-semibold text-gray-700/70 dark:text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{labels.tvTitle}</span>
          </div>
          <div className="px-5 sm:px-6 pb-4 text-xs text-gray-600 dark:text-white/60">
            {lang === 'ar' ? 'لعرض الأسعار العالمية بالدولار، راجع صفحة الأسعار.' : 'For global USD view, see the Prices page.'}{' '}
            <Link to="/prices" className="text-brand-gold hover:opacity-90">
              {lang === 'ar' ? 'فتح صفحة الأسعار' : 'Open Prices'}
            </Link>
          </div>
        </div>
      </div>

      {/* Catalog section: same layout/look as /store/catalog */}
      <div ref={productsRef} className="mt-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{labels.catalogs}</h2>
          </div>
          <div className="w-full md:w-[420px]">
            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    const val = e.target.value;
                    if (val) next.set('q', val);
                    else next.delete('q');
                    return next;
                  })
                }
                className="w-full h-11 rounded-xl border border-white/10 bg-black/30 text-white px-4 text-sm placeholder:text-white/50"
                placeholder={labels.search}
              />
              <Link
                to="/cart"
                className="h-11 px-4 rounded-xl bg-brand-gold text-black font-medium flex items-center justify-center"
              >
                {labels.cart}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <aside className="md:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-sm font-semibold text-white">{labels.catalogs}</div>
              <div className="mt-3 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                {categoriesLoading ? (
                  <div className="py-4 text-center text-white/60 text-sm">{labels.loading}</div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => selectCatalog('')}
                      className={`text-left px-3 py-2 rounded-xl text-sm ${
                        !selectedCatalogSlug
                          ? 'bg-brand-gold/20 text-brand-gold font-medium'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {labels.all}
                    </button>
                    {categories.map((c) => {
                      const isActive = selectedCatalogSlug === c.slug;
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => selectCatalog(c.slug)}
                          className={`text-left px-3 py-2 rounded-xl text-sm ${
                            isActive
                              ? 'bg-brand-gold/20 text-brand-gold font-medium'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {categoryName(c)}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </aside>

          <main className="md:col-span-9">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              {productsLoading ? (
                <div className="py-10 text-center text-white/70">{labels.loading}</div>
              ) : products.length === 0 ? (
                <div className="py-10 text-center text-white/70">{labels.empty}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.slice(0, catalogDisplayLimit).map((p) => {
                      const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
                      return (
                        <Link
                          key={p._id}
                          to={`/store/product/${p.slug || p._id}`}
                          className="group rounded-2xl border border-white/10 bg-black/20 overflow-hidden hover:border-brand-gold/60 transition"
                        >
                          <div className="aspect-[4/3] bg-white/5 flex items-center justify-center overflow-hidden">
                            {img ? (
                              <img
                                src={img}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/40" />
                            )}
                          </div>
                          <div className="p-4">
                            <div className="text-sm font-semibold text-white line-clamp-2">{p.title}</div>
                            <div className="mt-1 text-xs text-white/60">
                              {(p.categoryId && (lang === 'ar' ? p.categoryId.nameAr || p.categoryId.name : p.categoryId.nameEn || p.categoryId.name)) ||
                                (lang === 'ar' ? 'منتج' : 'Product')}
                              {p.weightGrams ? ` • ${p.weightGrams}g` : ''}
                              {p.karat ? ` • ${p.karat}K` : ''}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-base font-semibold text-brand-gold">
                                {Number(p.price?.amount || 0).toFixed(3)} {p.price?.currency || 'SAR'}
                              </div>
                              <div className="text-xs text-white/60">{lang === 'ar' ? 'عرض' : 'View'}</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {products.length > catalogDisplayLimit && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsArticles.map((a) => {
              const href = a?.sourceUrl || a?.url || '';
              const to = a?.slug || a?._id ? `/news/${a.slug || a._id}` : '';
              const isExternal = Boolean(href) && (a.isExternal || a.sourceUrl || a.url);
              const CardWrapper = isExternal ? 'a' : to ? Link : 'div';
              const cardProps = isExternal
                ? { href, target: '_blank', rel: 'noopener noreferrer' }
                : to
                  ? { to }
                  : {};
              return (
                <CardWrapper
                  key={a._id || a.id || a.sourceUrl || a.url || a.title}
                  {...cardProps}
                  className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg/30 overflow-hidden hover:border-brand-gold/60 transition"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 overflow-hidden">
                    {a.coverImage ? (
                      <img
                        src={a.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{a.title || a.headline || ''}</div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-brand-muted line-clamp-3">{a.summary || ''}</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-brand-muted">
                      <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}</span>
                      {a.sourceName ? <span>{a.sourceName}</span> : null}
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreFront;

