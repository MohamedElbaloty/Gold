import React, { useContext, useMemo } from 'react';
import UiContext from '../context/UiContext';

const TermsPage = () => {
  const { lang } = useContext(UiContext);

  const c = useMemo(
    () => ({
      title: lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions',
      updated: lang === 'ar' ? 'آخر تحديث: يناير 2026' : 'Last updated: Jan 2026',
      intro:
        lang === 'ar'
          ? 'تنظم هذه الشروط استخدامك لمنصة ذهب السعودية وخدماتها (المتجر، التداول، المحفظة، التسليم). باستخدامك للمنصة فأنت توافق على هذه الشروط.'
          : 'These terms govern your use of the Saudi Gold Platform and its services (store, trading, wallet, delivery). By using the platform you agree to these terms.',
      items:
        lang === 'ar'
          ? [
              {
                h: '1) أهلية الاستخدام والحساب',
                p: 'يجب أن تكون لديك الأهلية النظامية لاستخدام الخدمات. أنت مسؤول عن بيانات الدخول وسلامة حسابك.'
              },
              {
                h: '2) نطاق الخدمة',
                p: 'قد توفر المنصة شراء منتجات عبر المتجر، وتداول الذهب على أرصدة محفوظة، ومحفظة وسجل عمليات، وخدمة التسليم الفعلي عند توفر الشروط.'
              },
              {
                h: '3) التسعير وفروقات السعر',
                p: 'الأسعار مرتبطة بالسوق وقد تتضمن فروقات السعر (Spread) وهوامش تسعير. قد تتغير الأسعار بشكل لحظي حسب تحديثات السوق.'
              },
              {
                h: '4) المخاطر',
                p: 'التداول ينطوي على مخاطر تقلب الأسعار. أنت تتحمل مسؤولية قراراتك الاستثمارية ولا تضمن المنصة تحقيق أرباح.'
              },
              {
                h: '5) أوامر الشراء/البيع والتنفيذ',
                p: 'قد تتأثر عمليات التنفيذ بتوفر السيولة/الأسعار/الأنظمة. تُسجل العمليات في سجل معاملات، وقد تخضع المراجعة للتأكد من سلامة التنفيذ.'
              },
              {
                h: '6) التسليم الفعلي',
                p: 'تخضع طلبات التسليم لشروط الأهلية (مثل توفر الرصيد، بيانات العنوان، ورسوم الشحن إن وجدت). قد تختلف أوقات التسليم حسب المدينة ومزود الخدمة.'
              },
              {
                h: '7) الاستخدام المقبول',
                p: 'يُحظر إساءة استخدام المنصة أو محاولة اختراقها أو إدخال بيانات مضللة أو استخدام الخدمات بشكل يخالف المتطلبات السعودية ذات العلاقة.'
              },
              {
                h: '8) الملكية الفكرية',
                p: 'جميع العلامات والنصوص والتصاميم والبرمجيات مملوكة للمنصة أو لمالكيها ولا يجوز نسخها أو إعادة استخدامها دون إذن.'
              },
              {
                h: '9) إنهاء/تعليق الحساب',
                p: 'يجوز للمنصة تعليق أو إنهاء الحساب عند وجود مؤشرات إساءة استخدام أو مخالفة للشروط أو متطلبات الحوكمة ضمن نطاق العمل.'
              },
              {
                h: '10) التغييرات على الشروط',
                p: 'قد نقوم بتحديث هذه الشروط من وقت لآخر. استمرار استخدامك للمنصة يعني قبول النسخة المحدثة.'
              },
              {
                h: '11) التواصل',
                p: 'للاستفسارات، تواصل معنا عبر: support@saudigold.sa'
              }
            ]
          : [
              {
                h: '1) Eligibility & accounts',
                p: 'You must be legally eligible to use the services. You are responsible for your login credentials and account security.'
              },
              {
                h: '2) Service scope',
                p: 'The platform may provide store purchases, trading on reserved holdings, a wallet with activity history, and physical delivery when eligible.'
              },
              {
                h: '3) Pricing & spread',
                p: 'Prices are linked to the market and may include spread and pricing markups. Prices may change in real time.'
              },
              {
                h: '4) Risk disclosure',
                p: 'Trading involves price volatility risk. You are responsible for your decisions and the platform does not guarantee profits.'
              },
              {
                h: '5) Order execution',
                p: 'Execution can be affected by pricing, system conditions, and availability. Operations are recorded and may be reviewed for integrity.'
              },
              {
                h: '6) Physical delivery',
                p: 'Delivery requests depend on eligibility (e.g., sufficient balance, correct address, and possible shipping fees). Timelines may vary by city and carrier.'
              },
              {
                h: '7) Acceptable use',
                p: 'You must not misuse the platform, attempt unauthorized access, submit misleading data, or use services in ways that conflict with relevant Saudi requirements.'
              },
              {
                h: '8) Intellectual property',
                p: 'All trademarks, content, designs, and software are owned by the platform or their respective owners and may not be reused without permission.'
              },
              {
                h: '9) Suspension/termination',
                p: 'We may suspend or terminate accounts in case of misuse indicators, violations of these terms, or governance requirements within scope.'
              },
              {
                h: '10) Changes to terms',
                p: 'We may update these terms from time to time. Continued use means acceptance of the updated version.'
              },
              {
                h: '11) Contact',
                p: 'For inquiries, contact: support@saudigold.sa'
              }
            ]
    }),
    [lang]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 dark:bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
            <div className="text-xs text-gray-500 dark:text-white/50">{c.updated}</div>
          </div>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-white/70">{c.intro}</p>

          <div className="mt-8 space-y-3">
            {c.items.map((it) => (
              <div key={it.h} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-5">
                <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{it.h}</div>
                <div className="mt-2 text-sm text-gray-700 dark:text-white/75 leading-relaxed">{it.p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;

