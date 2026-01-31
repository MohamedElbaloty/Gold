import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

// Shopping cart icon
const CartIcon = ({ className, ariaLabel }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    aria-label={ariaLabel}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

// Chevron down
const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Small flag icons (inline SVG)
const FlagUS = ({ className }) => (
  <svg viewBox="0 0 28 20" className={className} aria-hidden="true">
    <rect width="28" height="20" rx="3" fill="#fff" />
    <g clipPath="url(#usClip)">
      <rect width="28" height="20" fill="#fff" />
      <g fill="#B22234">
        <rect y="0" width="28" height="2" />
        <rect y="4" width="28" height="2" />
        <rect y="8" width="28" height="2" />
        <rect y="12" width="28" height="2" />
        <rect y="16" width="28" height="2" />
      </g>
      <rect width="12" height="10" fill="#3C3B6E" />
      <g fill="#fff" opacity="0.9">
        <circle cx="2" cy="2" r="0.55" />
        <circle cx="4.3" cy="2" r="0.55" />
        <circle cx="6.6" cy="2" r="0.55" />
        <circle cx="8.9" cy="2" r="0.55" />
        <circle cx="11.2" cy="2" r="0.55" />
        <circle cx="3.1" cy="4" r="0.55" />
        <circle cx="5.4" cy="4" r="0.55" />
        <circle cx="7.7" cy="4" r="0.55" />
        <circle cx="10" cy="4" r="0.55" />
        <circle cx="2" cy="6" r="0.55" />
        <circle cx="4.3" cy="6" r="0.55" />
        <circle cx="6.6" cy="6" r="0.55" />
        <circle cx="8.9" cy="6" r="0.55" />
        <circle cx="11.2" cy="6" r="0.55" />
      </g>
    </g>
    <defs>
      <clipPath id="usClip">
        <rect width="28" height="20" rx="3" />
      </clipPath>
    </defs>
  </svg>
);

const FlagSA = ({ className }) => (
  <svg viewBox="0 0 28 20" className={className} aria-hidden="true">
    <rect width="28" height="20" rx="3" fill="#0B6B3A" />
    {/* simple sword line (no script) */}
    <path d="M7 14h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    <path d="M21 14l2-1v2z" fill="#fff" opacity="0.9" />
  </svg>
);

// Trading icon
const TradeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 7h7v7" />
  </svg>
);

