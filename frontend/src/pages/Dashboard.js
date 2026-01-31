import React, { useMemo, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';

const StatIcon = ({ children, className = '' }) => (
  <div className={`h-10 w-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  const { accountMode } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const [prices, setPrices] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const labels = useMemo(
    () => ({
      loading: lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…',
      title: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      livePrices: lang === 'ar' ? 'أسعار الذهب (تحديث مباشر)' : 'Live Gold Prices',
      spot: lang === 'ar' ? 'السعر الفوري (ريال/جرام)' : 'Spot Price (SAR/g)',
      buy: lang === 'ar' ? 'سعر الشراء (ريال/جرام)' : 'Buy Price (SAR/g)',
      sell: lang === 'ar' ? 'سعر البيع (ريال/جرام)' : 'Sell Price (SAR/g)',
      lastUpdated: lang === 'ar' ? 'آخر تحديث' : 'Last Updated',
      goldBalance: lang === 'ar' ? 'رصيد الذهب' : 'Gold Balance',
      sarBalance: lang === 'ar' ? 'الرصيد بالريال' : 'SAR Balance',
      approx: lang === 'ar' ? 'تقريباً' : '≈',
      available: lang === 'ar' ? 'متاح للتداول' : 'Available for trading',
      tradeCta: lang === 'ar' ? 'ابدأ التداول' : 'Trade Gold',
      tradeDesc: lang === 'ar' ? 'شراء أو بيع الذهب بالأسعار الحالية' : 'Buy or sell gold at live prices',
      walletCta: lang === 'ar' ? 'عرض المحفظة' : 'View Wallet',
      walletDesc: lang === 'ar' ? 'تابع رصيدك وسجل العمليات' : 'Check balance and transaction history',
      sar: lang === 'ar' ? 'ر.س' : 'SAR'
    }),
    [lang]
  );

  useEffect(() => {
    if (!accountMode) {
      setLoading(false);
      return;
    }
    fetchData();
    const priceInterval = setInterval(fetchPrices, 30000);
    return () => clearInterval(priceInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on accountMode only; fetchData/fetchPrices are stable
  }, [accountMode]);

  const fetchData = async () => {
    if (!accountMode) return;
    try {
      await Promise.all([fetchPrices(), fetchWallet()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await api.get('/api/pricing/current');
      setPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchWallet = async () => {
    if (!accountMode) return;
    try {
      const response = await api.get('/api/wallet/balance', { params: { mode: accountMode } });
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{labels.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg">
      {/* Header */}
      <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-gray-900 via-[#1a1a1f] to-gray-900 dark:from-black dark:via-[#0d0d0f] dark:to-black border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,0.14),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold2 mb-5" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{labels.title}</h1>
              <p className="mt-2 text-sm text-white/70">
                {lang === 'ar'
                  ? 'نظرة سريعة على الأسعار ورصيدك وإجراءاتك الأساسية.'
                  : 'A quick overview of prices, balances, and key actions.'}
              </p>
            </div>
            {accountMode ? (
              <div
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm font-semibold ${
                  accountMode === 'demo'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span>{accountMode === 'demo' ? (lang === 'ar' ? 'حساب تجريبي' : 'Demo') : (lang === 'ar' ? 'حساب فعلي' : 'Real')}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 relative z-10">
        {/* Price Ticker */}
        {prices && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.livePrices}</h2>
              </div>
              <div className="text-xs text-gray-500 dark:text-brand-muted">
                {labels.lastUpdated}:{' '}
                {prices?.timestamp
                  ? new Date(prices.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')
                  : '—'}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/10">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <StatIcon>
                    <span className="text-brand-gold font-bold">Au</span>
                  </StatIcon>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.spot}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {prices.spotPriceSAR?.toFixed(2)} <span className="text-sm font-medium text-gray-500">{labels.sar}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <StatIcon className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">↗</span>
                  </StatIcon>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.buy}</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {prices.buyPriceSAR?.toFixed(2)} <span className="text-sm font-medium text-gray-500">{labels.sar}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <StatIcon className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30">
                    <span className="text-rose-700 dark:text-rose-300 font-bold">↘</span>
                  </StatIcon>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.sell}</div>
                    <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {prices.sellPriceSAR?.toFixed(2)} <span className="text-sm font-medium text-gray-500">{labels.sar}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Summary */}
        {wallet && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            <div className="lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{lang === 'ar' ? 'ملخص الرصيد' : 'Balance overview'}</h2>
                <div className="text-xs text-gray-500 dark:text-brand-muted">{labels.sar}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/10">
                <div className="p-6">
                  <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.goldBalance}</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {wallet.goldBalance.toFixed(4)} <span className="text-sm font-medium text-gray-500">g</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-brand-muted">
                    {labels.approx} {((wallet.goldBalance * (prices?.buyPriceSAR || 0)).toFixed(2))} {labels.sar}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{lang === 'ar' ? 'رصيد الفضة' : 'Silver balance'}</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {(wallet.silverBalance || 0).toFixed(4)} <span className="text-sm font-medium text-gray-500">g</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-brand-muted">
                    {labels.approx}{' '}
                    {(((wallet.silverBalance || 0) * (prices?.silverBuyPriceSAR || 0)).toFixed(2))} {labels.sar}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.sarBalance}</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {wallet.sarBalance.toFixed(2)} <span className="text-sm font-medium text-gray-500">{labels.sar}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-brand-muted">{labels.available}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Link
                to="/trading"
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-gold/20 to-black/20 dark:from-brand-gold/15 dark:to-white/5 p-6 hover:border-brand-gold/50 transition shadow-lg shadow-black/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{labels.tradeCta}</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-white/60">{labels.tradeDesc}</div>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                    <span className="text-brand-gold font-bold">↔</span>
                  </div>
                </div>
              </Link>
              <Link
                to="/wallet"
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-6 hover:border-brand-gold/60 transition shadow-lg shadow-gray-200/50 dark:shadow-black/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{labels.walletCta}</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-white/60">{labels.walletDesc}</div>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">﷼</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
