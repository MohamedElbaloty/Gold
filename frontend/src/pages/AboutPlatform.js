import React, { useContext, useMemo } from 'react';
import UiContext from '../context/UiContext';

const AboutPlatform = () => {
  const { lang } = useContext(UiContext);

  const c = useMemo(
    () => ({
      title: lang === 'ar' ? 'عن المنصة' : 'About the Platform',
      subtitle:
        lang === 'ar'
          ? 'منصة ذهب السعودية تربط بين شراء الذهب الفعلي من المتجر وتداول الذهب على أرصدة محفوظة باسم المستخدم.'
          : 'Saudi Gold Platform connects buying physical gold from the store with trading gold on user-reserved holdings.',
      scopeTitle: lang === 'ar' ? 'مجال منصتنا' : 'Our scope',
      scopeBullets:
        lang === 'ar'
          ? [
              'شراء منتجات الذهب (سبائك/عملات/مجوهرات حسب المتاح) عبر المتجر.',
              'تداول الذهب (شراء/بيع) على أرصدة محفوظة للمستخدم داخل المنصة.',
              'محفظة تعرض الرصيد بالجرام والريال، وسجل معاملات للتتبع والمراجعة.',
              'طلب تسليم فعلي (عند توفر رصيد ذهب كافٍ) وفق إجراءات التسليم بالمنصة.'
            ]
          : [
              'Buy gold products (bars/coins/jewellery as available) via the store.',
              'Trade gold (buy/sell) on holdings reserved for the user inside the platform.',
              'A wallet showing balances in grams and SAR with an auditable transaction trail.',
              'Request physical delivery (when eligible) through the platform delivery flow.'
            ],
      govTitle: lang === 'ar' ? 'الحوكمة والتوافق التنظيمي (SGG)' : 'Governance & regulatory alignment (SGG)',
      govText:
        lang === 'ar'
          ? 'تم تصميم المنصة لتكون متوافقة بالكامل مع حوكمة الذهب في السعودية ضمن نطاق عملنا (SGG)، عبر مبادئ الشفافية في التسعير، قابلية المراجعة والتتبع، الضوابط التشغيلية، وحماية المستخدم والبيانات. ويتم تحديث السياسات والإجراءات بما يتوافق مع المتطلبات السعودية ذات العلاقة.'
          : 'The platform is designed to be fully aligned with Saudi gold governance within our operating scope (SGG) through transparent pricing, auditability and traceability, operational controls, and user/data protection. Policies and procedures are maintained and updated to match relevant Saudi requirements.',
      note:
        lang === 'ar'
          ? 'ملاحظة: هذه الصفحة تعريفية وليست استشارة قانونية.'
          : 'Note: This page is informational and not legal advice.'
    }),
    [lang]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 dark:bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-white/70">{c.subtitle}</p>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{c.scopeTitle}</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-white/75">
                {c.scopeBullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-gold shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{c.govTitle}</h2>
              <p className="mt-3 text-sm text-gray-700 dark:text-white/75 leading-relaxed">{c.govText}</p>
              <p className="mt-3 text-xs text-gray-500 dark:text-white/50">{c.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPlatform;

