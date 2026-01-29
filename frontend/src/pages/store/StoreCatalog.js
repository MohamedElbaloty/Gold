import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';

const StoreCatalog = () => {
  const { lang } = useContext(UiContext);
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  // When URL has categorySlug (e.g. /store/catalog/emirates-bullion-btc), use it for filtering
  const effectiveCategorySlug = categorySlug || '';
  const effectiveCategoryId = !effectiveCategorySlug ? category : '';

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'الكتالوج' : 'Catalog',
      search: lang === 'ar' ? 'بحث' : 'Search',
      categories: lang === 'ar' ? 'التصنيفات' : 'Categories',
      all: lang === 'ar' ? 'الكل' : 'All',
      empty: lang === 'ar' ? 'لا يوجد منتجات' : 'No products found',
      backToCatalog: lang === 'ar' ? 'الكل الكتالوج' : 'All catalog'
    }),
    [lang]
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      setCurrentCategory(null);
      try {
        const params = { limit: 24, q: q || undefined };
        if (effectiveCategorySlug) {
          params.categorySlug = effectiveCategorySlug;
          try {
            const catRes = await api.get(`/api/store/categories/slug/${effectiveCategorySlug}`);
            if (mounted) setCurrentCategory(catRes.data.category);
          } catch (catErr) {
            if (mounted) setError(catErr?.response?.data?.message || 'Category not found');
          }
        } else if (effectiveCategoryId) {
          params.category = effectiveCategoryId;
        }

        const [catsRes, prodRes] = await Promise.all([
          api.get('/api/store/categories'),
          api.get('/api/store/products', { params })
        ]);
        if (!mounted) return;
        setCategories(catsRes.data.categories || []);
        setProducts(prodRes.data.products || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || 'Failed to load catalog');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [q, effectiveCategoryId, effectiveCategorySlug]);

  const pageTitle = currentCategory ? currentCategory.name : labels.title;

  /* Same look as Home: dark cards, white text, gold accents */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          {effectiveCategorySlug && (
            <Link
              to="/"
              className="text-sm text-brand-gold hover:underline mb-1 block"
            >
              ← {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
          )}
          <h1 className="text-2xl font-semibold text-white">{pageTitle}</h1>
          {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        </div>

        <div className="w-full md:w-[420px]">
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                const val = e.target.value;
                if (val) next.set('q', val);
                else next.delete('q');
                return next;
              })}
              className="w-full h-11 rounded-xl border border-white/10 bg-black/30 text-white px-4 text-sm placeholder:text-white/50"
              placeholder={labels.search}
            />
            <Link
              to="/cart"
              className="h-11 px-4 rounded-xl bg-brand-gold text-black font-medium flex items-center justify-center"
            >
              {lang === 'ar' ? 'السلة' : 'Cart'}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        <aside className="md:col-span-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm font-semibold text-white">{labels.categories}</div>
            <div className="mt-3 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
              <Link
                to="/store/catalog"
                className={`text-left px-3 py-2 rounded-xl text-sm ${
                  !effectiveCategorySlug && !category
                    ? 'bg-brand-gold/20 text-brand-gold font-medium'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {labels.all}
              </Link>
              {categories.map((c) => {
                const isActive = effectiveCategorySlug ? c.slug === effectiveCategorySlug : category === c._id;
                return (
                  <Link
                    key={c._id}
                    to={`/store/catalog/${c.slug}`}
                    className={`text-left px-3 py-2 rounded-xl text-sm ${
                      isActive
                        ? 'bg-brand-gold/20 text-brand-gold font-medium'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="md:col-span-9">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            {loading ? (
              <div className="py-10 text-center text-white/70">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
            ) : products.length === 0 ? (
              <div className="py-10 text-center text-white/70">{labels.empty}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => {
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
                          {(p.categoryId && p.categoryId.name) || (lang === 'ar' ? 'منتج' : 'Product')}
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreCatalog;

