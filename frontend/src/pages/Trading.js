import React, { useContext, useMemo, useState, useEffect } from 'react';
import { api } from '../lib/api';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';

const Trading = () => {
  const { accountMode } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const [prices, setPrices] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [metalType, setMetalType] = useState('gold'); // 'gold' | 'silver'
  const [amountGrams, setAmountGrams] = useState('');
  const [loading, setLoading] = useState(false);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const metalLabel = (m) => {
    const t = (m || 'gold').toLowerCase();
    if (t === 'silver') {
      return {
        key: 'silver',
        short: 'Ag',
        name: lang === 'ar' ? 'الفضة' : 'Silver'
      };
    }
    return {
      key: 'gold',
      short: 'Au',
      name: lang === 'ar' ? 'الذهب' : 'Gold'
    };
  };

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'تداول الذهب والفضة (حلال) من السعودية' : 'Halal Gold & Silver Trading from Saudi Arabia',
      subtitle:
        lang === 'ar'
          ? 'اشترِ سبائك ذهب سعودية حقيقية تُسجَّل باسمك في خزائن آمنة داخل المملكة، ويمكنك طلب استلامها في أي وقت أو بيعها من حسابك مباشرة وفق الأسعار الفورية.'
          : 'Buy real Saudi bullion registered in your name in secure vaults within the Kingdom. Request delivery anytime or sell from your account at spot prices.',
      livePrices: lang === 'ar' ? 'أسعار الشراء والبيع (منصتنا)' : 'Our buy & sell prices',
      metal: lang === 'ar' ? 'المعدن' : 'Metal',
      gold: lang === 'ar' ? 'ذهب' : 'Gold',
      silver: lang === 'ar' ? 'فضة' : 'Silver',
      buyFromPlatform: lang === 'ar' ? 'سعر الشراء من المنصة' : 'Buy from platform',
      sellToPlatform: lang === 'ar' ? 'سعر البيع للمنصة' : 'Sell to platform',
      sarPerGram: lang === 'ar' ? 'ريال / جم' : 'SAR / g',
      yourWallet: lang === 'ar' ? 'محفظتك في المنصة' : 'Your Platform Wallet',
      metalHeld: (metalName) => (lang === 'ar' ? `رصيد ${metalName} المملوك` : `${metalName} held`),
      metalValue: (metalName) => (lang === 'ar' ? `قيمة ${metalName} التقريبية` : `Approx. ${metalName} value`),
      cashAvailable: lang === 'ar' ? 'الرصيد النقدي المتاح' : 'Cash available',
      sarNote:
        lang === 'ar'
          ? 'جميع الأرصدة مقومة بالريال السعودي ومتوافقة مع أنظمة المملكة العربية السعودية.'
          : 'All balances in Saudi Riyal, compliant with Saudi regulations.',
      buyTitle: (metalName) => (lang === 'ar' ? `شراء ${metalName}` : `Buy ${metalName}`),
      buyDesc:
        lang === 'ar'
          ? 'عند الشراء يتم حجز الكمية باسمك في خزائن آمنة داخل المملكة، ويمكنك استلامها أو بيعها من حسابك في أي وقت.'
          : 'Bullion is reserved in your name in secure Saudi vaults. Request delivery or sell from your account anytime.',
      amountGrams: lang === 'ar' ? 'الكمية بالجرام' : 'Amount (grams)',
      example: lang === 'ar' ? 'مثال: 10' : 'e.g. 10',
      priceNow: lang === 'ar' ? 'سعر الجرام عند الشراء الآن:' : 'Price per gram now:',
      orderTotal: lang === 'ar' ? 'إجمالي قيمة الطلب التقريبية:' : 'Approx. order total:',
      confirmBuy: (metalName) =>
        lang === 'ar' ? `تأكيد شراء ${metalName} وحجزه باسمي` : `Confirm buy ${metalName} & reserve in my name`,
      buying: lang === 'ar' ? 'جاري تنفيذ الطلب...' : 'Processing…',
      invalidAmount: lang === 'ar' ? 'من فضلك أدخل كمية صحيحة بالجرام' : 'Please enter a valid amount in grams',
      buySuccess: (amount, metalName) =>
        lang === 'ar'
          ? `تم شراء ${amount} جم من ${metalName} وحجزها باسمك في خزائن آمنة داخل المملكة.`
          : `${amount} g of ${metalName} purchased and reserved in your name in secure Saudi vaults.`,
      sellSuccess: (amount, metalName) =>
        lang === 'ar'
          ? `تم بيع ${amount} جم من ${metalName} وإضافة قيمتها إلى رصيدك بالريال السعودي.`
          : `${amount} g of ${metalName} sold. Value added to your SAR balance.`,
      buyFailed: lang === 'ar' ? 'فشل تنفيذ عملية الشراء' : 'Purchase failed',
      sellFailed: lang === 'ar' ? 'فشل تنفيذ عملية البيع' : 'Sell failed',
      myHoldings: (metalName) => (lang === 'ar' ? `حيازات ${metalName} المحفوظة` : `My reserved ${metalName}`),
      updating: lang === 'ar' ? 'يتم تحديث بيانات الحيازات…' : 'Updating holdings…',
      noHoldings:
        lang === 'ar'
          ? 'لا توجد لديك حاليًا أي حيازات محفوظة. ابدأ بالشراء من النموذج أعلاه.'
          : 'No reserved holdings yet. Start by buying above.',
      grams: lang === 'ar' ? 'جم' : 'g',
      buyPrice: lang === 'ar' ? 'سعر الشراء (ريال/جم)' : 'Buy price (SAR/g)',
      valueAtBuy: lang === 'ar' ? 'القيمة عند الشراء' : 'Value at purchase',
      currentValue: lang === 'ar' ? 'القيمة الحالية' : 'Current value',
      status: lang === 'ar' ? 'الحالة' : 'Status',
      actions: lang === 'ar' ? 'إجراءات' : 'Actions',
      sellNow: lang === 'ar' ? 'بيع الآن' : 'Sell now',
      shipLater: lang === 'ar' ? 'طلب شحن (سيتم تفعيله لاحقًا)' : 'Request shipping (coming soon)',
      liveMarketNote:
        lang === 'ar'
          ? 'ملاحظة: سعر الشراء ثابت، لكن القيمة الحالية تتغير لحظيًا حسب سعر السوق.'
          : 'Note: Your purchase price is fixed, but the current value updates in real time with the market.',
      reserved: lang === 'ar' ? 'محفوظ في الخزائن' : 'Reserved in vaults',
      delivered: lang === 'ar' ? 'تم التسليم' : 'Delivered',
      shipped: lang === 'ar' ? 'قيد الشحن' : 'Shipped',
      sold: lang === 'ar' ? 'مباع' : 'Sold',
      cancelled: lang === 'ar' ? 'ملغى' : 'Cancelled',
      deliveredNote: lang === 'ar' ? 'تم تسليم هذه السبيكة لك بالفعل.' : 'This bullion has been delivered.',
      sar: lang === 'ar' ? 'ريال سعودي' : 'SAR'
    }),
    [lang]
  );

  useEffect(() => {
    if (!accountMode) return;
    fetchAll();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on accountMode only
  }, [accountMode]);

  const fetchAll = async () => {
    setInitLoading(true);
    try {
      await Promise.all([fetchPrices(), fetchWallet(), fetchHoldings()]);
    } catch (err) {
      console.error('Error initializing halal trading:', err);
    } finally {
      setInitLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await api.get('/api/pricing/current');
      setPrices(res.data);
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  };

  const fetchWallet = async () => {
    if (!accountMode) return;
    try {
      const res = await api.get('/api/wallet/balance', { params: { mode: accountMode } });
      setWallet(res.data);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  const fetchHoldings = async () => {
    if (!accountMode) return;
    try {
      setHoldingsLoading(true);
      const res = await api.get('/api/trade/holdings', { params: { mode: accountMode } });
      setHoldings(res.data.holdings || []);
    } catch (err) {
      console.error('Error fetching holdings:', err);
    } finally {
      setHoldingsLoading(false);
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const amount = parseFloat(amountGrams);
      if (!amount || amount <= 0) {
        setError(labels.invalidAmount);
        setLoading(false);
        return;
      }
      const m = metalLabel(metalType);
      await api.post('/api/trade/buy', { amount, metal: metalType, mode: accountMode });
      setSuccess(labels.buySuccess(amount, m.name));
      setAmountGrams('');
      await Promise.all([fetchWallet(), fetchHoldings(), fetchPrices()]);
    } catch (err) {
      setError(err.response?.data?.message || labels.buyFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async ({ amount, metalType: sellMetalType }) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const m = metalLabel(sellMetalType);
      await api.post('/api/trade/sell', { amount, metal: sellMetalType, mode: accountMode });
      setSuccess(labels.sellSuccess(amount, m.name));
      await Promise.all([fetchWallet(), fetchHoldings(), fetchPrices()]);
    } catch (err) {
      setError(err.response?.data?.message || labels.sellFailed);
    } finally {
      setLoading(false);
    }
  };

  const calculateBuyTotal = () => {
    if (!prices || !amountGrams) return 0;
    const amount = parseFloat(amountGrams);
    if (isNaN(amount) || amount <= 0) return 0;
    const buy = metalType === 'silver' ? prices.silverBuyPriceSAR : prices.buyPriceSAR;
    return (amount * (buy || 0)).toFixed(2);
  };

  const normalizedHoldings = holdings.map((h) => ({ ...h, metalType: h.metalType || 'gold' }));
  const filteredHoldings = normalizedHoldings.filter((h) => (h.metalType || 'gold') === metalType);
  const totalHoldingsGrams = filteredHoldings.reduce((sum, h) => sum + (h.goldAmount || 0), 0);
  const totalHoldingsValue = prices
    ? (
        totalHoldingsGrams *
        (metalType === 'silver' ? (prices.silverSellPriceSAR || 0) : (prices.sellPriceSAR || 0))
      ).toFixed(2)
    : '0.00';

  const currentValueForHolding = (holding) => {
    const grams = Number(holding?.goldAmount || 0);
    if (!prices || !grams) return null;
    // Use sell price since "Sell now" is the realistic liquidation value.
    // Fallback to spot price if sell price is missing.
    const hMetal = (holding?.metalType || 'gold').toLowerCase();
    const perGram =
      hMetal === 'silver'
        ? Number(prices.silverSellPriceSAR ?? prices.silverSpotPriceSAR ?? 0)
        : Number(prices.sellPriceSAR ?? prices.spotPriceSAR ?? 0);
    if (!perGram) return null;
    return grams * perGram;
  };

  const statusLabel = (s) => {
    if (s === 'reserved') return labels.reserved;
    if (s === 'delivered') return labels.delivered;
    if (s === 'shipped') return labels.shipped;
    if (s === 'sold') return labels.sold;
    if (s === 'cancelled') return labels.cancelled;
    return s || '—';
  };

  const statusStyles = (s) => {
    if (s === 'reserved') return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30';
    if (s === 'delivered') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
    if (s === 'shipped') return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30';
    return 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10';
  };

  if (initLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-brand-muted">
          {lang === 'ar' ? 'جاري تحميل التداول…' : 'Loading trading…'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-gray-900 via-[#1a1a1f] to-gray-900 dark:from-black dark:via-[#0d0d0f] dark:to-black border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,0.15),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold2 mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            {labels.title}
          </h1>
          <p className="text-base text-white/70 max-w-2xl leading-relaxed">
            {labels.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 relative z-10">
        {/* Metal selector */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setMetalType('gold')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                metalType === 'gold'
                  ? 'bg-gradient-to-r from-brand-gold to-brand-gold2 text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {labels.gold}
            </button>
            <button
              type="button"
              onClick={() => setMetalType('silver')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                metalType === 'silver'
                  ? 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 dark:from-white/20 dark:to-white/10 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {labels.silver}
            </button>
          </div>
        </div>

        {/* Live Prices */}
        {prices && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {labels.livePrices} — {metalLabel(metalType).name} ({lang === 'ar' ? 'ريال سعودي' : 'SAR'})
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/10">
              <div className="p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-brand-muted mb-1">
                  {labels.buyFromPlatform}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {(metalType === 'silver' ? prices.silverBuyPriceSAR : prices.buyPriceSAR)?.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-gray-500 dark:text-brand-muted">{labels.sarPerGram}</span>
                </p>
              </div>
              <div className="p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-brand-muted mb-1">
                  {labels.sellToPlatform}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                  {(metalType === 'silver' ? prices.silverSellPriceSAR : prices.sellPriceSAR)?.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-gray-500 dark:text-brand-muted">{labels.sarPerGram}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet */}
        {wallet && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.yourWallet}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/10">
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-brand-muted mb-1">
                  {labels.metalHeld(metalLabel(metalType).name)}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {totalHoldingsGrams.toFixed(4)} <span className="text-sm font-normal text-gray-500">{labels.grams}</span>
                </p>
              </div>
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-brand-muted mb-1">
                  {labels.metalValue(metalLabel(metalType).name)}
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {totalHoldingsValue} <span className="text-sm font-normal text-gray-500">{labels.sar}</span>
                </p>
              </div>
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-brand-muted mb-1">
                  {labels.cashAvailable}
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {wallet.sarBalance.toFixed(2)} <span className="text-sm font-normal text-gray-500">{labels.sar}</span>
                </p>
              </div>
            </div>
            <p className="px-6 py-3 text-xs text-gray-500 dark:text-brand-muted bg-gray-50 dark:bg-white/5">
              {labels.sarNote}
            </p>
          </div>
        )}

        {/* Buy Form */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.buyTitle(metalLabel(metalType).name)}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-brand-muted">{labels.buyDesc}</p>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleBuy}>
              <div className="mb-4">
                <label htmlFor="amountGrams" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {labels.amountGrams}
                </label>
                <div className="relative">
                  <input
                    id="amountGrams"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full px-4 py-3 pe-12 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition"
                    placeholder={labels.example}
                    value={amountGrams}
                    onChange={(e) => setAmountGrams(e.target.value)}
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 end-3 text-sm text-gray-500 dark:text-brand-muted pointer-events-none">
                    {labels.grams}
                  </span>
                </div>
              </div>
              {prices && (
                <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{labels.priceNow}</span>
                    <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                      {Number((metalType === 'silver' ? prices.silverBuyPriceSAR : prices.buyPriceSAR) || 0).toFixed(2)}{' '}
                      {labels.sarPerGram}
                    </span>
                  </div>
                  {amountGrams && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400">{labels.orderTotal}</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                        {calculateBuyTotal()} {labels.sar}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !amountGrams}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-black bg-gradient-to-r from-brand-gold to-brand-gold2 hover:opacity-95 focus:ring-2 focus:ring-brand-gold/50 focus:ring-offset-2 dark:focus:ring-offset-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? labels.buying : labels.confirmBuy(metalLabel(metalType).name)}
              </button>
            </form>
          </div>
        </div>

        {/* Holdings */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.myHoldings(metalLabel(metalType).name)}</h2>
            {holdingsLoading && (
              <span className="text-xs text-gray-500 dark:text-brand-muted">{labels.updating}</span>
            )}
          </div>
          {filteredHoldings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-brand-muted text-sm">{labels.noHoldings}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5">
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-muted">
                      {labels.amountGrams}
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-muted">
                      {labels.buyPrice}
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-muted">
                      {labels.valueAtBuy}
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-muted">
                      {labels.currentValue}
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-muted">
                      {labels.status}
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-brand-muted">
                      {labels.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {filteredHoldings.map((h) => (
                    <tr key={h._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white tabular-nums">
                        {h.goldAmount?.toFixed(4)} <span className="text-gray-500">{labels.grams}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        {h.purchasePricePerGram?.toFixed(2)} {labels.sarPerGram}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        {h.purchaseTotalSAR?.toFixed(2)} {labels.sar}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        {(() => {
                          const v = currentValueForHolding(h);
                          return v === null ? '—' : `${v.toFixed(2)} ${labels.sar}`;
                        })()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusStyles(
                            h.status
                          )}`}
                        >
                          {statusLabel(h.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {h.status === 'reserved' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSell({ amount: h.goldAmount, metalType: h.metalType || 'gold' })}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50 transition"
                              >
                                {labels.sellNow}
                              </button>
                              <button
                                type="button"
                                disabled
                                className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-brand-muted text-xs font-medium cursor-not-allowed"
                              >
                                {labels.shipLater}
                              </button>
                              <p className="basis-full text-[11px] leading-relaxed text-gray-500 dark:text-brand-muted">
                                {labels.liveMarketNote}
                              </p>
                            </>
                          )}
                          {h.status === 'delivered' && (
                            <span className="text-xs text-gray-500 dark:text-brand-muted">{labels.deliveredNote}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trading;
