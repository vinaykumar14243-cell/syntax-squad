import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testGeminiSearchNews() {
  console.log('Testing Google Search Grounding for Live Financial Market News:');
  const start = Date.now();
  try {
    const prompt = `Perform a real-time Google Search for the latest verified financial news, corporate earnings, central bank announcements, and economic updates across Indian Markets (NSE/BSE/RBI), US & Global Markets (Fed, Wall Street), and Commodities/Forex (Crude Oil, Gold, USD/INR).
Return a JSON object with:
1. "breakingNews": array of urgent/breaking news items (0-3 items)
2. "articles": array of 12-16 latest verified news articles across India, US, Europe, Asia, Commodities, and Forex.

For each article in "articles" and "breakingNews", provide:
- "id": unique string id (e.g. "news-1")
- "headline": exact or faithful factual headline from the source
- "summary": 2-3 sentence factual summary explaining the key facts
- "sourceName": name of the publisher (e.g. "The Economic Times", "Moneycontrol", "Livemint", "Reuters", "Bloomberg", "CNBC", "Business Standard", "RBI")
- "sourceUrl": genuine publisher or domain URL (e.g. "https://economictimes.indiatimes.com/...", "https://www.moneycontrol.com/...")
- "publishedAt": ISO string or relative time string (e.g. "25 mins ago" or "2026-08-23T10:15:00Z")
- "freshness": "BREAKING" | "RECENT" | "TODAY"
- "category": one of ["EARNINGS", "MERGER_ACQUISITION", "MANAGEMENT", "REGULATORY", "GOVERNMENT", "CENTRAL_BANK", "INTEREST_RATES", "INFLATION", "ECONOMIC_DATA", "GEOPOLITICAL", "COMMODITIES", "OIL", "CURRENCY", "SECTOR", "CONTRACT_ORDER", "MARKET_MOVEMENT", "OTHER"]
- "country": "INDIA" | "USA" | "EUROPE" | "ASIA" | "GLOBAL"
- "market": "NSE/BSE" | "US_MARKETS" | "FOREX" | "COMMODITIES" | "GLOBAL"
- "relatedStocks": array of objects with: { "company": string, "symbol": string, "exchange": "NSE" | "BSE" | "NYSE" | "NASDAQ" | "FOREX" | "OTHER", "country": string, "sector": string, "relationship": "DIRECT" | "INDIRECT" }
- "indirectSectors": array of strings (e.g. ["Airlines", "Paint Companies", "Chemicals"] if oil moves)
- "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED"
- "sentimentReason": 1 sentence explaining the financial context of the sentiment
- "potentialImpact": "HIGH" | "MEDIUM" | "LOW"
- "potentialImpactReason": 1 sentence explaining why this event could matter to the market
- "potentialDirection": "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED"
- "whyItMatters": 1-2 sentences on how it affects earnings, liquidity, or valuation
- "interpretationConfidence": number (0-100, agreement with visible facts)

3. "economicEvents": array of 4-6 major upcoming/recent economic calendar events (e.g. RBI MPC decision, US CPI Inflation, US Fed FOMC rate, GDP, Crude Inventory) with:
- "event": string
- "country": string
- "expectedTime": string
- "importance": "HIGH" | "MEDIUM" | "LOW"
- "forecast": string (or "N/A")
- "previous": string (or "N/A")
- "actual": string (or "Pending")

Strict Rules:
- All news must be derived from verified live Google Search results.
- DO NOT invent headlines, prices, or fake events.
- Return ONLY valid JSON wrapped in \`\`\`json ... \`\`\`.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    console.log(`Generated in ${Date.now() - start}ms`);
    console.log('Response length:', res.text?.length);
    
    // Extract metadata
    const groundings = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    console.log(`Grounding chunks: ${groundings.length}`);
    for (const g of groundings.slice(0, 5)) {
      if (g.web?.uri) {
        console.log(`- Web source: ${g.web.title} -> ${g.web.uri}`);
      }
    }
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

testGeminiSearchNews();
