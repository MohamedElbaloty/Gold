import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

const GoldBar = ({ className }) => (
  <svg viewBox="0 0 120 72" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="120" y2="72" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F2D26C" stopOpacity="0.95" />
        <stop offset="0.55" stopColor="#C9A227" stopOpacity="0.92" />
        <stop offset="1" stopColor="#8A6A12" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <path d="M14 18h74l18 18-10 18H22L14 18z" fill="url(#g1)" opacity="0.92" />
    <path d="M14 18h74l18 18-10 18H22L14 18z" stroke="rgba(255,255,255,0.35)" />
    <path d="M32 36h38" stroke="rgba(0,0,0,0.18)" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 46h52" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SilverBar = ({ className }) => (
  <svg viewBox="0 0 120 72" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s1" x1="0" y1="0" x2="120" y2="72" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F7FA" stopOpacity="0.95" />
        <stop offset="0.55" stopColor="#C9D1D9" stopOpacity="0.92" />
        <stop offset="1" stopColor="#8A949E" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <path d="M14 18h74l18 18-10 18H22L14 18z" fill="url(#s1)" opacity="0.85" />
    <path d="M14 18h74l18 18-10 18H22L14 18z" stroke="rgba(255,255,255,0.35)" />
    <path d="M34 36h32" stroke="rgba(0,0,0,0.12)" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 46h52" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SarNote = ({ className }) => (
  <svg viewBox="0 0 160 92" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="r1" x1="0" y1="0" x2="160" y2="92" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(16,185,129,0.45)" />
        <stop offset="0.6" stopColor="rgba(16,185,129,0.25)" />
        <stop offset="1" stopColor="rgba(201,162,39,0.18)" />
      </linearGradient>
    </defs>
    <rect x="12" y="14" width="136" height="64" rx="14" fill="url(#r1)" />
    <rect x="12" y="14" width="136" height="64" rx="14" stroke="rgba(255,255,255,0.28)" />
    <circle cx="48" cy="46" r="16" fill="rgba(255,255,255,0.10)" />
    <circle cx="112" cy="46" r="16" fill="rgba(255,255,255,0.08)" />
    <path d="M22 34h116" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round" />
    <path d="M24 58h72" stroke="rgba(0,0,0,0.08)" strokeWidth="5" strokeLinecap="round" />
    <text x="118" y="60" fontSize="18" fontWeight="800" fill="rgba(255,255,255,0.22)">SAR</text>
  </svg>
);

