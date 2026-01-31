import React, { useContext, useMemo } from 'react';
import UiContext from '../context/UiContext';

const ContactPage = () => {
  const { lang } = useContext(UiContext);

  const c = useMemo(
    () => ({
      title: lang === 'ar' ? 'تواصل معنا' : 'Contact us',
      subtitle:
        lang === 'ar'
          ? 'يسعدنا دعمك في الشراء والتداول والتسليم. اختر طريقة التواصل المناسبة.'
          : 'We are happy to support you across buying, trading, and delivery. Choose a contact method.',
      cards:
        lang === 'ar'
          ? [
              { h: 'البريد الإلكتروني', v: 'support@saudigold.sa', a: 'mailto:support@saudigold.sa' },
              { h: 'ساعات العمل', v: 'الأحد - الخميس: 9:00 ص إلى 6:00 م (بتوقيت السعودية)', a: null },
              { h: 'الاستفسارات التجارية', v: 'partners@saudigold.sa', a: 'mailto:partners@saudigold.sa' }
            ]
          : [
              { h: 'Email', v: 'support@saudigold.sa', a: 'mailto:support@saudigold.sa' },
              { h: 'Business hours', v: 'Sun–Thu: 9:00 AM to 6:00 PM (KSA time)', a: null },
              { h: 'Business inquiries', v: 'partners@saudigold.sa', a: 'mailto:partners@saudigold.sa' }
            ],
      note:
        lang === 'ar'
          ? 'للأمان: لا تشارك كلمة المرور أو رمز الدخول مع أي شخص.'
          : 'Security note: Never share your password or access codes with anyone.'
    }),
    [lang]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 dark:bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-white/70">{c.subtitle}</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {c.cards.map((x) => (
              <div key={x.h} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-5">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{x.h}</div>
                {x.a ? (
                  <a className="mt-2 block text-sm text-emerald-700 dark:text-emerald-300 underline" href={x.a}>
                    {x.v}
                  </a>
                ) : (
                  <div className="mt-2 text-sm text-gray-700 dark:text-white/75">{x.v}</div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-gray-500 dark:text-white/50">{c.note}</p>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;

