import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Trading = () => {
  const [prices, setPrices] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [goldAmount, setGoldAmount] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const priceInterval = setInterval(fetchPrices, 30000);
    return () => clearInterval(priceInterval);
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([fetchPrices(), fetchWallet()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pricing/current');
      setPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/wallet/balance');
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const amount = parseFloat(goldAmount);
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      const endpoint = tradeType === 'buy' ? '/api/trade/buy' : '/api/trade/sell';
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        goldAmount: amount
      });

      setSuccess(`Order executed successfully! ${tradeType === 'buy' ? 'Bought' : 'Sold'} ${amount}g`);
      setGoldAmount('');
      await fetchWallet();
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!goldAmount || !prices) return 0;
    const amount = parseFloat(goldAmount);
    if (isNaN(amount)) return 0;
    return tradeType === 'buy' 
      ? (amount * prices.buyPriceSAR).toFixed(2)
      : (amount * prices.sellPriceSAR).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Trade Gold</h1>

      {/* Current Prices */}
      {prices && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Prices</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Buy Price</p>
              <p className="text-2xl font-bold text-green-600">
                {prices.buyPriceSAR?.toFixed(2)} SAR/g
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spot Price</p>
              <p className="text-2xl font-bold text-gold-600">
                {prices.spotPriceSAR?.toFixed(2)} SAR/g
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sell Price</p>
              <p className="text-2xl font-bold text-red-600">
                {prices.sellPriceSAR?.toFixed(2)} SAR/g
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance */}
      {wallet && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Gold Balance</p>
              <p className="text-2xl font-bold">{wallet.goldBalance.toFixed(4)} g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SAR Balance</p>
              <p className="text-2xl font-bold">{wallet.sarBalance.toFixed(2)} SAR</p>
            </div>
          </div>
        </div>
      )}

      {/* Trading Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
              tradeType === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Buy Gold
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
              tradeType === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sell Gold
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleTrade}>
          <div className="mb-4">
            <label htmlFor="goldAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Gold Amount (grams)
            </label>
            <input
              id="goldAmount"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-gold-500 focus:border-gold-500"
              placeholder="0.00"
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
            />
          </div>

          {prices && goldAmount && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Price per gram:</span>
                <span className="font-semibold">
                  {tradeType === 'buy' 
                    ? prices.buyPriceSAR.toFixed(2)
                    : prices.sellPriceSAR.toFixed(2)} SAR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="text-xl font-bold">
                  {calculateTotal()} SAR
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !goldAmount}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
              tradeType === 'buy'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Gold`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Trading;
