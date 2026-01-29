import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';
import { clearGuestCart, loadGuestCart } from '../../lib/guestCart';

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(UiContext);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    country: lang === 'ar' ? 'الكويت' : 'Kuwait',
    city: '',
    area: '',
    street: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'إتمام الطلب' : 'Checkout',
      pay: lang === 'ar' ? 'الانتقال للدفع' : 'Proceed to payment',
      cart: lang === 'ar' ? 'رجوع للسلة' : 'Back to cart',
      success: lang === 'ar' ? 'تم إنشاء الطلب' : 'Order created'
    }),
    [lang]
  );

  const onChange = (key) => (e) => setShippingAddress((s) => ({ ...s, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.post('/api/store/checkout', {
        paymentProvider: 'stripe',
        shippingAddress
      });
      setOrder(res.data.order);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  // If user had items as a guest, sync them into the authenticated cart once at checkout.
  useEffect(() => {
    let mounted = true;
    async function syncGuest() {
      if (!user) return;
      const guest = loadGuestCart();
      if (guest.length === 0) return;

      setSyncing(true);
      try {
        const cartRes = await api.get('/api/store/cart');
        const cart = cartRes.data.cart;
        const items = (cart?.items || []).map((it) => ({
          productId: it.productId?._id || it.productId,
          quantity: it.quantity
        }));

        const byId = new Map(items.map((i) => [String(i.productId), i.quantity]));
        for (const gi of guest) {
          byId.set(String(gi.productId), Math.min(999, (byId.get(String(gi.productId)) || 0) + gi.quantity));
        }
        const merged = Array.from(byId.entries()).map(([productId, quantity]) => ({ productId, quantity }));
        await api.put('/api/store/cart', { items: merged });
        clearGuestCart();
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || 'Failed to sync cart');
      } finally {
        if (mounted) setSyncing(false);
      }
    }
    syncGuest();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{labels.title}</h1>
        <Link to="/cart" className="text-sm text-brand-gold hover:opacity-90">
          {labels.cart}
        </Link>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      {syncing && (
        <div className="mt-3 text-sm text-gray-600 dark:text-brand-muted">
          {lang === 'ar' ? 'جارٍ نقل السلة من وضع الضيف...' : 'Syncing guest cart...'}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{lang === 'ar' ? 'عنوان الشحن' : 'Shipping address'}</div>
          <form onSubmit={submit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={shippingAddress.fullName}
              onChange={onChange('fullName')}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'}
              required
            />
            <input
              value={shippingAddress.phone}
              onChange={onChange('phone')}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone'}
              required
            />
            <input
              value={shippingAddress.country}
              onChange={onChange('country')}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'الدولة' : 'Country'}
            />
            <input
              value={shippingAddress.city}
              onChange={onChange('city')}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'المدينة' : 'City'}
              required
            />
            <input
              value={shippingAddress.area}
              onChange={onChange('area')}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'المنطقة' : 'Area'}
            />
            <input
              value={shippingAddress.street}
              onChange={onChange('street')}
              className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'الشارع' : 'Street'}
            />
            <textarea
              value={shippingAddress.notes}
              onChange={onChange('notes')}
              className="sm:col-span-2 min-h-[90px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-4 py-3 text-sm text-gray-900 dark:text-white"
              placeholder={lang === 'ar' ? 'ملاحظات' : 'Notes'}
            />

            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 h-11 rounded-xl bg-brand-gold text-black font-medium disabled:opacity-60"
            >
              {loading ? (lang === 'ar' ? '...' : '...') : labels.pay}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{lang === 'ar' ? 'الدفع' : 'Payment'}</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-brand-muted">
            {lang === 'ar'
              ? 'تم تجهيز الـ Checkout. ربط بوابة الدفع الحقيقية (Stripe/غيره) سيتم عند إضافة مفاتيح الدفع.'
              : 'Checkout is scaffolded. Real payment gateway will be enabled once keys are added.'}
          </div>

          {order && (
            <div className="mt-4 rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{labels.success}</div>
              <div className="mt-1 text-xs text-gray-700 dark:text-white/80">
                {lang === 'ar' ? 'رقم الطلب' : 'Order id'}: {order._id}
              </div>
              <div className="mt-1 text-xs text-gray-700 dark:text-white/80">
                {lang === 'ar' ? 'الحالة' : 'Status'}: {order.status}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

