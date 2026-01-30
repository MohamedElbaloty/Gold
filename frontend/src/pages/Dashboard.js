import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { accountMode } = useContext(AuthContext);
  const [prices, setPrices] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Price Ticker */}
      {prices && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Gold Prices</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Spot Price (SAR/g)</p>
              <p className="text-2xl font-bold text-gold-600">
                {prices.spotPriceSAR?.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Buy Price (SAR/g)</p>
              <p className="text-2xl font-bold text-green-600">
                {prices.buyPriceSAR?.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Sell Price (SAR/g)</p>
              <p className="text-2xl font-bold text-red-600">
                {prices.sellPriceSAR?.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-500">
                {new Date(prices.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Summary */}
      {wallet && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Gold Balance</h2>
            <p className="text-4xl font-bold text-gold-600 mb-2">
              {wallet.goldBalance.toFixed(4)} g
            </p>
            <p className="text-sm text-gray-600">
              ≈ {((wallet.goldBalance * (prices?.buyPriceSAR || 0)).toFixed(2))} SAR
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">SAR Balance</h2>
            <p className="text-4xl font-bold text-green-600 mb-2">
              {wallet.sarBalance.toFixed(2)} SAR
            </p>
            <p className="text-sm text-gray-600">Available for trading</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/trading"
          className="bg-gold-600 hover:bg-gold-700 text-white rounded-lg shadow-md p-6 text-center transition"
        >
          <h3 className="text-xl font-semibold mb-2">Trade Gold</h3>
          <p className="text-sm">Buy or sell gold at live prices</p>
        </Link>
        <Link
          to="/wallet"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 text-center transition"
        >
          <h3 className="text-xl font-semibold mb-2">View Wallet</h3>
          <p className="text-sm">Check balance and transaction history</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
