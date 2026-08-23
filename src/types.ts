export interface SearchSource {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface SearchMetadata {
  queries: string[];
  sources: SearchSource[];
  groundedTime: string;
  provider: string;
}

export interface LiveQuote {
  symbol: string;
  name?: string;
  price: string;
  rawPrice: number;
  change: string;
  changeAmount?: string;
  isUp: boolean;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
  timestamp: number;
  source: string;
  marketType?: 'INDIAN' | 'FOREX' | 'CRYPTO' | 'GLOBAL';
  exchange?: string;
  currency?: string;
}

export interface TopMoverItem {
  symbol: string;
  name: string;
  price: string;
  rawPrice?: number;
  changeStr: string;
  isPositive: boolean;
  reason: string;
  sourceUrl?: string;
  sourceTitle?: string;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
  lastUpdated?: string;
  marketType?: 'INDIAN' | 'FOREX' | 'CRYPTO' | 'GLOBAL';
  exchange?: string;
}

export interface TopMoversResponse {
  movers: TopMoverItem[];
  searchMetadata?: SearchMetadata;
  liveQuotes?: Record<string, LiveQuote>;
  marketCategory?: string;
}

export interface StockAnalysisResponse {
  symbol: string;
  name: string;
  currentPrice: string;
  rawPrice?: number;
  changeStr?: string;
  isPositive?: boolean;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
  companyDetails: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | string;
  futureProfitability: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  analysis: string;
  searchMetadata?: SearchMetadata;
  liveQuote?: LiveQuote;
  marketType?: 'INDIAN' | 'FOREX' | 'CRYPTO' | 'GLOBAL';
  exchange?: string;
  currency?: string;
}

export interface MarketNewsItem {
  headline: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  source: string;
  url?: string;
  marketCategory?: 'INDIAN' | 'FOREX' | 'GLOBAL';
}

export interface MarketNewsResponse {
  news: MarketNewsItem[];
  searchMetadata?: SearchMetadata;
}

export interface ChartAnalysisResponse {
  action: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  confidence: number;
  analysis: string;
}
