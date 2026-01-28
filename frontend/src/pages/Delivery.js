import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Delivery = () => {
  const [requests, setRequests] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    goldAmount: '',
    weight: '10g',
    deliveryAddress: {
      street: '',
      city: '',
      postalCode: ''
    },
    contactPhone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, walletRes] = await Promise.all([
        axios.get('http://localhost:5000/api/delivery/my-requests'),
        axios.get('http://localhost:5000/api/wallet/balance')
      ]);
      setRequests(requestsRes.data);
      setWallet(walletRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/delivery/request', formData);
      setSuccess('Delivery request created successfully');
      setShowForm(false);
      setFormData({
        goldAmount: '',
        weight: '10g',
        deliveryAddress: {
          street: '',
          city: '',
          postalCode: ''
        },
        contactPhone: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create delivery request');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        deliveryAddress: {
          ...formData.deliveryAddress,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Physical Delivery</h1>
        {wallet && wallet.goldBalance > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancel' : 'Request Delivery'}
          </button>
        )}
      </div>

      {wallet && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg">
            Available Gold: <span className="font-bold text-gold-600">{wallet.goldBalance.toFixed(4)} g</span>
          </p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">New Delivery Request</h2>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gold Amount (grams)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="goldAmount"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.goldAmount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Option
              </label>
              <select
                name="weight"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.weight}
                onChange={handleChange}
              >
                <option value="10g">10g</option>
                <option value="50g">50g</option>
                <option value="100g">100g</option>
                <option value="1kg">1kg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="deliveryAddress.street"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.deliveryAddress.street}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="deliveryAddress.city"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.deliveryAddress.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="deliveryAddress.postalCode"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.deliveryAddress.postalCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2 px-4 rounded-lg"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Delivery Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No delivery requests yet</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{request.goldAmount}g - {request.weight}</p>
                    <p className="text-sm text-gray-600">
                      {request.deliveryAddress.city}, {request.deliveryAddress.street}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    request.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    request.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                {request.trackingNumber && (
                  <p className="text-sm text-gray-600">Tracking: {request.trackingNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Delivery;
