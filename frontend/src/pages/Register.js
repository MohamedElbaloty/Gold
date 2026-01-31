import React, { useMemo, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const navigate = useNavigate();

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'إنشاء حساب' : 'Create your account',
      subtitle:
        lang === 'ar'
          ? 'سجّل بياناتك للبدء في شراء وتداول الذهب.'
          : 'Create an account to start buying and trading gold.',
      firstName: lang === 'ar' ? 'الاسم الأول' : 'First name',
      lastName: lang === 'ar' ? 'اسم العائلة' : 'Last name',
      email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
      phone: lang === 'ar' ? 'رقم الجوال (اختياري)' : 'Phone (optional)',
      password: lang === 'ar' ? 'كلمة المرور' : 'Password',
      confirmPassword: lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password',
      passwordHint:
        lang === 'ar' ? 'على الأقل 6 أحرف.' : 'At least 6 characters.',
      submit: lang === 'ar' ? 'إنشاء الحساب' : 'Register',
      submitting: lang === 'ar' ? 'جاري إنشاء الحساب…' : 'Creating account…',
      haveAccount: lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?',
      signIn: lang === 'ar' ? 'تسجيل الدخول' : 'Sign in',
      errors: {
        passwordMismatch: lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
        passwordTooShort: lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
      }
    }),
    [lang]
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(labels.errors.passwordMismatch);
      return;
    }

    if (formData.password.length < 6) {
      setError(labels.errors.passwordTooShort);
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-brand-bg py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold2" aria-hidden="true" />
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{labels.title}</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-white/70">{labels.subtitle}</p>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-5 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">
                  {labels.firstName}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">
                  {labels.lastName}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">
                {labels.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">
                {labels.phone}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">
                {labels.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-white/50">{labels.passwordHint}</div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-600 dark:text-white/70 mb-1">
                {labels.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-black bg-brand-gold hover:opacity-95 focus:ring-2 focus:ring-brand-gold/50 focus:ring-offset-2 dark:focus:ring-offset-brand-bg disabled:opacity-50"
            >
              {loading ? labels.submitting : labels.submit}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-white/70">
              {labels.haveAccount}{' '}
              <Link to="/login" className="text-brand-gold hover:underline">
                {labels.signIn}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
