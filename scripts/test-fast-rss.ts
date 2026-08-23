import fetch from 'node-fetch';

async function fetchWithTimeout(url: string, ms = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeout);
    return res;
  } catch (e: any) {
    clearTimeout(timeout);
    throw e;
  }
}

async function testFeeds() {
  console.log('Testing Google RSS IN:');
  try {
    const res = await fetchWithTimeout('https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en');
    console.log('Status:', res.status);
    const xml = await res.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
    console.log('Items count:', items.length);
    if (items.length > 0) {
      const title = items[0].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1];
      console.log('Item 1 title:', title);
    }
  } catch (e: any) {
    console.log('Error:', e.message);
  }
}

testFeeds();
