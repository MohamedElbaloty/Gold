import React, { useContext, useMemo } from 'react';
import UiContext from '../context/UiContext';

const GovernancePage = () => {
  const { lang } = useContext(UiContext);

  const c = useMemo(
    () => ({
      title: lang === 'ar' ? 'حوكمة الذهب (SGG)' : 'Gold Governance (SGG)',
      subtitle:
        lang === 'ar'
          ? 'SGG اختصار داخلي لسياسات وإجراءات حوكمة الذهب لدينا بما يتوافق مع المتطلبات السعودية ذات العلاقة ضمن نطاق عمل المنصة.'
          : 'SGG is our internal shorthand for gold-governance policies and procedures aligned with relevant Saudi requirements within the platform scope.',
      sections:
        lang === 'ar'
          ? [
              {
                h: 'شفافية التسعير',
                p: 'نعرض أسعار الشراء/البيع بوضوح مع بيان أن فروقات السعر (Spread) وهوامش التسعير تدخل ضمن آلية التسعير بالمنصة.'
              },
              {
                h: 'قابلية التتبع والمراجعة',
                p: 'كل عملية شراء/بيع/تحويل تُسجل في سجل معاملات قابل للمراجعة مع طوابع زمنية وبيانات مرجعية لدعم التدقيق والمتابعة.'
              },
              {
                h: 'حماية المستخدم والبيانات',
                p: 'نطبق ضوابط وصول مبنية على الأدوار، وتجزئة الصلاحيات، وممارسات حماية بيانات لضمان سرية الحسابات والعمليات.'
              },
              {
                h: 'ضوابط تشغيلية للتسليم الفعلي',
                p: 'طلبات التسليم الفعلي تخضع لشروط أهلية (مثل توفر رصيد ذهب كافٍ) وخطوات متابعة حالة الطلب ورقم التتبع عند توفره.'
              },
              {
                h: 'إدارة المخاطر والامتثال',
                p: 'نراجع الأنشطة غير الاعتيادية ونطبق سياسات استخدام عادلة، وتحديثات دورية للإجراءات لتواكب المتطلبات السعودية.'
              }
            ]
          : [
              {
                h: 'Pricing transparency',
                p: 'Buy/sell prices are presented clearly, including that spread and pricing markups are part of the platform pricing mechanism.'
              },
              {
                h: 'Auditability & traceability',
                p: 'Every buy/sell/transfer is recorded in an auditable transaction trail with timestamps and reference data to support monitoring and review.'
              },
              {
                h: 'User & data protection',
                p: 'We apply role-based access controls, permission segmentation, and data-protection practices to secure accounts and operations.'
              },
              {
                h: 'Operational controls for delivery',
                p: 'Physical delivery requests follow eligibility rules (e.g., sufficient gold balance) and provide request status tracking when available.'
              },
              {
                h: 'Risk & compliance operations',
                p: 'We review unusual activity, enforce fair-use policies, and update procedures on an ongoing basis to match Saudi requirements.'
              }
            ],
      note:
        lang === 'ar'
          ? 'تنبيه: قد تختلف المتطلبات بحسب طبيعة الترخيص/النشاط. هذه الصفحة تعريفية وليست وثيقة تنظيمية.'
          : 'Notice: Requirements may vary by license/activity. This page is informational and not a regulatory document.'
    }),
    [lang]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 dark:bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{c.title}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-white/70">{c.subtitle}</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {c.sections.map((s) => (
              <div key={s.h} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/5 p-5">
                <div className="text-base font-bold text-gray-900 dark:text-white">{s.h}</div>
                <div className="mt-2 text-sm text-gray-700 dark:text-white/75 leading-relaxed">{s.p}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-gray-500 dark:text-white/50">{c.note}</p>
        </div>
      </div>
    </section>
  );
};

export default GovernancePage;

