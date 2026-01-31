import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import UiContext from '../context/UiContext';
import { api } from '../lib/api';
// TradingView news widget temporarily disabled to avoid external script errors.
// import TradingViewNews from '../components/TradingViewNews';
// import WidgetErrorBoundary from '../components/WidgetErrorBoundary';

function isGoldOrSilverNews(article) {
  const text = `${article?.title || ''} ${article?.summary || ''}`.toLowerCase();
  const hasGold =
    text.includes('gold') ||
    text.includes('xau') ||
    text.includes('ذهب') ||
    text.includes('الذهب');
  const hasSilver =
    text.includes('silver') ||
    text.includes('xag') ||
    text.includes('فضة') ||
    text.includes('الفضة');
  const hasPlatinum =
    text.includes('platinum') ||
    text.includes('xpt') ||
    text.includes('بلاتين') ||
    text.includes('البلاتين');

  return (hasGold || hasSilver) && !hasPlatinum;
}

const NewsList = () => {
  const { lang } = useContext(UiContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q = searchParams.get('q') || '';

  const fallbackArticles = useMemo(() => {
    const now = new Date().toISOString();
    if (lang === 'ar') {
      return [
        {
          id: 'fallback-egypt-gold',
          title: 'مستوى قياسي جديد.. أسعار الذهب في مصر اليوم الخميس',
          summary: 'ملخص سريع لتحركات أسعار الذهب وتفاعل الأسواق، مع متابعة تأثيرات الأسعار العالمية على المنطقة.',
          publishedAt: now,
          sourceName: 'محتوى تجريبي'
        },
        {
          id: 'fallback-libreville',
          title: 'مأساة ليبرفيل: قصة سقوط طائرة منتخب زامبيا في المحيط ثم التتويج بكأس أمم أفريقيا بعد 19 عاماً',
          summary: 'قصة إنسانية رياضية عن مأساة كبيرة ثم عودة تاريخية للتتويج بعد سنوات طويلة.',
          publishedAt: now,
          sourceName: 'محتوى تجريبي'
        }
      ];
    }
    return [
      {
        id: 'fallback-egypt-gold',
        title: 'New record level: Gold prices in Egypt today (Thursday)',
        summary: 'A quick snapshot of gold price moves and market reaction, tracking how global prices ripple across the region.',
        publishedAt: now,
        sourceName: 'Demo content'
      },
      {
        id: 'fallback-libreville',
        title: 'Libreville tragedy: Zambia team plane crash, then AFCON glory 19 years later',
        summary: 'A human sports story of a national tragedy followed by a historic comeback years later.',
        publishedAt: now,
        sourceName: 'Demo content'
      }
    ];
  }, [lang]);

  const labels = useMemo(
    () => ({
      title: lang === 'ar' ? 'الأخبار' : 'News',
      tvTitle: lang === 'ar' ? 'أخبار الذهب والفضة (مصدر خارجي)' : 'Gold & Silver news (external source)',
      tvNote:
        lang === 'ar'
          ? 'العناوين من مصدر خارجي وقد تكون بالإنجليزية.'
          : 'Headlines are sourced externally and may be in English.',
      search: lang === 'ar' ? 'بحث في الأخبار' : 'Search news',
      empty: lang === 'ar' ? 'لا توجد أخبار للذهب أو الفضة' : 'No gold/silver news yet'
    }),
    [lang]
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // 1) Try real-time external news feed (Kitco RSS + optional NewsAPI/Mediastack)
        let finalArticles = [];
        try {
          const res = await api.get('/api/news/feed', { params: { lang, limit: 24 } });
          if (!mounted) return;
          const articlesData = res.data?.articles || res.data || [];
          finalArticles = Array.isArray(articlesData) ? articlesData : [];
        } catch (_) {
          // Feed failed (e.g. network) — try internal news below
        }
        // 2) Fallback: if feed returned nothing, try internal stored news (/api/news)
        if (finalArticles.length === 0 && mounted) {
          try {
            const resInternal = await api.get('/api/news', { params: { lang, limit: 24 } });
            const internalData = resInternal.data?.articles || resInternal.data || [];
            if (Array.isArray(internalData) && internalData.length > 0) {
              finalArticles = internalData;
            }
          } catch (_) {}
        }

        // Filter: show only gold + silver (exclude platinum)
        finalArticles = Array.isArray(finalArticles) ? finalArticles.filter(isGoldOrSilverNews) : [];
        if (!mounted) return;
        setArticles(finalArticles.length > 0 ? finalArticles : fallbackArticles);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e.message || (lang === 'ar' ? 'فشل تحميل الأخبار' : 'Failed to load news'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [lang, fallbackArticles]);

  const filteredArticles = useMemo(() => {
    if (!q.trim()) return articles;
    const lower = q.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (a.title || '').toLowerCase().includes(lower) ||
        (a.summary || '').toLowerCase().includes(lower)
    );
  }, [articles, q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{labels.title}</h1>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>
        <div className="w-full md:w-[420px]">
          <input
            value={q}
            onChange={(e) =>
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                const val = e.target.value;
                if (val) next.set('q', val);
                else next.delete('q');
                return next;
              })
            }
            className="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder={labels.search}
          />
        </div>
      </div>

      {/* TradingView news widget disabled for now to avoid external script runtime errors */}

      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-surface p-4">
        <div className="mb-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{labels.tvTitle}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-brand-muted">{labels.tvNote}</div>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-600 dark:text-brand-muted">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-10 text-center text-gray-600 dark:text-brand-muted">{labels.empty}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((a) => {
              const href = a?.sourceUrl || a?.url || '';
              const to = a?.slug || a?._id ? `/news/${a.slug || a._id}` : '';
              const isExternal = Boolean(href) && (a.isExternal || a.sourceUrl || a.url);
              const CardWrapper = isExternal ? 'a' : to ? Link : 'div';
              const cardProps = isExternal
                ? { href, target: '_blank', rel: 'noopener noreferrer' }
                : to
                  ? { to }
                  : {};
              return (
                <CardWrapper
                  key={a._id || a.id || a.sourceUrl || a.url || a.title}
                  {...cardProps}
                  className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-brand-bg/30 overflow-hidden hover:border-brand-gold/60 transition"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 overflow-hidden">
                    {a.coverImage ? (
                      <img
                        src={a.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{a.title}</div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-brand-muted line-clamp-3">{a.summary || ''}</div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-brand-muted">
                      <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ''}</span>
                      {a.sourceName ? (
                        <span>{a.sourceName}</span>
                      ) : (
                        <span>{lang === 'ar' ? 'مشاهدات' : 'Views'}: {a.views ?? 0}</span>
                      )}
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;

