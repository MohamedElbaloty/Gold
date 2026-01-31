import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import UiContext from '../context/UiContext';

const HomePage = () => {
  const { lang } = useContext(UiContext);

  const labels = useMemo(
    () => ({
      badge: lang === 'ar' ? 'هوية سعودية • SAR' : 'Saudi Market • SAR',
      title: lang === 'ar' ? 'منصة ذهب السعودية' : 'Saudi Gold Platform',
      subtitle:
        lang === 'ar'
          ? 'اختر التجربة المناسبة لك: شراء الذهب من المتجر أو تداول الذهب على المنصة.'
          : 'Choose your journey: buy physical gold from the store or trade gold on the platform.',
      buyTitle: lang === 'ar' ? 'شراء الذهب' : 'Buy Gold',
      buyDesc:
        lang === 'ar'
          ? 'تسوّق السبائك والعملات الذهبية المعتمدة مباشرة من المتجر مع أسعار مرتبطة بالأسعار العالمية.'
          : 'Shop certified bullion and gold coins with pricing linked to global markets.',
      buyCta: lang === 'ar' ? 'الذهاب للمتجر' : 'Go to Store',
      browseCatalog: lang === 'ar' ? 'استعرض الكتالوج' : 'Browse catalog',
      tradeTitle: lang === 'ar' ? 'تداول الذهب' : 'Trade Gold',
      tradeDesc:
        lang === 'ar'
          ? 'فتح وإغلاق صفقات شراء وبيع ذهب حقيقية. أسعار الشراء والبيع خاصة بالمنصة وتضم هامشنا.'
          : 'Open and close real gold buy/sell positions. Platform buy/sell prices include our spread.',
      tradeCta: lang === 'ar' ? 'بدء التداول' : 'Start Trading',
      note: lang === 'ar' ? 'التداول يتطلب تسجيل دخول.' : 'Trading requires login.'
    }),
    [lang]
  );

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/40 to-white dark:from-brand-bg dark:via-emerald-950/20 dark:to-brand-bg"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/20 via-brand-gold/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-brand-gold/20 via-emerald-400/10 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.7)_1px,transparent_0)] [background-size:22px_22px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {labels.badge}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {labels.title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-white/70">{labels.subtitle}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur p-6 sm:p-7">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{labels.buyTitle}</h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-white/70">{labels.buyDesc}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                <span className="text-brand-gold font-extrabold">Au</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/store"
                className="inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-brand-gold text-black text-sm font-semibold hover:opacity-90"
              >
                {labels.buyCta}
              </Link>
              <Link
                to="/store/catalog"
                className="inline-flex items-center justify-center h-11 px-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-transparent text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {labels.browseCatalog}
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur p-6 sm:p-7">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{labels.tradeTitle}</h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-white/70">{labels.tradeDesc}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-emerald-600 dark:text-emerald-300">
                  <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 17l6-6 4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 7v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/trading"
                className="inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              >
                {labels.tradeCta}
              </Link>
              <span className="text-xs text-gray-500 dark:text-white/50">{labels.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;

