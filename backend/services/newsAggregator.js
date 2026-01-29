/**
 * News aggregator: fetches real gold/precious metals news from NewsAPI.org and Kitco RSS.
 * Same type of sources that gold/news sites like daralsabaek use - real, updated news.
 */

const axios = require('axios');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Gold-Platform-News/1.0' }
});

const KITCO_RSS_URL = 'https://www.kitco.com/news/category/news/rss';
const MINING_RSS_URL = 'https://www.mining.com/feed/';
const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';
const MEDIASTACK_BASE = 'https://api.mediastack.com/v1/news';

/**
 * Normalize external article to same shape as our NewsArticle (title, summary, coverImage, publishedAt, sourceUrl).
 */
function normalizeArticle(item) {
  return {
    _id: item.id,
    title: item.title || '',
    summary: item.summary || item.description || '',
    content: item.content || item.summary || '',
    coverImage: item.coverImage || item.image || '',
    publishedAt: item.publishedAt,
    sourceUrl: item.sourceUrl || item.url || '',
    sourceName: item.sourceName || '',
    isExternal: true,
    views: 0
  };
}

/**
 * Fetch from NewsAPI.org (gold + precious metals).
 * For Arabic we focus on Arabic keywords حول الذهب والفضة.
 * Requires NEWSAPI_API_KEY in .env.
 */
async function fetchFromNewsAPI(lang = 'ar', limit = 20) {
  const apiKey = process.env.NEWSAPI_API_KEY;
  if (!apiKey) return [];

  const language = lang === 'ar' ? 'ar' : 'en';
  // Stronger focus on gold & silver markets in both languages
  const query =
    language === 'ar'
      ? 'ذهب OR الذهب OR اسعار الذهب OR الفضة OR اسعار الفضة OR سبائك الذهب OR سبائك الفضة OR سوق الذهب OR سوق الفضة'
      : 'gold price OR silver price OR gold market OR silver market OR bullion';
  try {
    const { data } = await axios.get(NEWSAPI_BASE, {
      params: {
        q: query,
        language,
        sortBy: 'publishedAt',
        pageSize: Math.min(limit, 100),
        apiKey
      },
      timeout: 10000
    });
    if (data.status !== 'ok' || !Array.isArray(data.articles)) return [];
    return data.articles.map((a, i) => ({
      id: `newsapi-${i}-${a.publishedAt}`,
      title: a.title,
      summary: a.description || '',
      content: a.content || a.description || '',
      coverImage: a.urlToImage || '',
      publishedAt: a.publishedAt,
      sourceUrl: a.url,
      sourceName: a.source?.name || 'News'
    }));
  } catch (err) {
    console.error('NewsAPI fetch error:', err.message);
    return [];
  }
}

/**
 * Fetch from mediastack (global news, supports Arabic language filter).
 * Optional: requires MEDIASTACK_API_KEY in .env.
 */
async function fetchFromMediastack(lang = 'ar', limit = 20) {
  const apiKey = process.env.MEDIASTACK_API_KEY;
  if (!apiKey) return [];

  const language = lang === 'ar' ? 'ar' : 'en';
  const keywords = language === 'ar' ? 'ذهب' : 'gold';

  try {
    const { data } = await axios.get(MEDIASTACK_BASE, {
      params: {
        access_key: apiKey,
        languages: language,
        keywords,
        limit: Math.min(limit, 100),
        sort: 'published_desc'
      },
      timeout: 10000
    });

    if (!data || !Array.isArray(data.data)) return [];

    return data.data.map((a, i) => ({
      id: `mediastack-${i}-${a.published_at}`,
      title: a.title,
      summary: a.description || '',
      content: a.description || '',
      coverImage: a.image || '',
      publishedAt: a.published_at,
      sourceUrl: a.url,
      sourceName: a.source || 'News'
    }));
  } catch (err) {
    console.error('Mediastack fetch error:', err.message);
    return [];
  }
}

/**
 * Fetch from any RSS URL (generic helper).
 */
async function fetchFromRss(url, sourceName, limit = 20) {
  try {
    const feed = await parser.parseURL(url);
    if (!feed || !Array.isArray(feed.items)) return [];
    return feed.items.slice(0, limit).map((item, i) => {
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      const image = item.enclosure?.url || item.contentSnippet?.match(/https?:\/\/[^\s]+/)?.[0] || '';
      return {
        id: `${sourceName}-${i}-${pubDate}`,
        title: item.title || '',
        summary: item.contentSnippet || item.content || '',
        content: item.content || item.contentSnippet || '',
        coverImage: image,
        publishedAt: pubDate,
        sourceUrl: item.link || '',
        sourceName
      };
    });
  } catch (err) {
    console.error(`${sourceName} RSS fetch error:`, err.message);
    return [];
  }
}

async function fetchFromKitcoRss(limit = 20) {
  return fetchFromRss(KITCO_RSS_URL, 'Kitco News', limit);
}

async function fetchFromMiningRss(limit = 20) {
  return fetchFromRss(MINING_RSS_URL, 'Mining.com', limit);
}

/**
 * Merge and sort by publishedAt descending, remove duplicates by title similarity.
 */
function mergeAndSort(arrays) {
  const seen = new Set();
  const merged = arrays.flat().filter((a) => {
    const key = (a.title || '').trim().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return merged;
}

/**
 * Get aggregated external news (NewsAPI + Kitco). Use from route: GET /api/news/feed
 */
async function getAggregatedNews(options = {}) {
  const { lang = 'ar', limit = 24 } = options;
  const perSource = Math.max(5, Math.ceil(limit / 3));
  let newsApiItems = [];
  let kitcoItems = [];
  let miningItems = [];
  let mediastackItems = [];

  if (lang === 'ar') {
    // عربي فقط: مصادر تدعم العربية (Mediastack + NewsAPI). لا نضيف Kitco/Mining لأنها إنجليزي فقط.
    [newsApiItems, mediastackItems] = await Promise.all([
      fetchFromNewsAPI('ar', perSource * 2),
      fetchFromMediastack('ar', perSource * 2)
    ]);
  } else {
    // English: all sources including RSS (Kitco, Mining.com)
    [kitcoItems, miningItems] = await Promise.all([
      fetchFromKitcoRss(perSource),
      fetchFromMiningRss(perSource)
    ]);
    [newsApiItems, mediastackItems] = await Promise.all([
      fetchFromNewsAPI(lang, perSource),
      fetchFromMediastack(lang, perSource)
    ]);
  }

  const toMerge = lang === 'ar'
    ? [newsApiItems, mediastackItems]
    : [newsApiItems, kitcoItems, miningItems, mediastackItems];
  const merged = mergeAndSort(toMerge);
  return merged.slice(0, limit).map(normalizeArticle);
}

module.exports = {
  getAggregatedNews,
  fetchFromNewsAPI,
  fetchFromKitcoRss,
  fetchFromMiningRss,
  fetchFromMediastack
};
