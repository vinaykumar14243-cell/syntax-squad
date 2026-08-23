import fetch from 'node-fetch';

interface Mover {
  symbol: string;
  name: string;
  price: string;
  rawPrice: number;
  changeStr: string;
  changePct: number;
  isPositive: boolean;
  high24h: string;
  low24h: string;
  volume24h: string;
  marketType: 'INDIAN' | 'FOREX';
  exchange: string;
}

function formatInr(val: number): string {
  if (isNaN(val)) return '₹0.00';
  if (val >= 1000) {
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (val >= 1) {
    return '₹' + val.toFixed(2);
  }
  return '₹' + val.toFixed(4);
}

async function getLiveTopMovers() {
  const stockList = [
    { sym: 'RELIANCE', name: 'Reliance Industries Ltd', yahoo: 'RELIANCE.NS', exchange: 'NSE' },
    { sym: 'HDFCBANK', name: 'HDFC Bank Ltd', yahoo: 'HDFCBANK.NS', exchange: 'NSE' },
    { sym: 'TCS', name: 'Tata Consultancy Services', yahoo: 'TCS.NS', exchange: 'NSE' },
    { sym: 'INFY', name: 'Infosys Ltd', yahoo: 'INFY.NS', exchange: 'NSE' },
    { sym: 'SBIN', name: 'State Bank of India', yahoo: 'SBIN.NS', exchange: 'NSE' },
    { sym: 'BHARTIARTL', name: 'Bharti Airtel Ltd', yahoo: 'BHARTIARTL.NS', exchange: 'NSE' },
    { sym: 'ADANIENT', name: 'Adani Enterprises Ltd', yahoo: 'ADANIENT.NS', exchange: 'NSE' },
    { sym: 'LT', name: 'Larsen & Toubro Ltd', yahoo: 'LT.NS', exchange: 'NSE' },
    { sym: 'MARUTI', name: 'Maruti Suzuki India Ltd', yahoo: 'MARUTI.NS', exchange: 'NSE' },
    { sym: 'BAJFINANCE', name: 'Bajaj Finance Ltd', yahoo: 'BAJFINANCE.NS', exchange: 'NSE' },
    { sym: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', yahoo: 'KOTAKBANK.NS', exchange: 'NSE' },
    { sym: 'POWERGRID', name: 'Power Grid Corp of India', yahoo: 'POWERGRID.NS', exchange: 'NSE' },
    { sym: 'NTPC', name: 'NTPC Limited', yahoo: 'NTPC.NS', exchange: 'NSE' },
    { sym: 'TITAN', name: 'Titan Company Ltd', yahoo: 'TITAN.NS', exchange: 'NSE' },
    { sym: 'ASIANPAINT', name: 'Asian Paints Ltd', yahoo: 'ASIANPAINT.NS', exchange: 'NSE' },
    { sym: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', yahoo: 'SUNPHARMA.NS', exchange: 'NSE' },
    { sym: 'M&M', name: 'Mahindra & Mahindra Ltd', yahoo: 'M&M.NS', exchange: 'NSE' },
    { sym: 'TATASTEEL', name: 'Tata Steel Ltd', yahoo: 'TATASTEEL.NS', exchange: 'NSE' },
    { sym: 'COALINDIA', name: 'Coal India Ltd', yahoo: 'COALINDIA.NS', exchange: 'NSE' },
    { sym: 'ONGC', name: 'Oil & Natural Gas Corp', yahoo: 'ONGC.NS', exchange: 'NSE' },
    { sym: 'AXISBANK', name: 'Axis Bank Ltd', yahoo: 'AXISBANK.NS', exchange: 'NSE' }
  ];

  const forexList = [
    { sym: 'USD/INR', name: 'US Dollar / Indian Rupee', yahoo: 'INR=X', exchange: 'FOREX / RBI' },
    { sym: 'EUR/INR', name: 'Euro / Indian Rupee', yahoo: 'EURINR=X', exchange: 'FOREX' },
    { sym: 'GBP/INR', name: 'British Pound / Indian Rupee', yahoo: 'GBPINR=X', exchange: 'FOREX' },
    { sym: 'JPY/INR', name: 'Japanese Yen (100) / INR', yahoo: 'JPYINR=X', exchange: 'FOREX' },
    { sym: 'AED/INR', name: 'UAE Dirham / Indian Rupee', yahoo: 'AEDINR=X', exchange: 'FOREX' },
    { sym: 'AUD/INR', name: 'Australian Dollar / INR', yahoo: 'AUDINR=X', exchange: 'FOREX' },
    { sym: 'CAD/INR', name: 'Canadian Dollar / INR', yahoo: 'CADINR=X', exchange: 'FOREX' }
  ];

  console.log('Fetching live data in parallel...');
  const start = Date.now();

  const stockPromises = stockList.map(async (s): Promise<Mover | null> => {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.yahoo)}?interval=1d&range=2d`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.ok) {
        const d = await res.json();
        const meta = d?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const rawPrice = meta.regularMarketPrice;
          const prev = meta.chartPreviousClose || meta.previousClose || rawPrice;
          const changePct = prev ? ((rawPrice - prev) / prev) * 100 : 0;
          return {
            symbol: s.sym,
            name: s.name,
            price: formatInr(rawPrice),
            rawPrice,
            changeStr: (changePct >= 0 ? '+' : '') + changePct.toFixed(2) + '%',
            changePct,
            isPositive: changePct >= 0,
            high24h: formatInr(meta.regularMarketDayHigh || rawPrice),
            low24h: formatInr(meta.regularMarketDayLow || rawPrice),
            volume24h: '₹' + ((meta.regularMarketVolume || 1500000) * rawPrice / 1e7).toFixed(1) + ' Cr',
            marketType: 'INDIAN',
            exchange: s.exchange
          };
        }
      }
    } catch {}
    return null;
  });

  const forexPromises = forexList.map(async (f): Promise<Mover | null> => {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(f.yahoo)}?interval=1d&range=2d`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.ok) {
        const d = await res.json();
        const meta = d?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const rawPrice = meta.regularMarketPrice;
          const prev = meta.chartPreviousClose || meta.previousClose || rawPrice;
          const changePct = prev ? ((rawPrice - prev) / prev) * 100 : 0;
          return {
            symbol: f.sym,
            name: f.name,
            price: formatInr(rawPrice),
            rawPrice,
            changeStr: (changePct >= 0 ? '+' : '') + changePct.toFixed(2) + '%',
            changePct,
            isPositive: changePct >= 0,
            high24h: formatInr(meta.regularMarketDayHigh || rawPrice),
            low24h: formatInr(meta.regularMarketDayLow || rawPrice),
            volume24h: '$2.5B',
            marketType: 'FOREX',
            exchange: f.exchange
          };
        }
      }
    } catch {}
    return null;
  });

  const [stocks, forex] = await Promise.all([
    Promise.all(stockPromises),
    Promise.all(forexPromises)
  ]);

  const validStocks = stocks.filter((s): s is Mover => s !== null).sort((a, b) => b.changePct - a.changePct);
  const validForex = forex.filter((f): f is Mover => f !== null).sort((a, b) => b.changePct - a.changePct);

  console.log(`Fetched in ${Date.now() - start}ms:`);
  console.log('\nTop Indian Stock Movers (Live):');
  validStocks.slice(0, 6).forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.symbol} (${s.name}): ${s.price} [${s.changeStr}] - High: ${s.high24h}, Low: ${s.low24h}`);
  });

  console.log('\nTop Forex Movers (Live):');
  validForex.forEach((f, idx) => {
    console.log(`${idx + 1}. ${f.symbol} (${f.name}): ${f.price} [${f.changeStr}] - High: ${f.high24h}, Low: ${f.low24h}`);
  });
}

getLiveTopMovers();
