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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/12 via-transparent to-brand-gold/12 dark:from-emerald-500/12 dark:to-brand-gold/12" />
        <div className="absolute -top-24 left-1/2 h-[560px] w-[760px] -translate-x-1/2 rounded-[999px] bg-gradient-to-br from-emerald-600/18 via-emerald-600/10 to-transparent blur-3xl animate-[ksaWave_14s_ease-in-out_infinite]" />
        <div className="absolute -bottom-36 right-[-140px] h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-emerald-600/16 via-brand-gold/14 to-transparent blur-3xl animate-[ksaWave_18s_ease-in-out_infinite]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="min-h-[calc(100vh-180px)] flex items-center">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-12">
                <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                  <h1 className="mt-4 text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    <span className="block">{labels.title}</span>
                    <span className="mt-2 block text-base sm:text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                      {lang === 'ar' ? 'شراء وتداول الذهب بثقة وبساطة.' : 'Buy & trade gold with confidence and clarity.'}
                    </span>
                  </h1>

                  <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-white/70">
                    {labels.subtitle}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur p-4">
                      <div className="text-xs font-semibold text-gray-500 dark:text-white/60">{lang === 'ar' ? 'شراء' : 'Buy'}</div>
                      <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{lang === 'ar' ? 'سبائك معتمدة' : 'Certified bullion'}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur p-4">
                      <div className="text-xs font-semibold text-gray-500 dark:text-white/60">{lang === 'ar' ? 'تداول' : 'Trade'}</div>
                      <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{lang === 'ar' ? 'على سبايكك المحجوزة' : 'Against reserved holdings'}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur p-4">
                      <div className="text-xs font-semibold text-gray-500 dark:text-white/60">{lang === 'ar' ? 'شفافية' : 'Clarity'}</div>
                      <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{lang === 'ar' ? 'أسعار SAR + USD' : 'SAR + USD pricing'}</div>
                    </div>
                  </div>
                </div>
              </div>
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

