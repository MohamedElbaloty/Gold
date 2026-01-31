import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import UiContext from '../context/UiContext';

const Footer = () => {
  const { lang } = useContext(UiContext);

  const labels = useMemo(
    () => ({
      about: lang === 'ar' ? 'عن ذهب السعودية' : 'About Saudi Gold',
      userGuide: lang === 'ar' ? 'دليل المستخدم' : 'User Guide',
      terms: lang === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions',
      aml: lang === 'ar' ? 'AML' : 'AML',
      faq: lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
      connect: lang === 'ar' ? 'تواصل معنا' : 'Connect us',
      help: lang === 'ar' ? 'مساعدة' : 'Help',
      allRights: lang === 'ar' ? 'جميع الحقوق محفوظة لذهب السعودية' : 'All rights reserved to Saudi Gold',
      poweredBy: lang === 'ar' ? 'مدعوم من' : 'Powered by',
      scrollToTop: lang === 'ar' ? 'العودة للأعلى' : 'Scroll to top',
      brandAr: 'السبائك',
      brandEn: 'ALSABAEK',
      brandTaglineAr: 'ذهب السعودية للمجوهرات الذهبية',
      brandTaglineEn: 'Saudi Gold for Gold Jewelry'
    }),
    [lang]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl font-bold text-brand-gold">{lang === 'ar' ? labels.brandAr : labels.brandEn}</div>
              <div className="text-sm text-white/80">DAR ALSABAACK</div>
            </div>
            <div className="text-sm text-white/70">
              {lang === 'ar' ? labels.brandTaglineAr : labels.brandTaglineEn}
            </div>
          </div>

          {/* Navigation Links - Left */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/news" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {lang === 'ar' ? 'الأخبار' : 'News'}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {labels.about}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {labels.userGuide}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {labels.terms}
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Links - Right */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">{lang === 'ar' ? 'معلومات' : 'Information'}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {labels.aml}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {labels.faq}
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-gold transition">
                  {labels.connect}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Help Button */}
            <button
              onClick={() => {
                // Handle help button click
                window.open('mailto:support@darsabaek.com', '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{labels.help}</span>
            </button>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-gold transition"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-gold transition"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-gold transition"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-gold transition"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-white/70 text-center md:text-right">
              © 2026 {labels.allRights}
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-gold text-black hover:opacity-90 transition"
              aria-label={labels.scrollToTop}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