const Navbar = () => {
  const { user, logout, accountMode, setAccountMode } = useContext(AuthContext);
  const { lang, setLang, theme, toggleTheme } = useContext(UiContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [balanceMenuOpen, setBalanceMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [balances, setBalances] = useState({ demo: null, real: null });
  const userMenuRef = useRef(null);
  const balanceMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const labels = useMemo(
    () => ({
      store: lang === 'ar' ? 'المتجر' : 'Store',
      cart: lang === 'ar' ? 'السلة' : 'Cart',
      home: lang === 'ar' ? 'الرئيسية' : 'Home',
      newsTop: lang === 'ar' ? 'الأخبار' : 'News',
      pricesTop: lang === 'ar' ? 'حاسبة الأسعار' : 'Price Calculator',
      dashboard: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      trading: lang === 'ar' ? 'تداول' : 'Trading',
      wallet: lang === 'ar' ? 'المحفظة' : 'Wallet',
      orders: lang === 'ar' ? 'الطلبات' : 'Orders',
      delivery: lang === 'ar' ? 'التوصيل' : 'Delivery',
      admin: lang === 'ar' ? 'إدارة' : 'Admin',
      logout: lang === 'ar' ? 'خروج' : 'Logout',
      profile: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
      changePassword: lang === 'ar' ? 'تغيير كلمة المرور' : 'Change password',
      dark: lang === 'ar' ? 'الوضع الليلي' : 'Dark mode',
      language: lang === 'ar' ? 'Eng / Ar' : 'Eng / Ar',
      demo: lang === 'ar' ? 'تجريبي' : 'Demo',
      real: lang === 'ar' ? 'حقيقي' : 'Real',
      balanceNow: lang === 'ar' ? 'رصيدك الآن' : 'Balance',
      platform: lang === 'ar' ? 'المنصة' : 'Platform'
    }),
    [lang]
  );

  const displayName = user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email) : '';

  useEffect(() => {
    if (!user || !accountMode) {
      setBalances({ demo: null, real: null });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [demoRes, realRes] = await Promise.all([
          api.get('/api/wallet/balance', { params: { mode: 'demo' } }).catch(() => ({ data: null })),
          api.get('/api/wallet/balance', { params: { mode: 'real' } }).catch(() => ({ data: null }))
        ]);
        if (cancelled) return;
        setBalances({
          demo: demoRes.data?.sarBalance != null ? demoRes.data.sarBalance : null,
          real: realRes.data?.sarBalance != null ? realRes.data.sarBalance : null
        });
      } catch {
        if (!cancelled) setBalances({ demo: null, real: null });
      }
    })();
    return () => { cancelled = true; };
  }, [user, accountMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (balanceMenuRef.current && !balanceMenuRef.current.contains(e.target)) setBalanceMenuOpen(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const formatBalance = (val) => {
    if (val == null) return '—';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SAR';
  };

  const currentBalance = accountMode === 'demo' ? balances.demo : accountMode === 'real' ? balances.real : null;

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-brand-surface/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex sm:hidden items-center justify-center h-10 w-10 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white"
              aria-label="Menu"
            >
              <span className="text-lg">≡</span>
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-gold2" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {lang === 'ar' ? 'ذهب السعودية' : 'Saudi Gold'}
                </div>
                <div className="text-xs text-gray-500 dark:text-brand-muted">{labels.platform}</div>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-2 ml-3">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-sm ${
                  isActive('/') ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-brand-muted hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {labels.home}
              </Link>
              <Link
                to="/store"
                className={`px-3 py-2 rounded-xl text-sm ${
                  isActive('/store') ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-brand-muted hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {labels.store}
              </Link>
              <Link
                to="/news"
                className={`px-3 py-2 rounded-xl text-sm ${
                  isActive('/news') ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-brand-muted hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {labels.newsTop}
              </Link>
              <Link
                to="/prices"
                className={`px-3 py-2 rounded-xl text-sm ${
                  isActive('/prices') ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-brand-muted hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {labels.pricesTop}
              </Link>
              <Link
                to="/cart"
                className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${
                  isActive('/cart') ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-brand-muted hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
                title={labels.cart}
                aria-label={labels.cart}
              >
                <CartIcon className="w-5 h-5" ariaLabel={labels.cart} />
              </Link>
              {user && (
                <>
                  {(user.role === 'admin' || user.role === 'merchant') && (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-xl text-sm ${
                        isActive('/admin')
                          ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-brand-muted hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {labels.admin}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                aria-label="Language"
                title="Language"
              >
                <div className="flex flex-col leading-[1.05] text-xs font-semibold">
                  <div className={`flex items-center gap-2 ${lang === 'en' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60'}`}>
                    <FlagUS className="h-4 w-6 rounded-sm" />
                    <span>Eng</span>
                  </div>
                  <div className={`mt-0.5 flex items-center gap-2 ${lang === 'ar' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60'}`}>
                    <FlagSA className="h-4 w-6 rounded-sm" />
                    <span>Ar</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg overflow-hidden z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition ${
                      lang === 'en'
                        ? 'bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white'
                    }`}
                  >
                    <FlagUS className="h-4 w-6 rounded-sm" />
                    <span>Eng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('ar');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition ${
                      lang === 'ar'
                        ? 'bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white'
                    }`}
                  >
                    <FlagSA className="h-4 w-6 rounded-sm" />
                    <span>Ar</span>
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              aria-label={labels.dark}
              title={labels.dark}
            >
              {theme === 'dark' ? '☾' : '☀'}
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-white/10">
              {user ? (
                <>
                  {/* Primary CTA: Trading */}
                  <Link
                    to="/trading"
                    className={`group inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition ${
                      isActive('/trading')
                        ? 'bg-gradient-to-r from-brand-gold to-brand-gold2 text-black shadow-md ring-1 ring-black/5'
                        : 'bg-gradient-to-r from-brand-gold to-brand-gold2 text-black hover:shadow-md hover:brightness-[1.02] ring-1 ring-black/5'
                    }`}
                    aria-label={labels.trading}
                    title={labels.trading}
                  >
                    <TradeIcon className="w-4 h-4" />
                    <span className="hidden md:inline">{labels.trading}</span>
                    <span className="md:hidden">{labels.trading}</span>
                  </Link>

                  {/* Balance + Demo/Real switcher */}
                  {accountMode && (
                    <div className="relative" ref={balanceMenuRef}>
                      <button
                        type="button"
                        onClick={() => setBalanceMenuOpen((o) => !o)}
                        className={`flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-xl border transition ${
                          balanceMenuOpen
                            ? 'border-brand-gold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200'
                            : accountMode === 'demo'
                            ? 'border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200'
                            : 'border-green-300 dark:border-green-500/50 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200'
                        }`}
                      >
                        <span className="text-xs font-semibold truncate">
                          {accountMode === 'demo' ? labels.demo : labels.real}
                        </span>
                        <span className="text-xs font-medium truncate">
                          {currentBalance != null ? formatBalance(currentBalance) : '—'}
                        </span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${balanceMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {balanceMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg overflow-hidden z-50">
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-brand-muted border-b border-gray-100 dark:border-white/5">
                            {labels.balanceNow}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMode('demo');
                              setBalanceMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition ${
                              accountMode === 'demo'
                                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white'
                            }`}
                          >
                            <span className="text-sm font-medium">{labels.demo}</span>
                            <span className="text-sm tabular-nums">{formatBalance(balances.demo)}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMode('real');
                              setBalanceMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition ${
                              accountMode === 'real'
                                ? 'bg-green-50 dark:bg-green-500/20 text-green-800 dark:text-green-200'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white'
                            }`}
                          >
                            <span className="text-sm font-medium">{labels.real}</span>
                            <span className="text-sm tabular-nums">{formatBalance(balances.real)}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white min-w-0 max-w-[180px]"
                    >
                      <span className="text-sm font-medium truncate">{displayName || user.email}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-1 w-52 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-lg overflow-hidden z-50">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-3 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          {labels.dashboard}
                        </Link>
                        <div className="border-t border-gray-100 dark:border-white/5" />
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-3 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          {labels.profile}
                        </Link>
                        <Link
                          to="/profile/change-password"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-3 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          {labels.changePassword}
                        </Link>
                        <div className="border-t border-gray-100 dark:border-white/5">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium"
                          >
                            {labels.logout}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center"
                  >
                    {lang === 'ar' ? 'دخول' : 'Login'}
                  </Link>
                  <Link
                    to="/register"
                    className="h-10 px-3 rounded-xl bg-brand-gold text-black text-sm font-medium flex items-center"
                  >
                    {lang === 'ar' ? 'تسجيل' : 'Register'}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3">
            <div className="mt-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-2">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {labels.home}
              </Link>
              <Link
                to="/store"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {labels.store}
              </Link>
              <Link
                to="/news"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {labels.newsTop}
              </Link>
              <Link
                to="/prices"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {labels.pricesTop}
              </Link>
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <CartIcon className="w-5 h-5" ariaLabel={labels.cart} />
                {labels.cart}
              </Link>
              {user && (
                <>
                  <Link
                    to="/trading"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-gold to-brand-gold2 text-black ring-1 ring-black/5"
                  >
                    <TradeIcon className="w-4 h-4" />
                    {labels.trading}
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {labels.dashboard}
                  </Link>
                  {(user.role === 'admin' || user.role === 'merchant') && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      {labels.admin}
                    </Link>
                  )}
                </>
              )}

              {user && accountMode && (
                <div className="px-3 py-2 border-t border-gray-200 dark:border-white/10 space-y-1">
                  <div className="text-xs font-medium text-gray-500 dark:text-brand-muted">{labels.balanceNow}</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountMode('demo')}
                      className={`flex-1 px-3 py-2 rounded-xl text-left text-sm ${
                        accountMode === 'demo'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white'
                      }`}
                    >
                      <div>{labels.demo}</div>
                      <div className="text-xs tabular-nums">{formatBalance(balances.demo)}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountMode('real')}
                      className={`flex-1 px-3 py-2 rounded-xl text-left text-sm ${
                        accountMode === 'real'
                          ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-200 font-medium'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white'
                      }`}
                    >
                      <div>{labels.real}</div>
                      <div className="text-xs tabular-nums">{formatBalance(balances.real)}</div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="inline-flex items-center gap-2">
                  {lang === 'ar' ? <FlagUS className="h-4 w-6 rounded-sm" /> : <FlagSA className="h-4 w-6 rounded-sm" />}
                  <span>{lang === 'ar' ? 'Eng' : 'Ar'}</span>
                </span>
              </button>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {labels.profile}
                  </Link>
                  <Link
                    to="/profile/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {labels.changePassword}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="w-full mt-2 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
                  >
                    {labels.logout}
                  </button>
                </>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="h-10 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white flex items-center justify-center"
                  >
                    {lang === 'ar' ? 'دخول' : 'Login'}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="h-10 rounded-xl bg-brand-gold text-black text-sm font-medium flex items-center justify-center"
                  >
                    {lang === 'ar' ? 'تسجيل' : 'Register'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
