import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';

const StoreHome = () => {
  const { lang } = useContext(UiContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = (c) => {
    if (!c) return '';
    return (lang === 'ar' ? c.nameAr || c.name : c.nameEn || c.name) || '';
  };

  useEffect(() => {
    let mounted = true;
    api.get('/api/store/categories').then((res) => {
      if (mounted) setCategories(res.data.categories || []);
    }).catch(() => {
      if (mounted) setCategories([]);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-brand-muted">
              <span className="h-2 w-2 rounded-full bg-brand-gold" />
              {lang === 'ar' ? 'أفضل العروض' : 'Best Offers'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {lang === 'ar' ? 'متجر السبائك والمجوهرات' : 'Bullion & Jewellery Store'}
            </h1>
            <p className="max-w-2xl text-gray-600 dark:text-brand-muted">
              {lang === 'ar'
                ? 'تصفح التصنيفات: سبائك ذهب، فضة، PAMP، ساعات، ألماس، هدايا وأكثر.'
                : 'Browse catalogs by category: gold bars, silver, PAMP, watches, diamond, gifts and more.'}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/store/catalog"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-brand-gold text-black font-medium hover:opacity-90"
            >
              {lang === 'ar' ? 'كل المنتجات' : 'All catalog'}
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {lang === 'ar' ? 'سلة المشتريات' : 'Cart'}
            </Link>
          </div>
        </div>
      </div>

      {/* Catalogs - like daralsabaek.com */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {lang === 'ar' ? 'التصنيفات' : 'Catalogs'}
        </h2>
        {loading ? (
          <div className="py-6 text-center text-gray-500 dark:text-brand-muted">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/store/catalog/${c.slug}`}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-4 hover:border-brand-gold/60 hover:bg-brand-gold/5 transition text-center"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{categoryName(c)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/prices"
          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-6 hover:border-brand-gold/60 transition"
        >
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{lang === 'ar' ? 'حاسبة الأسعار' : 'Price Calculator'}</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'أسعار الذهب والفضة والبلاتين' : 'Gold, silver & platinum prices'}</div>
        </Link>
        <Link
          to="/news"
          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-6 hover:border-brand-gold/60 transition"
        >
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{lang === 'ar' ? 'الأخبار' : 'News'}</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'آخر أخبار المعادن والأسواق' : 'Latest metals & market news'}</div>
        </Link>
      </div>
    </div>
  );
};

export default StoreHome;

