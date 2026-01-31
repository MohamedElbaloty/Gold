import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import UiContext from '../context/UiContext';

const HomePage = () => {
  const { lang } = useContext(UiContext);

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'منصة ذهب السعودية' : 'Saudi Gold Platform',
      subtitle:
        lang === 'ar'
          ? 'اختَر ما يناسبك الآن — شراء الذهب أو تداول الذهب.'
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
          ? 'بيع وشراء على سبايكك المحجوزة لك — بدون ما تمسك الذهب أو تراجع تاجر.'
          : 'Open and close real gold buy/sell positions. Platform buy/sell prices include our spread.',
      tradeCta: lang === 'ar' ? 'بدء التداول' : 'Start Trading',
      note: lang === 'ar' ? 'التداول يتطلب تسجيل دخول.' : 'Trading requires login.',
      tradeExplain:
        lang === 'ar'
          ? 'بدل ما تشتري/تبيع وانت واقف عند التاجر، المنصة تنفّذ البيع والشراء لك مع الاحتفاظ بسبايكك محجوزة باسمك.'
          : 'Instead of handling bullion at a dealer, the platform executes buy/sell while your bullion remains reserved under your name.'
    }),
    [lang]
  );

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/40 to-white dark:from-brand-bg dark:via-emerald-950/20 dark:to-brand-bg"
      />
      {/* Saudi-flag inspired wash + motion (subtle) */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-brand-gold/10 dark:from-emerald-500/10 dark:to-brand-gold/10" />
        <div className="absolute -top-24 left-1/2 h-[560px] w-[760px] -translate-x-1/2 rounded-[999px] bg-gradient-to-br from-emerald-600/18 via-emerald-600/10 to-transparent blur-3xl animate-[ksaWave_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-36 right-[-140px] h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-emerald-600/16 via-brand-gold/14 to-transparent blur-3xl animate-[ksaWave_18s_ease-in-out_infinite]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="min-h-[calc(100vh-180px)] flex items-center">
          <div className="w-full">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {lang === 'ar' ? 'السوق السعودي' : 'Saudi market'}
                <span className="text-emerald-800/60 dark:text-emerald-200/60">•</span>
                <span className="font-bold">SAR</span>
                <span className="text-emerald-800/60 dark:text-emerald-200/60">•</span>
                <span
                  aria-label={lang === 'ar' ? 'علم السعودية' : 'Saudi flag'}
                  title={lang === 'ar' ? 'علم السعودية' : 'Saudi flag'}
                  className="inline-flex items-center justify-center h-4 w-6 rounded-sm bg-emerald-700/90 border border-white/30 shadow-sm"
                />
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

            <p className="mt-6 max-w-4xl mx-auto text-center text-sm sm:text-base text-gray-700/80 dark:text-white/70">
              {labels.tradeExplain}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;

