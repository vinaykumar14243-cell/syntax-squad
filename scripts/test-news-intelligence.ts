import { fetchLiveNewsIntelligence, getVerifiedNewsForStock } from '../server/newsIntelligence';

async function testNewsIntelligence() {
  console.log('Fetching live news intelligence...');
  const start = Date.now();
  const res = await fetchLiveNewsIntelligence('all');
  console.log(`Fetched ${res.totalArticles} deduplicated articles from ${res.providerHealth.activeSources.length} sources in ${Date.now() - start}ms:`);
  console.log('Provider Status:', res.providerHealth.status);
  console.log('Breaking News Count:', res.breakingNews.length);
  console.log('Economic Events Count:', res.economicEvents.length);

  console.log('\n--- SAMPLE ARTICLES ---');
  for (const a of res.articles.slice(0, 5)) {
    console.log(`\n[${a.potentialImpact} IMPACT] [${a.sentiment}] ${a.headline}`);
    console.log(`  Source: ${a.sourceName} | Published: ${a.publishedTimeFormatted} | Category: ${a.category}`);
    console.log(`  Related Stocks: ${a.relatedStocks.map(s => `${s.symbol} (${s.relationship})`).join(', ') || 'None (Macro/Sector)'}`);
    console.log(`  Why it matters: ${a.whyItMatters}`);
    console.log(`  Link: ${a.sourceUrl}`);
  }

  console.log('\n--- TESTING STOCK MATCH (e.g. POWERGRID, HDFCBANK, RELIANCE, USD/INR) ---');
  for (const sym of ['POWERGRID', 'HDFCBANK', 'RELIANCE', 'USD/INR', 'ASIANPAINT']) {
    const matched = await getVerifiedNewsForStock(sym);
    console.log(`\nStock ${sym}: Found ${matched.length} verified news items.`);
    if (matched.length > 0) {
      console.log(`  Top item: "${matched[0].headline}" [${matched[0].sentiment}]`);
    }
  }
}

testNewsIntelligence();
