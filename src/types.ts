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

export type NewsCategory =
  | 'EARNINGS'
  | 'MERGER_ACQUISITION'
  | 'MANAGEMENT'
  | 'REGULATORY'
  | 'GOVERNMENT'
  | 'CENTRAL_BANK'
  | 'INTEREST_RATES'
  | 'INFLATION'
  | 'ECONOMIC_DATA'
  | 'GEOPOLITICAL'
  | 'COMMODITIES'
  | 'OIL'
  | 'CURRENCY'
  | 'SECTOR'
  | 'LEGAL'
  | 'PRODUCT_LAUNCH'
  | 'CONTRACT_ORDER'
  | 'PARTNERSHIP'
  | 'BANKRUPTCY'
  | 'DIVIDEND'
  | 'BUYBACK'
  | 'IPO'
  | 'MARKET_MOVEMENT'
  | 'OTHER';

export type NewsSentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED' | 'UNCLEAR';
export type PotentialImpact = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type PotentialDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'MIXED' | 'UNKNOWN';
export type NewsFreshness = 'BREAKING' | 'RECENT' | 'TODAY' | 'OLDER';

export interface RelatedStock {
  company: string;
  symbol: string;
  exchange: string;
  country: string;
  sector: string;
  relationship: 'DIRECT' | 'INDIRECT';
}

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  whyItMatters?: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  publishedTimeFormatted?: string;
  retrievedAt: string;
  category: NewsCategory;
  country: 'INDIA' | 'USA' | 'EUROPE' | 'ASIA' | 'GLOBAL';
  market: string;
  sentiment: NewsSentiment;
  sentimentReason?: string;
  potentialImpact: PotentialImpact;
  potentialImpactReason?: string;
  potentialDirection: PotentialDirection;
  relatedStocks: RelatedStock[];
  indirectSectors?: string[];
  isBreaking: boolean;
  freshness: NewsFreshness;
  contentHash: string;
  sourceVerified: boolean;
  duplicateCount?: number;
  duplicateSources?: string[];
  interpretationConfidence: number; // 0-100% agreement with visible facts
}

export interface EconomicCalendarEvent {
  id: string;
  event: string;
  country: string;
  flag?: string;
  expectedTime: string;
  dateStr: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast: string;
  previous: string;
  actual: string;
  impactOn?: string;
}

export interface NewsProviderHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  lastSync: string;
  activeSources: string[];
  totalFetched: number;
  deduplicatedCount: number;
  cacheExpirySeconds: number;
  provider: string;
}

export interface NewsIntelligenceResponse {
  articles: NewsArticle[];
  breakingNews: NewsArticle[];
  economicEvents: EconomicCalendarEvent[];
  totalArticles: number;
  lastUpdated: string;
  providerHealth: NewsProviderHealth;
  searchMetadata?: SearchMetadata;
  marketCategory?: string;
}

export interface MarketNewsItem {
  headline: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  source: string;
  url?: string;
  marketCategory?: 'INDIAN' | 'FOREX' | 'GLOBAL';
  article?: NewsArticle;
}

export interface MarketNewsResponse {
  news: MarketNewsItem[];
  intelligence?: NewsIntelligenceResponse;
  searchMetadata?: SearchMetadata;
}

export type ChartSignalStatus = 
  | 'STRONG_POSSIBLE_BULLISH_SETUP'
  | 'POSSIBLE_BULLISH_SETUP'
  | 'NEUTRAL_WAIT'
  | 'POSSIBLE_BEARISH_SETUP'
  | 'STRONG_POSSIBLE_BEARISH_SETUP'
  | 'NO_SIGNAL'
  | 'INVALID_CHART';

export interface ImageValidationResult {
  isValid: boolean;
  isTradingChart: boolean;
  chartValidityScore: number; // 0 - 100
  reason: string;
  detectedFeatures?: string[];
  rejectionCategory?: 'BLANK_IMAGE' | 'SOLID_COLOR' | 'NOT_A_CHART' | 'TOO_BLURRY' | 'UI_ONLY_NO_PRICE' | 'CORRUPTED' | 'NONE';
}

export interface ChartIdentifiedInfo {
  symbol: string; // e.g. "RELIANCE", "NIFTY 50", "USD/INR", "BTCUSDT", or "Unknown"
  timeframe: string; // e.g. "15m", "1D", "1h", or "Unknown"
  chartType: string; // "Candlestick" | "Line" | "Bar" | "Heikin Ashi" | "Area" | "Unknown"
  currentPrice?: string | null; // visible last price or "Not reliably readable"
  exchangeOrPlatform?: string; // e.g. "TradingView / NSE", "Zerodha Kite", "Binance", "Unknown"
  visibleIndicators?: string[]; // only indicators actually visible on chart
  volumeVisible?: boolean;
}

export interface ChartTechnicalAnalysis {
  trend: 'Bullish' | 'Bearish' | 'Sideways / Consolidation' | 'Unclear / Insufficient Data';
  marketStructure: string; // e.g. "Higher highs & higher lows with ascending base"
  momentum: 'Bullish' | 'Bearish' | 'Neutral' | 'Unknown';
  priceAction: string;
  supportLevels: string[];
  resistanceLevels: string[];
  visibleIndicatorsAnalysis: string;
}

export interface ChartSignalPlan {
  status: ChartSignalStatus;
  direction: 'UP' | 'DOWN' | 'NEUTRAL' | null;
  analysisConfidence: number; // 0-100%
  confidenceExplanation: string; // e.g. "Technical factors consistency score, not a guarantee of profitability"
  actionRecommendation: 'POSSIBLE_LONG' | 'POSSIBLE_SHORT' | 'WAIT_NO_TRADE' | 'INVALID_IMAGE';
}

export interface ChartTradePlan {
  entry: string | null;
  stopLoss: string | null;
  target: string | null;
  riskReward: string | null;
  invalidationLevel?: string | null;
  levelNotice?: string; // "Illustrative technical levels — not guaranteed execution prices."
}

export interface ChartRiskManagement {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' | 'N/A';
  invalidationTriggers: string[];
  keyWarning: string;
}

export interface ChartAnalysisResponse {
  imageValidation: ImageValidationResult;
  chart?: ChartIdentifiedInfo;
  analysis?: ChartTechnicalAnalysis;
  signal: ChartSignalPlan;
  tradePlan?: ChartTradePlan;
  riskManagement?: ChartRiskManagement;
  warnings?: string[];
  // Legacy / convenience fallback fields
  action?: 'BUY' | 'SELL' | 'HOLD' | 'NO_SIGNAL' | 'INVALID';
  entryPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  confidence?: number;
  error?: string;
}

