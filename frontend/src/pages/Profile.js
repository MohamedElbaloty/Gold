import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

const HeaderIcon = ({ children }) => (
  <div className="h-10 w-10 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
    {children}
  </div>
);

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const [, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  const isRtl = lang === 'ar';
  const labels = {
    title: isRtl ? 'الملف الشخصي' : 'Profile',
    firstName: isRtl ? 'الاسم الأول' : 'First name',
    lastName: isRtl ? 'اسم العائلة' : 'Last name',
    phone: isRtl ? 'الجوال' : 'Phone',
    email: isRtl ? 'البريد' : 'Email',
    save: isRtl ? 'حفظ' : 'Save',
    changePassword: isRtl ? 'تغيير كلمة المرور' : 'Change password',
    back: isRtl ? 'رجوع' : 'Back'
  };

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || ''
    });
    setProfile(user);
    setLoading(false);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await api.put('/api/user/profile', form);
      setMessage(isRtl ? 'تم التحديث' : 'Profile updated');
    } catch (err) {
      setMessage(err?.response?.data?.message || (isRtl ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-gray-500 dark:text-brand-muted">{isRtl ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    );
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
                {isRtl ? 'حدّث بياناتك الأساسية بسهولة.' : 'Update your basic details in one place.'}
              </p>
            </div>
            <HeaderIcon>
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                />
              </svg>
            </HeaderIcon>
          </div>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg shadow-gray-200/50 dark:shadow-black/40 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.email}</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-brand-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.firstName}</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.lastName}</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-brand-muted mb-1">{labels.phone}</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-gray-900 dark:text-white"
          />
        </div>
        {message && (
          <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-4 rounded-xl bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : labels.save}
          </button>
          <Link
            to="/profile/change-password"
            className="h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-medium inline-flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <svg className="w-4 h-4 text-gray-500 dark:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a5 5 0 1 0-4 8l2 2h2v2h2v2h3v-3l-7-7Z"
              />
            </svg>
            {labels.changePassword}
          </Link>
          <Link
            to="/dashboard"
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

export default Profile;
