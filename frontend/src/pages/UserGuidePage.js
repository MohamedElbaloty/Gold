import React, { useContext, useMemo } from 'react';
import UiContext from '../context/UiContext';

const UserGuidePage = () => {
  const { lang } = useContext(UiContext);

  const c = useMemo(
    () => ({
      title: lang === 'ar' ? 'دليل المستخدم' : 'User guide',
      subtitle:
        lang === 'ar'
          ? 'دليل سريع لاستخدام المنصة: التسجيل، المحفظة، التداول، المتجر، والتسليم.'
          : 'A quick guide to using the platform: registration, wallet, trading, store, and delivery.',
      steps:
        lang === 'ar'
          ? [
              {
                h: '1) إنشاء حساب وتسجيل الدخول',
                p: 'ابدأ من صفحة التسجيل، ثم سجّل الدخول للوصول للوحة التحكم والمحفظة والتداول.'
              },
              {
                h: '2) اختيار وضع الحساب (تجريبي/فعلي)',
                p: 'من أعلى المنصة يمكنك اختيار الوضع التجريبي للتجربة أو الفعلي للعمليات الفعلية حسب إعدادات حسابك.'
              },
              {
                h: '3) المحفظة وسجل العمليات',
                p: 'تابع رصيد الذهب بالجرام ورصيد SAR، وراجع سجل المعاملات لمعرفة كل حركة تمت على حسابك.'
              },
              {
                h: '4) التداول (شراء/بيع الذهب)',
                p: 'من صفحة التداول يمكنك فتح/إغلاق صفقات الشراء والبيع بأسعار مرتبطة بالسوق مع فروقات السعر (Spread) وهوامش التسعير.'
              },
              {
                h: '5) المتجر والطلبات',
                p: 'من المتجر يمكنك تصفح المنتجات وإضافتها للسلة وإتمام الطلب. ستجد سجل الطلبات في صفحة الطلبات.'
              },
              {
                h: '6) التسليم الفعلي',
                p: 'إذا كان لديك رصيد ذهب كافٍ، يمكنك إنشاء طلب تسليم ومتابعة الحالة ورقم التتبع عند توفره.'
              }
            ]
          : [
              {
                h: '1) Create an account & sign in',
                p: 'Register first, then sign in to access your dashboard, wallet, and trading.'
              },
              {
                h: '2) Choose account mode (Demo/Real)',
                p: 'From the top navigation you can use Demo for learning or Real for actual operations depending on your account settings.'
              },
              {
                h: '3) Wallet & activity history',
                p: 'Track your gold balance (grams), SAR balance, and review the activity history for every operation.'
              },
              {
                h: '4) Trading (buy/sell)',
                p: 'Use the Trading page to open/close buy and sell operations with pricing linked to the market including spread/markups.'
              },
              {
                h: '5) Store & orders',
                p: 'Browse products, add to cart, and checkout. Your order history is available in the Orders page.'
              },
              {
                h: '6) Physical delivery',
                p: 'If eligible and you have enough gold balance, you can create a delivery request and track status when available.'
              }
            ],
      tip:
        lang === 'ar'
          ? 'نصيحة: لو واجهتك مشكلة، استخدم زر الدعم في أسفل الصفحة للتواصل مباشرة عبر البريد.'
          : 'Tip: If you face an issue, use the Help button in the footer to contact support by email.'
    }),
    [lang]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 dark:bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-white/70">{c.subtitle}</p>

          <div className="mt-8 space-y-3">
            {c.steps.map((s) => (
              <div key={s.h} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-5">
                <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{s.h}</div>
                <div className="mt-2 text-sm text-gray-700 dark:text-white/75 leading-relaxed">{s.p}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-gray-500 dark:text-white/50">{c.tip}</p>
        </div>
      </div>
    </section>
  );
};

export default UserGuidePage;

