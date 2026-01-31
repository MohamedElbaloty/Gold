import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';

const StoreFront = () => {
  const { lang } = useContext(UiContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get('catalog') || '';

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const productsRef = useRef(null);

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'متجر السبائك المعتمدة' : 'Certified Bullion Store',
      subtitle:
        lang === 'ar'
          ? 'اختر كاتالوج، وشاهد المنتجات مباشرة. وعندما تضغط على أي سبيكة ستفتح صفحة تفاصيلها.'
          : 'Pick a catalog and browse products. Clicking a bullion item opens its details.',
      catalogs: lang === 'ar' ? 'الكتالوج' : 'Catalog',
      all: lang === 'ar' ? 'الكل' : 'All',
      loading: lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...',
      empty: lang === 'ar' ? 'لا يوجد منتجات' : 'No products found',
      cart: lang === 'ar' ? 'السلة' : 'Cart',
      viewAllNews: lang === 'ar' ? 'عرض كل الأخبار' : 'View all news',
      marketNews: lang === 'ar' ? 'أخبار السوق' : 'Market news',
      marketNewsHint:
        lang === 'ar'
          ? 'آخر الأخبار المتعلقة بالذهب والمعادن.'
          : 'Latest news related to gold and metals.',
      browseFullCatalog: lang === 'ar' ? 'فتح صفحة الكتالوج الكاملة' : 'Open full catalog page'
    }),
    [lang]
  );

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

  // Load products when category changes
  useEffect(() => {
    let mounted = true;
    setProductsLoading(true);
    const params = { limit: 24 };
    if (selectedSlug) params.categorySlug = selectedSlug;

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
  }, [selectedSlug]);

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

  const selectCatalog = (slug) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) next.set('catalog', slug);
      else next.delete('catalog');
      return next;
    });

    // Scroll to products section for a "store home" flow
    setTimeout(() => {
      productsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

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
              to={selectedSlug ? `/store/catalog/${selectedSlug}` : '/store/catalog'}
              className="inline-flex items-center justify-center h-11 px-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-transparent text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5"
              title={labels.browseFullCatalog}
            >
              {labels.browseFullCatalog}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.catalogs}</h2>
          {selectedSlug ? (
            <button
              type="button"
              onClick={() => selectCatalog('')}
              className="text-sm text-brand-gold hover:opacity-90"
            >
              {labels.all}
            </button>
          ) : null}
        </div>

        {categoriesLoading ? (
          <div className="py-6 text-center text-gray-500 dark:text-white/60">{labels.loading}</div>
        ) : (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => selectCatalog('')}
              className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold border transition ${
                !selectedSlug
                  ? 'border-brand-gold bg-brand-gold/15 text-brand-gold'
                  : 'border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {labels.all}
            </button>
            {categories.map((c) => {
              const active = selectedSlug === c.slug;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => selectCatalog(c.slug)}
                  className={`shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold border transition ${
                    active
                      ? 'border-brand-gold bg-brand-gold/15 text-brand-gold'
                      : 'border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div ref={productsRef} className="mt-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur p-4 sm:p-6">
        {productsLoading ? (
          <div className="py-10 text-center text-gray-500 dark:text-white/60">{labels.loading}</div>
        ) : products.length === 0 ? (
          <div className="py-10 text-center text-gray-600 dark:text-white/70">{labels.empty}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
              return (
                <Link
                  key={p._id}
                  to={`/store/product/${p.slug || p._id}`}
                  className="group rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20 overflow-hidden hover:border-brand-gold/60 transition"
                >
                  <div className="aspect-[4/3] bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/40" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{p.title}</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-white/60">
                      {p.weightGrams ? `${p.weightGrams}g` : ''}
                      {p.weightGrams && p.karat ? ' • ' : ''}
                      {p.karat ? `${p.karat}K` : ''}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-base font-semibold text-brand-gold">
                        {Number(p.price?.amount || 0).toFixed(3)} {p.price?.currency || 'SAR'}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-white/60">{lang === 'ar' ? 'عرض' : 'View'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
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

