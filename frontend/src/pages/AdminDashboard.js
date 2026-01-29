import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [ordersPage, setOrdersPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterVersion, setFilterVersion] = useState(0);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [ordersMessage, setOrdersMessage] = useState('');

  const fetchOverview = useCallback(async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/settings')
      ]);
      setStats(statsRes.data.stats);
      setSettings(settingsRes.data);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  }, []);

  const fetchOrders = useCallback(async (page) => {
    setOrdersLoading(true);
    setOrdersMessage('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      if (filterEmail.trim()) params.set('email', filterEmail.trim());
      const res = await api.get(`/api/admin/orders?${params}`);
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (e) {
      console.error('Error fetching orders:', e);
      setOrders([]);
      setOrdersMessage('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [filterType, filterStatus, filterEmail]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchOverview();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    fetchOrders(ordersPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ordersPage, filterVersion]);

  const updateSettings = async (updates) => {
    setSettingsMessage('');
    try {
      const res = await api.put('/api/admin/settings', updates);
      setSettings(res.data.settings);
      setSettingsMessage('Settings updated');
    } catch {
      setSettingsMessage('Failed to update');
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this pending order?')) return;
    setOrdersMessage('');
    try {
      await api.put(`/api/admin/orders/${id}`, { status: 'cancelled' });
      await fetchOrders(ordersPage);
      setOrdersMessage('Order cancelled');
    } catch (e) {
      setOrdersMessage(e.response?.data?.message || 'Failed to cancel');
    }
  };

  const applyFilters = () => {
    setOrdersPage(1);
    setFilterVersion((v) => v + 1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-brand-muted">Loading admin…</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'settings', label: 'Settings' },
    { id: 'orders', label: 'Orders' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Admin Dashboard
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === t.id
                  ? 'bg-brand-gold text-black'
                  : 'bg-white dark:bg-brand-surface border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Total Orders', value: stats.totalOrders },
              { label: 'Gold Bought (g)', value: stats.totalGoldBought?.toFixed(2), color: 'text-amber-500' },
              { label: 'Gold Sold (g)', value: stats.totalGoldSold?.toFixed(2), color: 'text-red-500' },
              { label: 'Net Exposure (g)', value: stats.netExposure?.toFixed(2) },
              { label: 'Volume (SAR)', value: stats.totalSARVolume?.toFixed(2), color: 'text-emerald-500' }
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-5 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-brand-muted mb-1">
                  {label}
                </p>
                <p className={`text-2xl font-bold text-gray-900 dark:text-white tabular-nums ${color || ''}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && settings && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Merchant Settings</h2>
              {settingsMessage && (
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{settingsMessage}</p>
              )}
            </div>
            <div className="p-6 space-y-4 max-w-md">
              {[
                { key: 'spread', label: 'Spread (%)', min: 0, max: 0.1, step: 0.001 },
                { key: 'buyMarkup', label: 'Buy Markup (%)', min: 0, step: 0.001 },
                { key: 'sellMarkup', label: 'Sell Markup (%)', min: 0, step: 0.001 },
                { key: 'priceUpdateInterval', label: 'Price Update Interval (s)', min: 10, max: 300, step: 1 }
              ].map(({ key, label, min, max, step }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                    defaultValue={settings[key]}
                    onBlur={(e) => {
                      const v = key === 'priceUpdateInterval' ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
                      if (!Number.isNaN(v)) updateSettings({ [key]: v });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Orders (Trading)</h2>
              {ordersMessage && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">{ordersMessage}</p>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All types</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="executed">Executed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="text"
                  placeholder="Search by email"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm min-w-[180px]"
                />
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-4 py-2 rounded-xl bg-brand-gold text-black text-sm font-semibold hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {ordersLoading ? (
                <div className="p-12 text-center text-gray-500 dark:text-brand-muted text-sm">
                  Loading orders…
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-brand-muted text-sm">
                  No orders match filters
                </div>
              ) : (
                <>
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-white/5">
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">User</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">Type</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">Amount</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">Price</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">Total</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">Status</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-brand-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                      {orders.map((o) => (
                        <tr key={o._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {o.userId?.email || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                                o.type === 'buy'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-red-500/15 text-red-700 dark:text-red-400'
                              }`}
                            >
                              {o.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 tabular-nums">
                            {o.goldAmount?.toFixed(4)} g
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 tabular-nums">
                            {o.pricePerGram?.toFixed(2)} SAR
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                            {o.totalSAR?.toFixed(2)} SAR
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                                o.status === 'executed'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                  : o.status === 'pending'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                  : o.status === 'cancelled'
                                  ? 'bg-gray-500/15 text-gray-600 dark:text-gray-400'
                                  : 'bg-red-500/15 text-red-700 dark:text-red-400'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {o.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => cancelOrder(o._id)}
                                className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/10">
                      <p className="text-sm text-gray-500 dark:text-brand-muted">
                        Page {pagination.page} of {pagination.pages} · {pagination.total} total
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={pagination.page <= 1}
                          onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/20 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={pagination.page >= pagination.pages}
                          onClick={() => setOrdersPage((p) => p + 1)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/20 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
