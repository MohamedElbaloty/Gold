import React, { useContext, useMemo } from 'react';
import UiContext from '../context/UiContext';

const FaqPage = () => {
  const { lang } = useContext(UiContext);

  const c = useMemo(
    () => ({
      title: lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
      subtitle:
        lang === 'ar'
          ? 'إجابات مختصرة على أكثر الأسئلة تكرارًا حول الشراء والتداول والمحفظة والتسليم.'
          : 'Quick answers to the most common questions about buying, trading, wallet, and delivery.',
      items:
        lang === 'ar'
          ? [
              {
                q: 'هل المنصة للشراء فقط أم للتداول أيضًا؟',
                a: 'المنصة تجمع بين متجر لشراء منتجات الذهب، وبين التداول (شراء/بيع) على أرصدة محفوظة للمستخدم داخل المنصة.'
              },
              {
                q: 'كيف يتم تحديد أسعار الشراء والبيع؟',
                a: 'الأسعار مرتبطة بالسعر العالمي مع احتساب فروقات السعر (Spread) وهوامش التسعير حسب إعدادات التاجر/الإدارة داخل المنصة.'
              },
              {
                q: 'هل أستطيع رؤية رصيدي بالجرام والريال؟',
                a: 'نعم، صفحة المحفظة تعرض رصيد الذهب بالجرام ورصيد SAR وسجل العمليات.'
              },
              {
                q: 'ما الفرق بين الوضع التجريبي والفعلي؟',
                a: 'الوضع التجريبي مخصص للتجربة والتعلم داخل المنصة، بينما الوضع الفعلي يعكس عملياتك الفعلية حسب صلاحيات/إعدادات الحساب.'
              },
              {
                q: 'هل يمكنني طلب تسليم فعلي للذهب؟',
                a: 'نعم، عند توفر رصيد ذهب كافٍ يمكنك إنشاء طلب تسليم، ومتابعة حالته ورقم التتبع إن توفر.'
              },
              {
                q: 'هل يوجد سجل معاملات للتدقيق؟',
                a: 'كل العمليات تُسجل في سجل معاملات يدعم المتابعة والمراجعة.'
              },
              {
                q: 'هل المنصة متوافقة مع حوكمة الذهب بالسعودية؟',
                a: 'المنصة مصممة ضمن نطاق عملها لتتوافق مع متطلبات حوكمة الذهب ذات العلاقة في السعودية (SGG) مع تحديثات مستمرة للإجراءات.'
              }
            ]
          : [
              {
                q: 'Is this platform for buying only or also for trading?',
                a: 'It combines a store for buying gold products and a trading flow (buy/sell) on holdings reserved for the user inside the platform.'
              },
              {
                q: 'How are buy and sell prices calculated?',
                a: 'Prices are linked to global spot pricing with spread and pricing markups based on merchant/admin settings within the platform.'
              },
              {
                q: 'Can I view my balance in grams and SAR?',
                a: 'Yes. The wallet shows your gold balance (grams), SAR balance, and an operations history.'
              },
              {
                q: 'What is the difference between Demo and Real modes?',
                a: 'Demo is for learning/testing inside the platform. Real reflects your actual operations depending on your account permissions and settings.'
              },
              {
                q: 'Can I request physical delivery?',
                a: 'Yes. If you are eligible and have sufficient gold balance, you can create a delivery request and track its status when available.'
              },
              {
                q: 'Is there an auditable trail for transactions?',
                a: 'All operations are recorded in an auditable transaction trail for monitoring and review.'
              },
              {
                q: 'Is the platform aligned with Saudi gold governance?',
                a: 'Within its scope, the platform is designed to align with relevant Saudi gold governance requirements (SGG) and is maintained through ongoing policy updates.'
              }
            ]
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
            {c.items.map((it) => (
              <details
                key={it.q}
                className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-4 open:bg-white dark:open:bg-white/5"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{it.q}</span>
                  <span className="text-gray-500 dark:text-white/60 group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <p className="mt-3 text-sm text-gray-700 dark:text-white/75 leading-relaxed">{it.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqPage;

