import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';

const NewsArticlePage = () => {
  const { lang } = useContext(UiContext);
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const labels = useMemo(
    () => ({
      back: lang === 'ar' ? 'رجوع' : 'Back',
      news: lang === 'ar' ? 'الأخبار' : 'News'
    }),
    [lang]
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/news/${slugOrId}`);
        if (!mounted) return;
        setArticle(res.data.article);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || 'Failed to load article');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slugOrId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface text-sm text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
        >
          {labels.back}
        </button>
        <Link to="/news" className="text-sm text-brand-gold hover:opacity-90">
          {labels.news}
        </Link>
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : !article ? (
          <div className="p-10 text-center text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'غير موجود' : 'Not found'}</div>
        ) : (
          <div>
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10" />
            <div className="p-6">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{article.title}</div>
              <div className="mt-2 text-xs text-gray-500 dark:text-brand-muted">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : ''} •{' '}
                {lang === 'ar' ? 'مشاهدات' : 'Views'}: {article.views ?? 0}
              </div>
              {article.summary ? <div className="mt-4 text-sm text-gray-700 dark:text-white/80">{article.summary}</div> : null}
              <div className="mt-6 text-sm leading-7 text-gray-800 dark:text-white/90 whitespace-pre-wrap">{article.content || ''}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsArticlePage;

