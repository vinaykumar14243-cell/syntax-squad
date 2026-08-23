import https from 'https';
import http from 'http';

function fetchUrl(urlStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      timeout: 5000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testAllSources() {
  const sources = [
    { name: 'MarketWatch Top Stories', url: 'https://feeds.content.dowjones.com/public/rss/mw_topstories' },
    { name: 'MarketWatch Real Time Market Pulse', url: 'https://feeds.content.dowjones.com/public/rss/mw_realtimeheadlines' },
    { name: 'Yahoo Finance News', url: 'https://finance.yahoo.com/news/rssindex' },
    { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
    { name: 'Economic Times Stocks', url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms' },
    { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets' },
    { name: 'Moneycontrol Latest', url: 'https://www.moneycontrol.com/rss/latestnews.xml' },
    { name: 'CNBC Top News', url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=markets&sort=date' }
  ];

  for (const s of sources) {
    try {
      const xml = await fetchUrl(s.url);
      const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
      console.log(`✓ [SUCCESS] ${s.name}: Fetched ${xml.length} bytes, ${items.length} items.`);
      if (items.length > 0) {
        const title = items[0].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
        console.log(`  - Sample: "${title}"`);
      }
    } catch (e: any) {
      console.log(`✗ [FAIL] ${s.name}: ${e.message}`);
    }
  }
}

testAllSources();
