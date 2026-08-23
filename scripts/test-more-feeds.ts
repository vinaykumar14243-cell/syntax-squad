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

async function testMore() {
  const sources = [
    { name: 'ET Forex', url: 'https://economictimes.indiatimes.com/markets/forex/rssfeeds/30359489.cms' },
    { name: 'ET Commodities', url: 'https://economictimes.indiatimes.com/markets/commodities/rssfeeds/1977021503.cms' },
    { name: 'Livemint Companies', url: 'https://www.livemint.com/rss/companies' },
    { name: 'Livemint Economy', url: 'https://www.livemint.com/rss/economy' }
  ];

  for (const s of sources) {
    try {
      const xml = await fetchUrl(s.url);
      const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
      console.log(`✓ [SUCCESS] ${s.name}: ${items.length} items.`);
      if (items.length > 0) {
        const title = items[0].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        console.log(`  - "${title}"`);
      }
    } catch (e: any) {
      console.log(`✗ [FAIL] ${s.name}: ${e.message}`);
    }
  }
}

testMore();
