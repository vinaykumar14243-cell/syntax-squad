import fetch from 'node-fetch';

async function testMoreTickers() {
  const list = [
    'MARUTI.NS', 'BAJFINANCE.NS', 'LT.NS', 'AXISBANK.NS', 'SUNPHARMA.NS',
    'KOTAKBANK.NS', 'WIPRO.NS', 'HCLTECH.NS', 'ASIANPAINT.NS', 'TITAN.NS',
    'ULTRACEMCO.NS', 'NTPC.NS', 'POWERGRID.NS', 'ONGC.NS', 'COALINDIA.NS',
    'TATASTEEL.NS', 'M&M.NS', 'TATACONSUM.NS', 'BAJAJ-AUTO.NS', 'HEROMOTOCO.NS',
    'TATAMOTORS.BO'
  ];

  console.log('Testing more tickers:');
  for (const sym of list) {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice;
        const prev = meta?.chartPreviousClose || meta?.previousClose || price;
        const changePct = prev ? ((price - prev) / prev) * 100 : 0;
        console.log(`✓ ${sym}: ₹${price} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)`);
      }
    } catch {}
  }
}

testMoreTickers();
