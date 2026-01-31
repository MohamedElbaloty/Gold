import React, { useMemo, useState, useContext } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { lang } = useContext(UiContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = location.state?.from?.pathname || searchParams.get('redirect') || '/dashboard';

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'تسجيل الدخول' : 'Sign in to your account',
      email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email address',
      password: lang === 'ar' ? 'كلمة المرور' : 'Password',
      submit: lang === 'ar' ? 'تسجيل الدخول' : 'Sign in',
      submitting: lang === 'ar' ? 'جارٍ تسجيل الدخول…' : 'Signing in...',
      noAccount: lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?",
      register: lang === 'ar' ? 'إنشاء حساب' : 'Register'
    }),
    [lang]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
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
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-5 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {labels.noAccount}{' '}
              <Link to="/register" className="text-brand-gold hover:underline">
                {labels.register}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
