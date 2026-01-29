import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';

/**
 * Modal shown when user is logged in but has not chosen account mode (demo vs real).
 * Blocks trading/wallet flows until they choose.
 */
const AccountModeChooser = () => {
  const { user, accountMode, setAccountMode } = useContext(AuthContext);
  const { lang } = useContext(UiContext);

  if (!user || accountMode !== null) return null;

  const isRtl = lang === 'ar';
  const labels = {
    title: isRtl ? 'اختر نوع الحساب' : 'Choose account type',
    subtitle: isRtl
      ? 'يمكنك التداول بحساب تجريبي (رصيد افتراضي) أو بحساب حقيقي يُموّل بالإيداعات التي تقوم بها في المنصة.'
      : 'Trade with a demo account (virtual balance) or a real account funded by your deposits on the platform.',
    demo: isRtl ? 'حساب تجريبي (ديمو)' : 'Demo account',
    demoDesc: isRtl ? 'رصيد افتراضي 100,000 ر.س — للتجربة دون مخاطر' : 'Virtual 100,000 SAR — practice with no risk',
    real: isRtl ? 'حساب حقيقي' : 'Real account',
    realDesc: isRtl ? 'تُموّل برصيدك الحقيقي عبر الإيداع في المنصة' : 'Funded by your real deposits on the platform'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-mode-title"
    >
      <div
        className="bg-white dark:bg-brand-surface rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <h2 id="account-mode-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {labels.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-brand-muted mb-6">{labels.subtitle}</p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setAccountMode('demo')}
            className="w-full flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-xl border-2 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-left transition"
          >
            <span className="font-semibold text-amber-800 dark:text-amber-200">{labels.demo}</span>
            <span className="text-sm text-amber-700 dark:text-amber-300/90">{labels.demoDesc}</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountMode('real')}
            className="w-full flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-xl border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 text-left transition"
          >
            <span className="font-semibold text-green-800 dark:text-green-200">{labels.real}</span>
            <span className="text-sm text-green-700 dark:text-green-300/90">{labels.realDesc}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModeChooser;
