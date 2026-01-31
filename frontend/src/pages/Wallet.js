import React, { useMemo, useState, useEffect, useContext } from 'react';
import { api } from '../lib/api';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';

const StatIcon = ({ children, className = '' }) => (
  <div
    className={`h-10 w-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center ${className}`}
  >
    {children}
  </div>
);

const Wallet = () => {
  const { accountMode } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
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

  const labels = useMemo(
    () => ({
      loading: lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…',
      title: lang === 'ar' ? 'المحفظة' : 'Wallet',
      goldBalance: lang === 'ar' ? 'رصيد الذهب' : 'Gold Balance',
      silverBalance: lang === 'ar' ? 'رصيد الفضة' : 'Silver Balance',
      sarBalance: lang === 'ar' ? 'الرصيد بالريال' : 'SAR Balance',
      totalGoldBought: lang === 'ar' ? 'إجمالي الذهب المُشترى' : 'Total Gold Bought',
      demoAccount: lang === 'ar' ? 'حساب تجريبي' : 'Demo account',
      depositSar: lang === 'ar' ? 'إيداع (ريال)' : 'Deposit (SAR)',
      demoHint:
        lang === 'ar'
          ? 'رصيد التجريبي افتراضي. بدّل إلى الحساب الفعلي للإيداع أو السحب.'
          : 'Demo balance is virtual. Switch to real account to deposit or withdraw funds.',
      depositHint:
        lang === 'ar'
          ? 'أضف رصيد عبر مدى / بطاقة / تحويل بنكي (محاكاة تجريبية).'
          : 'Add funds via Mada / card / bank transfer (demo simulation).',
      method: lang === 'ar' ? 'الطريقة' : 'Method',
      amountPlaceholder: lang === 'ar' ? 'المبلغ بالريال' : 'Amount in SAR',
      referencePlaceholder: lang === 'ar' ? 'المرجع (آخر 4 أرقام / رقم التحويل)' : 'Reference (last 4 digits / transfer ref)',
      processing: lang === 'ar' ? 'جارٍ التنفيذ…' : 'Processing...',
      addBalance: lang === 'ar' ? 'إضافة رصيد' : 'Add Balance',
      withdrawSar: lang === 'ar' ? 'سحب (ريال)' : 'Withdraw (SAR)',
      withdrawHint:
        lang === 'ar'
          ? 'سحب إلى البنك / مدى (محاكاة تجريبية).'
          : 'Withdraw to bank / Mada (demo simulation).',
      withdrawRefPlaceholder:
        lang === 'ar' ? 'الآيبان / مرجع البطاقة (تجريبي)' : 'Destination IBAN / card ref (demo)',
      requestWithdrawal: lang === 'ar' ? 'طلب سحب' : 'Request Withdrawal',
      txTitle: lang === 'ar' ? 'سجل العمليات' : 'Transaction History',
      txEmpty: lang === 'ar' ? 'لا توجد عمليات حتى الآن' : 'No transactions yet',
      date: lang === 'ar' ? 'التاريخ' : 'Date',
      type: lang === 'ar' ? 'النوع' : 'Type',
      metal: lang === 'ar' ? 'المعدن' : 'Metal',
      amount: lang === 'ar' ? 'الكمية' : 'Amount',
      sarAmount: lang === 'ar' ? 'المبلغ (ريال)' : 'SAR Amount',
      pricePerGram: lang === 'ar' ? 'السعر/جرام' : 'Price/Gram',
      status: lang === 'ar' ? 'الحالة' : 'Status',
      buy: lang === 'ar' ? 'شراء' : 'BUY',
      sell: lang === 'ar' ? 'بيع' : 'SELL',
      deposit: lang === 'ar' ? 'إيداع' : 'DEPOSIT',
      withdrawal: lang === 'ar' ? 'سحب' : 'WITHDRAWAL',
      completed: lang === 'ar' ? 'مكتمل' : 'completed',
      pending: lang === 'ar' ? 'قيد التنفيذ' : 'pending',
      failed: lang === 'ar' ? 'فشل' : 'failed',
      cancelled: lang === 'ar' ? 'ملغي' : 'cancelled',
      sar: lang === 'ar' ? 'ر.س' : 'SAR'
    }),
    [lang]
  );

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
      setDepositError(lang === 'ar' ? 'فضلاً أدخل مبلغ صحيح بالريال' : 'Please enter a valid amount in SAR');
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
      setDepositSuccess(lang === 'ar' ? 'تم إنشاء طلب الإيداع بنجاح.' : 'Deposit request created successfully.');
      setDepositAmount('');
      setDepositRef('');
      setWallet(res.data.wallet);
      // refresh transactions to show deposit entry
      await fetchData();
    } catch (error) {
      console.error('Deposit error:', error);
      setDepositError(error.response?.data?.message || (lang === 'ar' ? 'تعذر تنفيذ الإيداع' : 'Deposit failed'));
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
      setWithdrawError(lang === 'ar' ? 'فضلاً أدخل مبلغ صحيح بالريال' : 'Please enter a valid amount in SAR');
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
      setWithdrawSuccess(lang === 'ar' ? 'تم إنشاء طلب السحب بنجاح.' : 'Withdrawal request created successfully.');
      setWithdrawAmount('');
      setWithdrawRef('');
      setWallet(res.data.wallet);
      await fetchData();
    } catch (error) {
      console.error('Withdraw error:', error);
      setWithdrawError(error.response?.data?.message || (lang === 'ar' ? 'تعذر تنفيذ السحب' : 'Withdrawal failed'));
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading && !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700 dark:text-white/80">{labels.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg">
      {/* Header */}
      <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-gray-900 via-[#1a1a1f] to-gray-900 dark:from-black dark:via-[#0d0d0f] dark:to-black border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,0.14),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold2 mb-5" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{labels.title}</h1>
              <p className="mt-2 text-sm text-white/70">
                {lang === 'ar'
                  ? 'تابع أرصدتك، نفّذ إيداع/سحب، وراجع سجل العمليات.'
                  : 'Track balances, deposit/withdraw funds, and review transaction history.'}
              </p>
            </div>
            {accountMode ? (
              <div
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm font-semibold ${
                  accountMode === 'demo'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span>
                  {accountMode === 'demo'
                    ? lang === 'ar'
                      ? 'حساب تجريبي'
                      : 'Demo'
                    : lang === 'ar'
                      ? 'حساب فعلي'
                      : 'Real'}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 relative z-10">
        {/* Balance Cards */}
        {wallet && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.goldBalance}</div>
                    <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                      {wallet.goldBalance.toFixed(4)} <span className="text-sm font-semibold text-gray-500">g</span>
                    </div>
                  </div>
                  <StatIcon className="bg-brand-gold/10 border-brand-gold/30">
                    <span className="text-brand-gold font-bold">Au</span>
                  </StatIcon>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.silverBalance}</div>
                    <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                      {(wallet.silverBalance || 0).toFixed(4)} <span className="text-sm font-semibold text-gray-500">g</span>
                    </div>
                  </div>
                  <StatIcon className="bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/15">
                    <span className="text-gray-700 dark:text-white/80 font-bold">Ag</span>
                  </StatIcon>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.sarBalance}</div>
                    <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {wallet.sarBalance.toFixed(2)} <span className="text-sm font-semibold text-gray-500">{labels.sar}</span>
                    </div>
                  </div>
                  <StatIcon className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">﷼</span>
                  </StatIcon>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-brand-muted">{labels.totalGoldBought}</div>
                    <div className="mt-1 text-2xl font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">
                      {wallet.totalGoldBought.toFixed(4)} <span className="text-sm font-semibold text-gray-500">g</span>
                    </div>
                  </div>
                  <StatIcon className="bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30">
                    <span className="text-sky-700 dark:text-sky-300 font-bold">Σ</span>
                  </StatIcon>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deposit + Withdraw */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {accountMode === 'demo' ? labels.demoAccount : labels.depositSar}
              </div>
              <div className="text-xs text-gray-500 dark:text-brand-muted">{labels.sar}</div>
            </div>
            <div className="p-6">
              {accountMode === 'demo' ? (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                  {labels.demoHint}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-brand-muted mb-4">{labels.depositHint}</p>

                  {depositError ? (
                    <div className="mb-4 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      {depositError}
                    </div>
                  ) : null}
                  {depositSuccess ? (
                    <div className="mb-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                      {depositSuccess}
                    </div>
                  ) : null}

                  <form onSubmit={handleDeposit} className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-brand-muted mb-2">{labels.method}</div>
                      <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-2">
                        <button
                          type="button"
                          onClick={() => setDepositMethod('mada')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            depositMethod === 'mada'
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-700 dark:text-white/80 hover:bg-white/70 dark:hover:bg-white/10'
                          }`}
                        >
                          Mada
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositMethod('bank_transfer')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            depositMethod === 'bank_transfer'
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-700 dark:text-white/80 hover:bg-white/70 dark:hover:bg-white/10'
                          }`}
                        >
                          {lang === 'ar' ? 'تحويل بنكي' : 'Bank transfer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositMethod('stcpay')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            depositMethod === 'stcpay'
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-700 dark:text-white/80 hover:bg-white/70 dark:hover:bg-white/10'
                          }`}
                        >
                          STC Pay
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={labels.amountPlaceholder}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                      />
                      <input
                        type="text"
                        value={depositRef}
                        onChange={(e) => setDepositRef(e.target.value)}
                        placeholder={labels.referencePlaceholder}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={depositLoading}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold2 text-black text-sm font-semibold hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {depositLoading ? labels.processing : labels.addBalance}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{labels.withdrawSar}</div>
              <div className="text-xs text-gray-500 dark:text-brand-muted">{labels.sar}</div>
            </div>
            <div className="p-6">
              {accountMode !== 'real' ? (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 text-sm text-gray-700 dark:text-white/70">
                  {lang === 'ar' ? 'السحب متاح فقط في الحساب الفعلي.' : 'Withdrawals are available only in real accounts.'}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-brand-muted mb-4">{labels.withdrawHint}</p>

                  {withdrawError ? (
                    <div className="mb-4 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      {withdrawError}
                    </div>
                  ) : null}
                  {withdrawSuccess ? (
                    <div className="mb-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                      {withdrawSuccess}
                    </div>
                  ) : null}

                  <form onSubmit={handleWithdraw} className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-brand-muted mb-2">{labels.method}</div>
                      <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('bank_transfer')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            withdrawMethod === 'bank_transfer'
                              ? 'bg-sky-600 text-white'
                              : 'text-gray-700 dark:text-white/80 hover:bg-white/70 dark:hover:bg-white/10'
                          }`}
                        >
                          {lang === 'ar' ? 'تحويل بنكي' : 'Bank transfer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('mada_refund')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            withdrawMethod === 'mada_refund'
                              ? 'bg-sky-600 text-white'
                              : 'text-gray-700 dark:text-white/80 hover:bg-white/70 dark:hover:bg-white/10'
                          }`}
                        >
                          {lang === 'ar' ? 'استرجاع مدى' : 'Mada refund'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder={labels.amountPlaceholder}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                      />
                      <input
                        type="text"
                        value={withdrawRef}
                        onChange={(e) => setWithdrawRef(e.target.value)}
                        placeholder={labels.withdrawRefPlaceholder}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={withdrawLoading}
                      className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {withdrawLoading ? labels.processing : labels.requestWithdrawal}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{labels.txTitle}</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-brand-muted">{labels.txEmpty}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.date}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.type}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.metal}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.amount}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.sarAmount}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.pricePerGram}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-brand-muted uppercase tracking-wider">
                      {labels.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {transactions.map((tx) => {
                    const grams = typeof tx?.goldAmount === 'number' ? tx.goldAmount : null;
                    const sarAmount = typeof tx?.sarAmount === 'number' ? tx.sarAmount : null;
                    const pricePerGram = typeof tx?.pricePerGram === 'number' ? tx.pricePerGram : null;
                    const metalType = tx?.metalType ? String(tx.metalType).toUpperCase() : '—';
                    return (
                      <tr key={tx._id} className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')
                            : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              tx.type === 'buy'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                                : tx.type === 'sell'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white/70'
                            }`}
                          >
                            {tx.type === 'buy'
                              ? labels.buy
                              : tx.type === 'sell'
                                ? labels.sell
                                : tx.type === 'deposit'
                                  ? labels.deposit
                                  : tx.type === 'withdrawal'
                                    ? labels.withdrawal
                                    : String(tx.type || '').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90">{metalType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90 tabular-nums">
                          {grams == null ? '—' : `${grams.toFixed(4)} g`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90 tabular-nums">
                          {sarAmount == null ? '—' : `${sarAmount.toFixed(2)} ${labels.sar}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90 tabular-nums">
                          {pricePerGram == null ? '—' : `${pricePerGram.toFixed(2)} ${labels.sar}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              tx.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                                : tx.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200'
                            }`}
                          >
                            {tx.status === 'completed'
                              ? labels.completed
                              : tx.status === 'pending'
                                ? labels.pending
                                : tx.status === 'failed'
                                  ? labels.failed
                                  : tx.status === 'cancelled'
                                    ? labels.cancelled
                                    : String(tx.status || '')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