const HomePage = () => {
  const { lang } = useContext(UiContext);
  const [floatingPhotos, setFloatingPhotos] = useState([]);

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

  useEffect(() => {
    let mounted = true;
    async function loadPhotos() {
      try {
        // Pull real product images (e.g., PAMP/BTC) to use as floating background elements.
        const queries = ['pamp', 'btc', 'bar', 'سبيكة', 'ذهب', 'gold', 'silver'];
        const results = await Promise.all(
          queries.map((q) => api.get('/api/store/products', { params: { limit: 12, q } }).catch(() => ({ data: {} })))
        );

        const urls = [];
        for (const r of results) {
          const products = Array.isArray(r?.data?.products) ? r.data.products : [];
          for (const p of products) {
            const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
            if (!img) continue;
            if (typeof img !== 'string') continue;
            urls.push(img);
          }
        }

        const uniq = Array.from(new Set(urls)).slice(0, 10);
        if (mounted) setFloatingPhotos(uniq);
      } catch {
        if (mounted) setFloatingPhotos([]);
      }
    }
    loadPhotos();
    return () => {
      mounted = false;
    };
  }, []);

  const floatingItems = useMemo(() => {
    // More bullion overall (user request) + optional real photos from catalog
    const base = [
      { key: 'g1', type: 'gold', top: '6%', left: '-18%', size: 'w-[96px] sm:w-[132px]', dur: '34s', delay: '-10s', reverse: false, op: 0.22 },
      { key: 'g1b', type: 'gold', top: '14%', left: '-28%', size: 'w-[86px] sm:w-[120px]', dur: '44s', delay: '-22s', reverse: false, op: 0.18 },
      { key: 's1', type: 'silver', top: '18%', left: '-22%', size: 'w-[84px] sm:w-[118px]', dur: '42s', delay: '-24s', reverse: false, op: 0.16 },
      { key: 'g1c', type: 'gold', top: '28%', left: '-26%', size: 'w-[92px] sm:w-[126px]', dur: '48s', delay: '-30s', reverse: false, op: 0.17 },
      { key: 'r1', type: 'sar', top: '36%', left: '-24%', size: 'w-[140px] sm:w-[175px]', dur: '56s', delay: '-18s', reverse: false, op: 0.12 },
      { key: 's1b', type: 'silver', top: '46%', left: '-20%', size: 'w-[78px] sm:w-[110px]', dur: '40s', delay: '-14s', reverse: false, op: 0.14 },
      { key: 'g2', type: 'gold', top: '58%', left: '-22%', size: 'w-[96px] sm:w-[132px]', dur: '46s', delay: '-28s', reverse: false, op: 0.18 },
      { key: 'g2b', type: 'gold', top: '68%', left: '-30%', size: 'w-[86px] sm:w-[120px]', dur: '52s', delay: '-40s', reverse: false, op: 0.15 },
      { key: 'r2', type: 'sar', top: '78%', left: '-30%', size: 'w-[130px] sm:w-[165px]', dur: '62s', delay: '-44s', reverse: false, op: 0.10 },

      { key: 's2', type: 'silver', top: '8%', left: 'auto', right: '-28%', size: 'w-[88px] sm:w-[124px]', dur: '44s', delay: '-12s', reverse: true, op: 0.15 },
      { key: 'g3', type: 'gold', top: '18%', left: 'auto', right: '-22%', size: 'w-[96px] sm:w-[134px]', dur: '38s', delay: '-28s', reverse: true, op: 0.19 },
      { key: 'g3b', type: 'gold', top: '30%', left: 'auto', right: '-30%', size: 'w-[86px] sm:w-[120px]', dur: '50s', delay: '-36s', reverse: true, op: 0.16 },
      { key: 's3', type: 'silver', top: '42%', left: 'auto', right: '-18%', size: 'w-[78px] sm:w-[112px]', dur: '46s', delay: '-22s', reverse: true, op: 0.13 },
      { key: 'r3', type: 'sar', top: '52%', left: 'auto', right: '-24%', size: 'w-[138px] sm:w-[176px]', dur: '64s', delay: '-35s', reverse: true, op: 0.10 },
      { key: 'g4', type: 'gold', top: '64%', left: 'auto', right: '-20%', size: 'w-[96px] sm:w-[132px]', dur: '54s', delay: '-48s', reverse: true, op: 0.16 },
      { key: 's4', type: 'silver', top: '76%', left: 'auto', right: '-28%', size: 'w-[84px] sm:w-[118px]', dur: '58s', delay: '-26s', reverse: true, op: 0.12 }
    ];

    const photoSlots = [
      { top: '10%', left: '-26%', right: undefined, size: 'w-[140px] sm:w-[180px]', dur: '60s', delay: '-20s', reverse: false, op: 0.18, rot: -10 },
      { top: '22%', left: 'auto', right: '-26%', size: 'w-[150px] sm:w-[190px]', dur: '66s', delay: '-42s', reverse: true, op: 0.18, rot: 12 },
      { top: '38%', left: '-20%', right: undefined, size: 'w-[145px] sm:w-[185px]', dur: '72s', delay: '-30s', reverse: false, op: 0.16, rot: 8 },
      { top: '48%', left: 'auto', right: '-22%', size: 'w-[140px] sm:w-[180px]', dur: '70s', delay: '-50s', reverse: true, op: 0.16, rot: -7 },
      { top: '64%', left: '-28%', right: undefined, size: 'w-[150px] sm:w-[190px]', dur: '78s', delay: '-60s', reverse: false, op: 0.14, rot: 10 },
      { top: '74%', left: 'auto', right: '-30%', size: 'w-[140px] sm:w-[180px]', dur: '74s', delay: '-56s', reverse: true, op: 0.14, rot: -9 }
    ];

    const photos = floatingPhotos.slice(0, photoSlots.length).map((src, i) => ({
      key: `p${i}`,
      type: 'photo',
      src,
      ...photoSlots[i]
    }));

    return [...base, ...photos];
  }, [floatingPhotos]);

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

        {/* Floating bullion + SAR notes (landing-style, no dots) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingItems.map((it) => {
            const style = {
              top: it.top,
              left: it.left === 'auto' ? undefined : it.left,
              right: it.right,
              opacity: it.op,
              animationDuration: it.dur,
              animationDelay: it.delay
            };

            const driftAnim = it.reverse ? 'floatDriftReverse' : 'floatDrift';

            return (
              <div
                key={it.key}
                className={`absolute ${it.size} motion-safe-only`}
                style={{
                  ...style,
                  animationName: driftAnim,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite'
                }}
              >
                <div
                  className="motion-safe-only"
                  style={{
                    animationName: 'slowSpin',
                    animationDuration: '28s',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite'
                  }}
                >
                  {it.type === 'gold' ? (
                    <GoldBar className="w-full h-auto drop-shadow-[0_10px_30px_rgba(201,162,39,0.22)]" />
                  ) : it.type === 'silver' ? (
                    <SilverBar className="w-full h-auto drop-shadow-[0_10px_30px_rgba(203,213,225,0.18)]" />
                  ) : it.type === 'photo' ? (
                    <img
                      src={it.src}
                      alt=""
                      loading="lazy"
                      className="w-full h-auto rounded-2xl opacity-95 shadow-2xl shadow-black/10"
                      style={{ transform: `rotate(${it.rot || 0}deg)` }}
                    />
                  ) : (
                    <SarNote className="w-full h-auto drop-shadow-[0_10px_30px_rgba(16,185,129,0.16)]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

