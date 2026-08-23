import fetch from 'node-fetch';

async function testChartTickers() {
  const tickers = [
    { sym: 'TATAMOTORS', yahoo: 'TATAMOTORS.NS' },
    { sym: 'RELIANCE', yahoo: 'RELIANCE.NS' },
    { sym: 'HDFCBANK', yahoo: 'HDFCBANK.NS' },
    { sym: 'TCS', yahoo: 'TCS.NS' },
    { sym: 'INFY', yahoo: 'INFY.NS' },
    { sym: 'SBIN', yahoo: 'SBIN.NS' },
    { sym: 'ITC', yahoo: 'ITC.NS' },
    { sym: 'BHARTIARTL', yahoo: 'BHARTIARTL.NS' },
    { sym: 'ADANIENT', yahoo: 'ADANIENT.NS' },
    { sym: 'ZOMATO', yahoo: 'ZOMATO.NS' },
    { sym: 'NIFTY 50', yahoo: '^NSEI' },
    { sym: 'SENSEX', yahoo: '^BSESN' },
    { sym: 'USD/INR', yahoo: 'INR=X' },
    { sym: 'EUR/INR', yahoo: 'EURINR=X' },
    { sym: 'GBP/INR', yahoo: 'GBPINR=X' }
  ];

  console.log('Fetching live quotes for all tickers:');
  for (const t of tickers) {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t.yahoo)}?interval=1d&range=2d`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice;
        const prev = meta?.chartPreviousClose || meta?.previousClose || price;
        const changePct = prev ? ((price - prev) / prev) * 100 : 0;
        console.log(`✓ ${t.sym} (${t.yahoo}): Price=₹${price} | Prev=₹${prev} | Change=${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% | High=₹${meta?.regularMarketDayHigh} | Low=₹${meta?.regularMarketDayLow}`);
      } else {
        console.log(`✗ ${t.sym} (${t.yahoo}) failed with status ${res.status}`);
      }
    } catch (e: any) {
      console.log(`✗ ${t.sym} error: ${e.message}`);
    }
  }
}

testChartTickers();
