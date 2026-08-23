const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('const cache = new Map')) {
  content = content.replace('// API Routes', `// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  return null;
}
function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// API Routes`);
}

// Top Movers
if (!content.includes("getCached('top-movers')")) {
  content = content.replace(
    "app.get('/api/top-movers', async (req, res) => {\n  try {\n    const response",
    "app.get('/api/top-movers', async (req, res) => {\n  try {\n    const cached = getCached('top-movers');\n    if (cached) return res.json(cached);\n\n    const response"
  );
  content = content.replace(
    "    res.json(JSON.parse(response.text));\n  } catch (error: any) {\n    console.error('Error fetching top movers:', error);",
    "    const data = JSON.parse(response.text);\n    setCache('top-movers', data);\n    res.json(data);\n  } catch (error: any) {\n    console.error('Error fetching top movers:', error);"
  );
}

// Analyze Stocks
if (!content.includes("getCached(cacheKey)")) {
  content = content.replace(
    "    if (!query) {\n      return res.status(400).json({ error: 'Please provide a search query (e.g. AAPL, Tesla, BTC)' });\n    }\n    const response",
    "    if (!query) {\n      return res.status(400).json({ error: 'Please provide a search query (e.g. AAPL, Tesla, BTC)' });\n    }\n    const cacheKey = `analyze-stocks-${query.toLowerCase()}`;\n    const cached = getCached(cacheKey);\n    if (cached) return res.json(cached);\n\n    const response"
  );
  content = content.replace(
    "    res.json(JSON.parse(response.text));\n  } catch (error: any) {\n    console.error('Error analyzing stock:', error);",
    "    const data = JSON.parse(response.text);\n    setCache(cacheKey, data);\n    res.json(data);\n  } catch (error: any) {\n    console.error('Error analyzing stock:', error);"
  );
}

// Market News
if (!content.includes("getCached('market-news')")) {
  content = content.replace(
    "app.get('/api/market-news', async (req, res) => {\n  try {\n    const response",
    "app.get('/api/market-news', async (req, res) => {\n  try {\n    const cached = getCached('market-news');\n    if (cached) return res.json(cached);\n\n    const response"
  );
  content = content.replace(
    "    res.json(JSON.parse(response.text));\n  } catch (error: any) {\n    console.error('Market news error:', error);",
    "    const data = JSON.parse(response.text);\n    setCache('market-news', data);\n    res.json(data);\n  } catch (error: any) {\n    console.error('Market news error:', error);"
  );
}

fs.writeFileSync('server.ts', content);
