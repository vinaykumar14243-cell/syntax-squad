import fetch from 'node-fetch';

async function testRssFeeds() {
  const feeds = [
    { name: 'Google News Business India', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en' },
    { name: 'Google News Stock Markets', url: 'https://news.google.com/rss/search?q=NSE+OR+BSE+OR+Nifty+OR+"Stock+Market"+when:2d&hl=en-IN&gl=IN&ceid=IN:en' },
    { name: 'Google News Global Markets & Fed', url: 'https://news.google.com/rss/search?q="Federal+Reserve"+OR+ECB+OR+"Wall+Street"+OR+Nasdaq+when:2d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Google News Commodities & Forex', url: 'https://news.google.com/rss/search?q=crude+oil+OR+"USD/INR"+OR+"gold+price"+when:2d&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
    { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets' }
  ];

  for (const f of feeds) {
    try {
      const res = await fetch(f.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`Feed ${f.name} status:`, res.status);
      if (res.ok) {
        const xml = await res.text();
        console.log(`- XML length: ${xml.length} bytes`);
        // Simple regex extraction of items
        const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
        console.log(`- Extracted ${itemMatches.length} news items`);
        if (itemMatches.length > 0) {
          const first = itemMatches[0];
          const title = first.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
          const pubDate = first.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i)?.[1]?.trim();
          const link = first.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim() || first.match(/<guid[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/guid>/i)?.[1]?.trim();
          const source = first.match(/<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/i)?.[1]?.trim();
          console.log(`  Sample 1: "${title}" | Pub: ${pubDate} | Source: ${source || 'ET/Mint'} | Link: ${link?.slice(0, 60)}...`);
        }
      }
    } catch (e: any) {
      console.error(`Feed ${f.name} error:`, e.message);
    }
  }
}

testRssFeeds();
