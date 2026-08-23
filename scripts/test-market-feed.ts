import fetch from 'node-fetch';

async function testFeeds() {
  console.log('Testing Forex rates API...');
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      console.log('USD rates:', {
        INR: fxData.rates.INR,
        EUR: fxData.rates.EUR,
        GBP: fxData.rates.GBP,
        AED: fxData.rates.AED,
        JPY: fxData.rates.JPY
      });
    }
  } catch (e: any) {
    console.error('Forex error:', e.message);
  }

  console.log('\nTesting Yahoo Finance v8 chart API for NSE...');
  try {
    const yRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS?interval=1d&range=5d', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Yahoo response status:', yRes.status);
    if (yRes.ok) {
      const yData = await yRes.json();
      const meta = yData?.chart?.result?.[0]?.meta;
      console.log('RELIANCE.NS meta:', {
        regularMarketPrice: meta?.regularMarketPrice,
        previousClose: meta?.previousClose,
        regularMarketDayHigh: meta?.regularMarketDayHigh,
        regularMarketDayLow: meta?.regularMarketDayLow
      });
    }
  } catch (e: any) {
    console.error('Yahoo error:', e.message);
  }

  console.log('\nTesting Yahoo Finance quote endpoint for multiple NSE tickers...');
  try {
    const tickers = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS', 'INFY.NS', 'SBIN.NS', 'ITC.NS', 'BHARTIARTL.NS', 'ADANIENT.NS', 'ZOMATO.NS', 'INR=X', 'EURINR=X', 'GBPINR=X', '^NSEI', '^BSESN'];
    const yMulti = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers.join(',')}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Yahoo multi quote status:', yMulti.status);
    if (yMulti.ok) {
      const mData = await yMulti.json();
      const results = mData?.quoteResponse?.result || [];
      console.log(`Fetched ${results.length} quotes from Yahoo Finance:`);
      for (const r of results.slice(0, 5)) {
        console.log(`- ${r.symbol}: Price=${r.regularMarketPrice}, Change=${r.regularMarketChangePercent?.toFixed(2)}%, High=${r.regularMarketDayHigh}, Low=${r.regularMarketDayLow}`);
      }
    }
  } catch (e: any) {
    console.error('Yahoo multi quote error:', e.message);
  }
}

testFeeds();
