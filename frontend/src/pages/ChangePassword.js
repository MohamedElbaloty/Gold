import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

const HeaderIcon = ({ children }) => (
  <div className="h-10 w-10 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
    {children}
  </div>
);

const ChangePassword = () => {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isRtl = lang === 'ar';
  const labels = {
    title: isRtl ? 'تغيير كلمة المرور' : 'Change password',
    current: isRtl ? 'كلمة المرور الحالية' : 'Current password',
    new: isRtl ? 'كلمة المرور الجديدة' : 'New password',
    confirm: isRtl ? 'تأكيد كلمة المرور' : 'Confirm password',
    submit: isRtl ? 'تحديث' : 'Update',
    back: isRtl ? 'رجوع للملف الشخصي' : 'Back to profile'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: isRtl ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: isRtl ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      setMessage({ type: 'success', text: isRtl ? 'تم تغيير كلمة المرور' : 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || (isRtl ? 'فشل التحديث' : 'Update failed')
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-bg" dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-gray-900 via-[#1a1a1f] to-gray-900 dark:from-black dark:via-[#0d0d0f] dark:to-black border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,162,39,0.12),transparent)]" />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold2 mb-5" />
              <h1 className="text-3xl font-bold text-white tracking-tight">{labels.title}</h1>
              <p className="mt-2 text-sm text-white/70">
                {isRtl ? 'لأمان حسابك، اختر كلمة مرور قوية.' : 'For account security, choose a strong password.'}
              </p>
            </div>
            <HeaderIcon>
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7a4 4 0 1 1 8 0v4M6 11h12v10H6V11Z" />
              </svg>
            </HeaderIcon>
          </div>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.current}</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.new}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.confirm}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-gray-900 dark:text-white"
          />
        </div>
        {message.text && (
          <p className={`text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {message.text}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? (isRtl ? 'جاري التحديث...' : 'Updating...') : labels.submit}
          </button>
          <Link
            to="/profile"
            className="h-10 px-4 rounded-xl text-gray-600 dark:text-brand-muted hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {labels.back}
          </Link>
        </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
