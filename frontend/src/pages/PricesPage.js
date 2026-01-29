import React, { useContext, useEffect, useMemo, useState } from 'react';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

const PricesPage = () => {
  const { lang } = useContext(UiContext);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grams, setGrams] = useState(1);
  const [countdown, setCountdown] = useState(30);

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'أسعار الذهب لعملاء ذهب السعودية' : 'Gold Prices For Saudi Gold Customers',
      enterAmount: lang === 'ar' ? 'أدخل الكمية بالجرام' : 'Enter the amount in grams',
      updatedIn: lang === 'ar' ? 'سيتم تحديث الأسعار خلال' : 'Prices will be updated in',
      according: lang === 'ar' ? 'طبقاً للسعر العالمي' : 'according to international price',
      buyPrice: lang === 'ar' ? 'سعر الشراء' : 'Buy Price',
      sellPrice: lang === 'ar' ? 'سعر البيع' : 'Sell Price',
      gold24: lang === 'ar' ? 'عيار ذهب 24' : 'karat Gold 24',
      gold22: lang === 'ar' ? 'عيار ذهب 22' : 'karat Gold 22',
      gold21: lang === 'ar' ? 'عيار ذهب 21' : 'karat Gold 21',
      gold18: lang === 'ar' ? 'عيار ذهب 18' : 'karat Gold 18',
      silver: lang === 'ar' ? 'فضة' : 'Silver',
      platinum: lang === 'ar' ? 'بلاتين' : 'Platinum'
    }),
    [lang]
  );

  useEffect(() => {
    const t = setInterval(() => setCountdown((s) => (s <= 1 ? 30 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/pricing/current');
        if (!mounted) return;
        setPrices(res.data);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || 'Failed to load prices');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  // Calculate prices based on grams input
  const calculatePrice = (pricePerGram, gramsAmount) => {
    if (!pricePerGram || !gramsAmount) return 0;
    return pricePerGram * gramsAmount;
  };

  const priceCards = useMemo(() => {
    if (!prices) return [];
    const g = Number(grams) || 1;
    
    return [
      {
        id: 'gold24',
        title: labels.gold24,
        icon: '◆',
        iconColor: 'text-brand-gold',
        buyPrice: calculatePrice(prices.buyPriceSAR, g),
        sellPrice: calculatePrice(prices.sellPriceSAR, g)
      },
      {
        id: 'gold22',
        title: labels.gold22,
        icon: '◆',
        iconColor: 'text-brand-gold',
        buyPrice: calculatePrice((prices.buyPriceSAR * 22) / 24, g),
        sellPrice: calculatePrice((prices.sellPriceSAR * 22) / 24, g)
      },
      {
        id: 'gold21',
        title: labels.gold21,
        icon: '◆',
        iconColor: 'text-brand-gold',
        buyPrice: calculatePrice((prices.buyPriceSAR * 21) / 24, g),
        sellPrice: calculatePrice((prices.sellPriceSAR * 21) / 24, g)
      },
      {
        id: 'gold18',
        title: labels.gold18,
        icon: '◆',
        iconColor: 'text-brand-gold',
        buyPrice: calculatePrice((prices.buyPriceSAR * 18) / 24, g),
        sellPrice: calculatePrice((prices.sellPriceSAR * 18) / 24, g)
      },
      {
        id: 'silver',
        title: labels.silver,
        icon: '▬',
        iconColor: 'text-gray-300',
        buyPrice: calculatePrice(prices.silverBuyPriceSAR, g),
        sellPrice: calculatePrice(prices.silverSellPriceSAR, g)
      },
      {
        id: 'platinum',
        title: labels.platinum,
        icon: '▬',
        iconColor: 'text-gray-400',
        buyPrice: calculatePrice(prices.platinumBuyPriceSAR, g),
        sellPrice: calculatePrice(prices.platinumSellPriceSAR, g)
      }
    ];
  }, [prices, grams, labels]);

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <h1 className="text-center text-2xl md:text-3xl font-bold text-brand-gold mb-2">
          {labels.title}
        </h1>

        {/* Instruction */}
        <p className="text-center text-white/70 text-sm mb-4">
          {labels.enterAmount}
        </p>

        {/* Input field */}
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-xs">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">Gm</div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-800 border border-white/10 text-white text-lg font-medium focus:outline-none focus:border-brand-gold/50"
              placeholder="1"
            />
          </div>
        </div>

        {/* Update info */}
        <div className="text-center mb-6">
          <p className="text-white/70 text-sm mb-1">
            {labels.updatedIn} <span className="text-brand-gold font-semibold">{countdown}</span> {lang === 'ar' ? 'ثوانٍ' : 'seconds'} {labels.according}
          </p>
          {prices?.timestamp && (
            <p className="text-brand-gold text-sm font-medium">
              {new Date(prices.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          )}
        </div>

        {error && <div className="text-center text-red-400 text-sm mb-4">{error}</div>}

        {/* Price cards grid */}
        {loading ? (
          <div className="py-20 text-center text-white/70">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priceCards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-white/10 bg-gray-800 p-5 hover:border-brand-gold/30 transition"
              >
                {/* Icon and title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-2xl ${card.iconColor}`}>{card.icon}</div>
                  <div className="text-white font-medium text-sm">{card.title}</div>
                </div>

                {/* Buy Price */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <span className="text-white/70 text-sm">{labels.buyPrice}</span>
                  <span className="text-brand-gold font-semibold">
                    {card.buyPrice.toFixed(3)} <span className="text-white/60 text-xs font-normal">{prices?.currency || 'SAR'}</span>
                  </span>
                </div>

                {/* Sell Price */}
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">{labels.sellPrice}</span>
                  <span className="text-brand-gold font-semibold">
                    {card.sellPrice.toFixed(3)} <span className="text-white/60 text-xs font-normal">{prices?.currency || 'SAR'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricesPage;

