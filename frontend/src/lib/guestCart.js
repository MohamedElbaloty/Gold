const KEY = 'guest.cart.v1';

export function loadGuestCart() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((i) => ({
        productId: String(i.productId || ''),
        quantity: Math.max(1, Math.min(999, Number(i.quantity || 1)))
      }))
      .filter((i) => i.productId);
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items || []));
}

export function clearGuestCart() {
  localStorage.removeItem(KEY);
}

export function addGuestCartItem(productId, quantity) {
  const pid = String(productId || '');
  if (!pid) return;
  const q = Math.max(1, Math.min(999, Number(quantity || 1)));
  const items = loadGuestCart();
  const idx = items.findIndex((i) => String(i.productId) === pid);
  if (idx >= 0) items[idx] = { ...items[idx], quantity: Math.min(999, items[idx].quantity + q) };
  else items.push({ productId: pid, quantity: q });
  saveGuestCart(items);
}

