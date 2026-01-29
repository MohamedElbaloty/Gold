import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

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
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{labels.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-6">
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
            className="h-10 px-4 rounded-xl bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (isRtl ? 'جاري التحديث...' : 'Updating...') : labels.submit}
          </button>
          <Link
            to="/profile"
            className="h-10 px-4 rounded-xl text-gray-600 dark:text-brand-muted hover:text-gray-900 dark:hover:text-white inline-flex items-center"
          >
            {labels.back}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
