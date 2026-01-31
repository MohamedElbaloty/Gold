import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';
import { loadGuestCart, saveGuestCart } from '../../lib/guestCart';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'سلة المشتريات' : 'Cart',
      empty: lang === 'ar' ? 'سلة المشتريات فاضية' : 'Your cart is empty',
      checkout: lang === 'ar' ? 'إتمام الطلب' : 'Checkout',
      update: lang === 'ar' ? 'تحديث' : 'Update',
      back: lang === 'ar' ? 'رجوع للكتالوج' : 'Back to catalog'
    }),
    [lang]
  );

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      if (user) {
        const res = await api.get('/api/store/cart');
        setCart(res.data.cart);
        return;
      }

      // Guest cart: load from localStorage and hydrate product details
      const guestItems = loadGuestCart();
      if (guestItems.length === 0) {
        setCart({ items: [] });
        return;
      }

      const ids = guestItems.map((i) => i.productId).join(',');
      const prodRes = await api.get('/api/store/products', { params: { ids, limit: 100 } });
      const products = prodRes.data.products || [];
      const byId = new Map(products.map((p) => [String(p._id), p]));
      const items = guestItems
        .map((i) => ({ productId: byId.get(String(i.productId)) || { _id: i.productId }, quantity: i.quantity }))
        .filter((i) => i.productId && i.quantity > 0);
      setCart({ items });
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateQty = (productId, quantity) => {
    setCart((prev) => {
      if (!prev) return prev;
      const items = (prev.items || []).map((it) => {
        const pid = it.productId?._id || it.productId;
        if (String(pid) !== String(productId)) return it;
        return { ...it, quantity: Math.max(1, Math.min(999, Number(quantity || 1))) };
      });
      return { ...prev, items };
    });
  };

  const removeItem = (productId) => {
    setCart((prev) => {
      if (!prev) return prev;
      const items = (prev.items || []).filter((it) => String(it.productId?._id || it.productId) !== String(productId));
      return { ...prev, items };
    });
  };

  const saveCart = async () => {
    setSaving(true);
    setError('');
    try {
      const items = (cart?.items || []).map((it) => ({
        productId: it.productId?._id || it.productId,
        quantity: it.quantity
      }));
      if (!user) {
        saveGuestCart(items);
        await loadCart();
        return;
      }
      const res = await api.put('/api/store/cart', { items });
      setCart(res.data.cart);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to save cart');
    } finally {
      setSaving(false);
    }
  };

  const subtotal = (cart?.items || []).reduce((sum, it) => {
    const p = it.productId || {};
    const unit = Number(p.price?.amount || 0);
    return sum + unit * Number(it.quantity || 0);
  }, 0);

  const currency = cart?.items?.[0]?.productId?.price?.currency || 'SAR';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{labels.title}</h1>
        <Link to="/store/catalog" className="text-sm text-brand-gold hover:opacity-90">
          {labels.back}
        </Link>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : !cart || (cart.items || []).length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-gray-600 dark:text-brand-muted">{labels.empty}</div>
            <button
              type="button"
              onClick={() => navigate('/store/catalog')}
              className="mt-4 h-10 px-4 rounded-xl bg-brand-gold text-black font-medium"
            >
              {labels.back}
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-3">
              {(cart.items || []).map((it) => {
                const p = it.productId || {};
                const pid = p._id || it.productId;
                return (
                  <div
                    key={String(pid)}
                    className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 border border-gray-200 dark:border-white/10" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.title || 'Product'}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-brand-muted">
                        {Number(p.price?.amount || 0).toFixed(3)} {p.price?.currency || currency}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={it.quantity}
                        onChange={(e) => updateQty(pid, e.target.value)}
                        className="h-10 w-24 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-3 text-sm text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(pid)}
                        className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        {lang === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600 dark:text-brand-muted">
                {lang === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'}:{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {subtotal.toFixed(3)} {currency}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveCart}
                  disabled={saving}
                  className="h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-60"
                >
                  {saving ? (lang === 'ar' ? '...' : '...') : labels.update}
                </button>
                <Link to="/checkout" className="h-11 px-5 rounded-xl bg-brand-gold text-black font-medium flex items-center">
                  {labels.checkout}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

