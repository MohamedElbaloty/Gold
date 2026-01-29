import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import UiContext from '../../context/UiContext';
import { api } from '../../lib/api';
import { addGuestCartItem } from '../../lib/guestCart';

const ProductDetails = () => {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const labels = useMemo(
    () => ({
      back: lang === 'ar' ? 'رجوع' : 'Back',
      add: lang === 'ar' ? 'إضافة للسلة' : 'Add to cart',
      buy: lang === 'ar' ? 'إكمال الشراء' : 'Checkout',
      qty: lang === 'ar' ? 'الكمية' : 'Qty'
    }),
    [lang]
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/store/products/${idOrSlug}`);
        if (!mounted) return;
        setProduct(res.data.product);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [idOrSlug]);

  const addToCart = async () => {
    if (!product) return;
    setAdding(true);
    setError('');
    try {
      const q = Math.max(1, Math.min(999, Number(qty || 1)));
      if (!user) {
        addGuestCartItem(product._id, q);
        navigate('/cart');
        return;
      }

      const cartRes = await api.get('/api/store/cart');
      const cart = cartRes.data.cart;
      const items = (cart?.items || []).map((it) => ({
        productId: it.productId?._id || it.productId,
        quantity: it.quantity
      }));
      const idx = items.findIndex((i) => String(i.productId) === String(product._id));
      if (idx >= 0) items[idx] = { ...items[idx], quantity: Math.min(999, items[idx].quantity + q) };
      else items.push({ productId: product._id, quantity: q });
      await api.put('/api/store/cart', { items });
      navigate('/cart');
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-sm text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
        >
          {labels.back}
        </button>
        <Link to="/cart" className="h-10 px-4 rounded-xl bg-brand-gold text-black text-sm font-medium flex items-center">
          {lang === 'ar' ? 'السلة' : 'Cart'}
        </Link>
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : !product ? (
          <div className="p-10 text-center text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'غير موجود' : 'Not found'}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 flex items-center justify-center overflow-hidden">
              {Array.isArray(product.images) && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-3xl bg-brand-gold/20 border border-brand-gold/40" />
              )}
            </div>
            <div className="p-6">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{product.title}</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-brand-muted">{product.description || ''}</div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {product.metalType && (
                  <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/90">
                    {product.metalType}
                  </span>
                )}
                {product.karat ? (
                  <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/90">
                    {product.karat}K
                  </span>
                ) : null}
                {product.weightGrams ? (
                  <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/90">
                    {product.weightGrams}g
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-brand-muted">{lang === 'ar' ? 'السعر' : 'Price'}</div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {Number(product.price?.amount || 0).toFixed(3)} {product.price?.currency || 'SAR'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-brand-muted">
                  {lang === 'ar' ? 'المخزون' : 'Stock'}: {product.stockQty ?? 0}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-700 dark:text-white/90">{labels.qty}</div>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="h-10 w-24 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg px-3 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={adding}
                  className="h-10 px-4 rounded-xl bg-brand-gold text-black font-medium disabled:opacity-60"
                >
                  {adding ? (lang === 'ar' ? '...' : '...') : labels.add}
                </button>

                <Link
                  to="/checkout"
                  className="h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center"
                >
                  {labels.buy}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

