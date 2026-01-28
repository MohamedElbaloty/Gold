import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, settingsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard'),
        axios.get('http://localhost:5000/api/admin/settings'),
        axios.get('http://localhost:5000/api/admin/orders?limit=10')
      ]);
      setStats(statsRes.data.stats);
      setSettings(settingsRes.data);
      setOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    try {
      const response = await axios.put('http://localhost:5000/api/admin/settings', updates);
      setSettings(response.data.settings);
      alert('Settings updated successfully');
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'overview' ? 'bg-gold-600 text-white' : 'bg-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'settings' ? 'bg-gold-600 text-white' : 'bg-gray-200'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'orders' ? 'bg-gold-600 text-white' : 'bg-gray-200'
          }`}
        >
          Orders
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Gold Bought</h3>
            <p className="text-3xl font-bold text-gold-600">{stats.totalGoldBought.toFixed(2)}g</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Gold Sold</h3>
            <p className="text-3xl font-bold text-red-600">{stats.totalGoldSold.toFixed(2)}g</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Net Exposure</h3>
            <p className="text-3xl font-bold">{stats.netExposure.toFixed(2)}g</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Volume (SAR)</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalSARVolume.toFixed(2)}</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Merchant Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spread (%)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                max="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue={settings.spread}
                onBlur={(e) => updateSettings({ spread: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buy Markup (%)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue={settings.buyMarkup}
                onBlur={(e) => updateSettings({ buyMarkup: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sell Markup (%)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue={settings.sellMarkup}
                onBlur={(e) => updateSettings({ sellMarkup: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Update Interval (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue={settings.priceUpdateInterval}
                onBlur={(e) => updateSettings({ priceUpdateInterval: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.userId?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.goldAmount.toFixed(4)}g</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.pricePerGram.toFixed(2)} SAR</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{order.totalSAR.toFixed(2)} SAR</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'executed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
