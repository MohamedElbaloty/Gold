import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const [profile, setProfile] = useState(null);
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
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{labels.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-6">
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
            className="h-10 px-4 rounded-xl bg-brand-gold text-black font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : labels.save}
          </button>
          <Link
            to="/profile/change-password"
            className="h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-medium inline-flex items-center hover:bg-gray-50 dark:hover:bg-white/5"
          >
            {labels.changePassword}
          </Link>
          <Link
            to="/dashboard"
            className="h-10 px-4 rounded-xl text-gray-600 dark:text-brand-muted hover:text-gray-900 dark:hover:text-white inline-flex items-center"
          >
            {labels.back}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Profile;
