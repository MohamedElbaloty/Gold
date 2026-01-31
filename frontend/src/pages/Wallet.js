import React, { useState, useEffect, useContext } from 'react';
import { api } from '../lib/api';
import AuthContext from '../context/AuthContext';

const Wallet = () => {
  const { accountMode } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [depositMethod, setDepositMethod] = useState('mada');
  const [depositRef, setDepositRef] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawRef, setWithdrawRef] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  useEffect(() => {
    if (!accountMode) {
      setLoading(false);
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when page or accountMode changes
  }, [page, accountMode]);

  const fetchData = async () => {
    if (!accountMode) return;
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/api/wallet/balance', { params: { mode: accountMode } }),
        api.get('/api/wallet/transactions', { params: { page, limit: 20, mode: accountMode } })
      ]);
      setWallet(walletRes.data);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setDepositError('Please enter a valid amount in SAR');
      return;
    }

    try {
      setDepositLoading(true);
      const res = await api.post('/api/wallet/deposit', {
        amount,
        method: depositMethod,
        reference: depositRef,
        mode: accountMode
      });
      setDepositSuccess('Deposit successful (demo). Balance updated.');
      setDepositAmount('');
      setDepositRef('');
      setWallet(res.data.wallet);
      // refresh transactions to show deposit entry
      await fetchData();
    } catch (error) {
      console.error('Deposit error:', error);
      setDepositError(error.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid amount in SAR');
      return;
    }

    try {
      setWithdrawLoading(true);
      const res = await api.post('/api/wallet/withdraw', {
        amount,
        method: withdrawMethod,
        reference: withdrawRef,
        mode: accountMode
      });
      setWithdrawSuccess('Withdrawal successful (demo). Balance updated.');
      setWithdrawAmount('');
      setWithdrawRef('');
      setWallet(res.data.wallet);
      await fetchData();
    } catch (error) {
      console.error('Withdraw error:', error);
      setWithdrawError(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading && !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Wallet</h1>

      {/* Balance Cards + Demo Deposit */}
      {wallet && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Gold Balance</h2>
            <p className="text-3xl font-bold text-gold-600">
              {wallet.goldBalance.toFixed(4)} g
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Silver Balance</h2>
            <p className="text-3xl font-bold text-gray-700">
              {(wallet.silverBalance || 0).toFixed(4)} g
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">SAR Balance</h2>
            <p className="text-3xl font-bold text-green-600">
              {wallet.sarBalance.toFixed(2)} SAR
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Gold Bought</h2>
            <p className="text-3xl font-bold text-blue-600">
              {wallet.totalGoldBought.toFixed(4)} g
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              {accountMode === 'demo' ? 'Demo account' : 'Deposit (SAR)'}
            </h2>
            {accountMode === 'demo' ? (
              <p className="text-xs text-gray-500">
                Demo balance is virtual. Switch to real account to deposit or withdraw funds.
              </p>
            ) : (
              <>
            <p className="text-xs text-gray-500 mb-3">
              Add funds via Mada / card / bank transfer (demo simulation).
            </p>
            {depositError && (
              <div className="mb-2 text-xs text-red-600">{depositError}</div>
            )}
            {depositSuccess && (
              <div className="mb-2 text-xs text-green-600">{depositSuccess}</div>
            )}
            <form onSubmit={handleDeposit} className="space-y-2">
              <div className="text-xs text-gray-600">Method</div>
              <div className="flex flex-wrap gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setDepositMethod('mada')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    depositMethod === 'mada'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Mada
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod('bank_transfer')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    depositMethod === 'bank_transfer'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod('stcpay')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    depositMethod === 'stcpay'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  STC Pay
                </button>
              </div>
              <input
                type="number"
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount in SAR"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-gold-500 focus:border-gold-500"
              />
              <input
                type="text"
                value={depositRef}
                onChange={(e) => setDepositRef(e.target.value)}
                placeholder="Reference (last 4 digits / transfer ref)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-gold-500 focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={depositLoading}
                className="w-full py-2 rounded-lg bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {depositLoading ? 'Processing...' : 'Add Balance'}
              </button>
            </form>
              </>
            )}
          </div>
          {accountMode === 'real' && (
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Withdraw (SAR)</h2>
            <p className="text-xs text-gray-500 mb-3">
              Withdraw to bank / Mada (demo simulation).
            </p>
            {withdrawError && (
              <div className="mb-2 text-xs text-red-600">{withdrawError}</div>
            )}
            {withdrawSuccess && (
              <div className="mb-2 text-xs text-green-600">{withdrawSuccess}</div>
            )}
            <form onSubmit={handleWithdraw} className="space-y-2">
              <div className="text-xs text-gray-600">Method</div>
              <div className="flex flex-wrap gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('bank_transfer')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    withdrawMethod === 'bank_transfer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('mada_refund')}
                  className={`px-2 py-1 rounded-full text-xs ${
                    withdrawMethod === 'mada_refund'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Mada Refund
                </button>
              </div>
              <input
                type="number"
                min="1"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount in SAR"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-gold-500 focus:border-gold-500"
              />
              <input
                type="text"
                value={withdrawRef}
                onChange={(e) => setWithdrawRef(e.target.value)}
                placeholder="Destination IBAN / card ref (demo)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-gold-500 focus:border-gold-500"
              />
              <button
                type="submit"
                disabled={withdrawLoading}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </form>
          </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SAR Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Gram
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.type === 'buy'
                            ? 'bg-green-100 text-green-800'
                            : tx.type === 'sell'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(tx.metalType || 'gold').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.goldAmount.toFixed(4)} g
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.sarAmount.toFixed(2)} SAR
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.pricePerGram.toFixed(2)} SAR
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
