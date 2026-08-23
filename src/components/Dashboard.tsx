import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  TrendingUp, 
  BarChart2, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  Newspaper, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  SearchCode,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Filter,
  DollarSign,
  ShieldAlert,
  HelpCircle,
  Info,
  FileWarning,
  CheckCircle2,
  XCircle,
  Eye,
  Target,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SearchMetadata, 
  TopMoverItem, 
  TopMoversResponse, 
  StockAnalysisResponse, 
  MarketNewsItem, 
  MarketNewsResponse,
  ChartAnalysisResponse,
  LiveQuote,
  ChartSignalStatus,
  NewsArticle
} from '../types';
import {
  fetchTickersApi,
  fetchLiveQuotesApi,
  fetchTopMoversApi,
  analyzeStocksApi,
  analyzeChartApi,
  fetchMarketNewsApi,
  fetchStockNewsApi
} from '../lib/apiClient';
import {
  analyzeImagePixelsOnClient,
  generateValidationDiagnosticReport,
  ClientImageValidationResult
} from '../lib/imageValidator';
import { NewsIntelligenceView } from './NewsIntelligenceView';

export default function Dashboard({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<'upload' | 'movers' | 'custom' | 'news'>('upload');
  const [selectedStockQuery, setSelectedStockQuery] = useState<string>('');

  const handleSelectStock = (symbol: string) => {
    setSelectedStockQuery(symbol);
    setActiveTab('custom');
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#f3f7ff] flex flex-col">
      {/* Top sticky navigation */}
      <header className="h-[70px] flex items-center justify-between px-4 sm:px-8 lg:px-10 border-b border-white/10 bg-[#050811]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex w-10 h-10 items-center justify-center rounded-xl text-[#06110d] font-black bg-gradient-to-br from-[#35efaa] to-[#53dcff] shadow-[0_0_20px_rgba(53,239,170,0.3)]">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight hidden sm:inline">VANTA<span className="text-[#19d58b]">TRADE</span> AI</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30">
                INR (₹)
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#8390a6] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19d58b] animate-ping"></span>
              <span>NSE · BSE · FOREX STREAM</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-[#8390a6]">
          <TabButton active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<Upload size={16} />} label="ANALYZE CHART" />
          <TabButton active={activeTab === 'movers'} onClick={() => setActiveTab('movers')} icon={<TrendingUp size={16} />} label="TOP MOVERS" />
          <TabButton active={activeTab === 'custom'} onClick={() => setActiveTab('custom')} icon={<Search size={16} />} label="INDIAN & FOREX SEARCH" />
          <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Newspaper size={16} />} label="GLOBAL NEWS INTELLIGENCE" />
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-[#19d58b] text-xs font-semibold px-3 py-1 rounded-full bg-[#19d58b]/10 border border-[#19d58b]/20 shadow-[0_0_15px_rgba(25,213,139,0.15)]">
            <div className="w-2 h-2 rounded-full bg-[#19d58b] animate-pulse"></div>
            <span>LIVE (₹ INR)</span>
          </div>

          <button 
            id="exit-to-overview-btn"
            onClick={onExit} 
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#8390a6] hover:text-white transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Exit to Overview</span>
          </button>
        </div>
      </header>

      {/* Global Real-Time Live Ticker Bar */}
      <LiveMarketTickerBar />

      {/* Mobile nav */}
      <div className="md:hidden flex p-3 gap-2 overflow-x-auto border-b border-white/5 bg-[#0a101d] sticky top-[70px] z-40 no-scrollbar">
        <TabButton active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<Upload size={16} />} label="Analyze Chart" />
        <TabButton active={activeTab === 'movers'} onClick={() => setActiveTab('movers')} icon={<TrendingUp size={16} />} label="Top Movers" />
        <TabButton active={activeTab === 'custom'} onClick={() => setActiveTab('custom')} icon={<Search size={16} />} label="Indian & Forex" />
        <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Newspaper size={16} />} label="News Intel" />
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {activeTab === 'upload' && <UploadChartTab />}
        {activeTab === 'movers' && <TopMoversTab onSelectStock={handleSelectStock} />}
        {activeTab === 'custom' && <CustomStocksTab initialQuery={selectedStockQuery} />}
        {activeTab === 'news' && <NewsTab onSelectStock={handleSelectStock} />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 text-sm font-medium transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer px-3 py-1.5 rounded-lg ${
        active 
          ? 'text-white font-bold bg-white/10 border border-white/10 shadow-sm' 
          : 'text-[#8390a6] hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// --- GLOBAL REAL-TIME TICKER BAR (INDIAN EQUITIES + FOREX IN ₹ INR) --- //

function LiveMarketTickerBar() {
  const [tickers, setTickers] = useState<LiveQuote[]>([
    { symbol: "NIFTY 50", name: "NIFTY 50", price: "₹22,850.40", rawPrice: 22850.40, change: "+0.72%", isUp: true, high24h: "₹22,940.00", low24h: "₹22,780.00", volume24h: "₹18,400 Cr", timestamp: Date.now(), source: "NSE Real-Time", marketType: "INDIAN", exchange: "NSE" },
    { symbol: "SENSEX", name: "BSE SENSEX", price: "₹75,280.60", rawPrice: 75280.60, change: "+0.68%", isUp: true, high24h: "₹75,450.00", low24h: "₹74,950.00", volume24h: "₹12,200 Cr", timestamp: Date.now(), source: "BSE Real-Time", marketType: "INDIAN", exchange: "BSE" },
    { symbol: "USD/INR", name: "USD / INR", price: "₹86.85", rawPrice: 86.85, change: "+0.12%", isUp: true, high24h: "₹86.98", low24h: "₹86.72", volume24h: "$4.2B", timestamp: Date.now(), source: "Forex / RBI", marketType: "FOREX", exchange: "FOREX" },
    { symbol: "EUR/INR", name: "EUR / INR", price: "₹91.45", rawPrice: 91.45, change: "+0.35%", isUp: true, high24h: "₹91.75", low24h: "₹91.15", volume24h: "$2.8B", timestamp: Date.now(), source: "Forex Interbank", marketType: "FOREX", exchange: "FOREX" },
    { symbol: "RELIANCE", name: "Reliance", price: "₹2,985.40", rawPrice: 2985.40, change: "+2.40%", isUp: true, high24h: "₹3,015.00", low24h: "₹2,940.00", volume24h: "₹2,450 Cr", timestamp: Date.now(), source: "NSE Live", marketType: "INDIAN", exchange: "NSE" },
    { symbol: "TATAMOTORS", name: "Tata Motors", price: "₹988.50", rawPrice: 988.50, change: "+4.85%", isUp: true, high24h: "₹1,012.00", low24h: "₹965.00", volume24h: "₹1,850 Cr", timestamp: Date.now(), source: "NSE Live", marketType: "INDIAN", exchange: "NSE" },
    { symbol: "GBP/INR", name: "GBP / INR", price: "₹109.90", rawPrice: 109.90, change: "+0.48%", isUp: true, high24h: "₹110.35", low24h: "₹109.40", volume24h: "$2.1B", timestamp: Date.now(), source: "Forex Interbank", marketType: "FOREX", exchange: "FOREX" },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: "₹1,648.20", rawPrice: 1648.20, change: "+1.75%", isUp: true, high24h: "₹1,665.00", low24h: "₹1,630.00", volume24h: "₹2,100 Cr", timestamp: Date.now(), source: "NSE Live", marketType: "INDIAN", exchange: "NSE" }
  ]);

  const [lastTickSymbol, setLastTickSymbol] = useState<string | null>(null);

  const fetchLiveTickers = async () => {
    try {
      const data = await fetchTickersApi();
      if (Array.isArray(data) && data.length > 0) {
        setTickers(data);
        const randomSym = data[Math.floor(Math.random() * data.length)]?.symbol;
        setLastTickSymbol(randomSym);
      }
    } catch {
      // Keep existing
    }
  };

  useEffect(() => {
    fetchLiveTickers();
    const interval = setInterval(fetchLiveTickers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#080d18] border-b border-white/5 py-2 px-4 sm:px-8 overflow-x-auto flex items-center gap-6 text-xs no-scrollbar">
      <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19d58b] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#19d58b]"></span>
        </span>
        <span className="font-bold text-[#19d58b] tracking-wider text-[11px]">NSE · BSE · FOREX (₹)</span>
      </div>

      <div className="flex items-center gap-6 sm:gap-8 shrink-0">
        {tickers.map((t, idx) => {
          const isTicking = lastTickSymbol === t.symbol;
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-2.5 transition-all duration-300 px-2.5 py-1 rounded-md ${
                isTicking ? (t.isUp ? 'bg-[#19d58b]/20 shadow-[0_0_10px_rgba(25,213,139,0.3)]' : 'bg-[#ff4e72]/20 shadow-[0_0_10px_rgba(255,78,114,0.3)]') : 'bg-white/[0.02]'
              }`}
            >
              <span className="font-bold text-white tracking-tight">{t.symbol}</span>
              {t.exchange && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-[#8390a6] font-mono">
                  {t.exchange}
                </span>
              )}
              <span className="font-mono font-bold text-[#f3f7ff]">{t.price}</span>
              <span className={`font-mono font-bold flex items-center gap-0.5 text-[11px] ${t.isUp ? 'text-[#19d58b]' : 'text-[#ff4e72]'}`}>
                {t.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {t.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- REUSABLE GOOGLE SEARCH GROUNDING PANEL --- //

function GoogleSearchGroundingPanel({ metadata, title = "Google Search Live Grounding Details" }: { metadata?: SearchMetadata, title?: string }) {
  if (!metadata) return null;

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#0c1626] to-[#070e1b] border border-[#53dcff]/20 p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#53dcff]/10 border border-[#53dcff]/30 flex items-center justify-center text-[#53dcff]">
            <Globe size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 flex items-center gap-1">
                <ShieldCheck size={11} /> Verified Live in ₹
              </span>
            </div>
            <p className="text-xs text-[#8390a6]">Real-time Dalal Street, NSE/BSE & Forex search intelligence</p>
          </div>
        </div>
        {metadata.groundedTime && (
          <div className="text-xs text-[#8390a6] font-mono bg-white/5 px-3 py-1 rounded-md border border-white/5 self-start sm:self-auto flex items-center gap-1.5">
            <Clock size={12} className="text-[#53dcff]" />
            <span>Synced: {metadata.groundedTime} IST</span>
          </div>
        )}
      </div>

      {metadata.queries && metadata.queries.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8390a6] mb-2 flex items-center gap-1.5">
            <SearchCode size={13} className="text-[#53dcff]" /> Grounding Queries Executed on Google:
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.queries.map((q, idx) => (
              <span 
                key={idx} 
                className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[#d8e2f0] flex items-center gap-1.5"
              >
                <Search size={11} className="text-[#53dcff]/70" />
                <span>{q}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {metadata.sources && metadata.sources.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8390a6] mb-2 flex items-center gap-1.5">
            <Layers size={13} className="text-[#19d58b]" /> Verified Market Citations & Source Links:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {metadata.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#53dcff]/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-[#f3f7ff] group-hover:text-[#53dcff] truncate">
                    {src.title}
                  </span>
                  <span className="text-[10px] text-[#8390a6] font-mono truncate">
                    {src.domain}
                  </span>
                </div>
                <ArrowUpRight size={14} className="text-[#8390a6] group-hover:text-[#53dcff] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- TAB 1: UPLOAD & ANALYZE CHART IN ₹ INR --- //

function UploadChartTab() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChartAnalysisResponse | null>(null);
  const [clientValidation, setClientValidation] = useState<ClientImageValidationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isValidatingLocally, setIsValidatingLocally] = useState(false);

  // Helper to create test canvas image files for testing validation rules
  const handleLoadTestImage = async (type: 'blank_white' | 'blank_black' | 'solid_color' | 'valid_candlestick' | 'ui_only') => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'blank_white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (type === 'blank_black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (type === 'solid_color') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (type === 'ui_only') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, 20, 100, 30);
      ctx.fillRect(140, 20, 100, 30);
      ctx.fillRect(20, 350, 600, 40);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('Navigation Dashboard Only — No Price Candles', 150, 200);
    } else if (type === 'valid_candlestick') {
      // Draw realistic candlestick trading chart
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let y = 50; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 60; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Title & Price scale
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('NSE: RELIANCE • 15m • ₹2,985.40', 20, 30);
      ctx.fillText('₹3,040', 580, 70);
      ctx.fillText('₹3,000', 580, 150);
      ctx.fillText('₹2,960', 580, 230);
      ctx.fillText('₹2,920', 580, 310);

      // Candles
      const candleData = [
        { open: 2930, close: 2950, high: 2960, low: 2920 },
        { open: 2950, close: 2940, high: 2955, low: 2935 },
        { open: 2940, close: 2965, high: 2970, low: 2938 },
        { open: 2965, close: 2980, high: 2990, low: 2955 },
        { open: 2980, close: 2975, high: 2988, low: 2970 },
        { open: 2975, close: 2995, high: 3005, low: 2970 },
        { open: 2995, close: 3015, high: 3025, low: 2990 },
        { open: 3015, close: 3010, high: 3020, low: 3000 },
        { open: 3010, close: 3030, high: 3038, low: 3005 },
        { open: 3030, close: 3025, high: 3035, low: 3015 },
        { open: 3025, close: 3045, high: 3050, low: 3020 },
      ];

      const candleW = 24;
      const startX = 50;
      const gap = 46;

      candleData.forEach((c, idx) => {
        const x = startX + idx * gap;
        const isBullish = c.close >= c.open;
        const color = isBullish ? '#10b981' : '#ef4444';
        
        // Map price 2900 - 3060 to Y 330 - 60
        const scaleY = (p: number) => 330 - ((p - 2900) / 160) * 270;
        
        const openY = scaleY(c.open);
        const closeY = scaleY(c.close);
        const highY = scaleY(c.high);
        const lowY = scaleY(c.low);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + candleW / 2, highY);
        ctx.lineTo(x + candleW / 2, lowY);
        ctx.stroke();

        ctx.fillStyle = color;
        const topY = Math.min(openY, closeY);
        const bodyH = Math.max(Math.abs(closeY - openY), 4);
        ctx.fillRect(x, topY, candleW, bodyH);
      });
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const testFile = new File([blob], `test_${type}.png`, { type: 'image/png' });
        setFile(testFile);
        setPreviewUrl(URL.createObjectURL(testFile));
        setResult(null);
        setError('');
        setClientValidation(null);
      }
    }, 'image/png');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError('');
      setClientValidation(null);

      // Instant client-side preliminary scan
      try {
        setIsValidatingLocally(true);
        const diag = await analyzeImagePixelsOnClient(selected);
        setClientValidation(diag);
      } catch {
        // fallback
      } finally {
        setIsValidatingLocally(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setCopied(false);
    
    try {
      // 1. Mandatory Client Validation Check
      const clientMetrics = clientValidation || await analyzeImagePixelsOnClient(file);
      setClientValidation(clientMetrics);

      if (!clientMetrics.isValid || clientMetrics.isUniformOrBlank) {
        // Block immediately with strict validation response — no fake signals
        setResult({
          imageValidation: {
            isValid: false,
            isTradingChart: false,
            chartValidityScore: 0,
            reason: clientMetrics.rejectionReason || 'Unable to analyze this image. Please upload a clear screenshot containing the complete trading chart.',
            rejectionCategory: clientMetrics.isUniformOrBlank ? 'BLANK_IMAGE' : 'NOT_A_CHART'
          },
          signal: {
            status: 'INVALID_CHART',
            direction: null,
            analysisConfidence: 0,
            confidenceExplanation: 'Image rejected by validation filter. Zero chart patterns detected.',
            actionRecommendation: 'INVALID_IMAGE'
          },
          tradePlan: {
            entry: null,
            stopLoss: null,
            target: null,
            riskReward: null,
            levelNotice: 'Cannot reliably determine'
          },
          riskManagement: {
            riskLevel: 'N/A',
            invalidationTriggers: ['Blank or solid color image detected — no trade can be generated.'],
            keyWarning: 'Risk rule: Never execute trades without observable technical structure.'
          },
          warnings: [
            'Unable to analyze this image. Please upload a clear screenshot containing the complete trading chart.'
          ],
          action: 'INVALID',
          entryPrice: 'Cannot reliably determine',
          stopLoss: 'Cannot reliably determine',
          takeProfit: 'Cannot reliably determine',
          confidence: 0,
          error: 'Unable to analyze this image. Please upload a clear screenshot containing the complete trading chart.'
        });
        setLoading(false);
        return;
      }

      // 2. Read Base64 and call server validation pipeline
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64Image = base64Data.split(',')[1];
          
          const data = await analyzeChartApi(base64Image, file.type, clientMetrics);
          setResult(data);
          if (data.imageValidation && !data.imageValidation.isValid) {
            setError(data.imageValidation.reason || 'Unable to analyze this image. Please upload a clear screenshot containing the complete trading chart.');
          }
        } catch (err: any) {
          setError(err.message || 'An error occurred during analysis');
        } finally {
          setLoading(false);
        }
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `VANTA TRADE AI TECHNICAL VERIFICATION REPORT:
Status: ${result.signal?.status || result.action}
Symbol: ${result.chart?.symbol || 'Unknown'} | Timeframe: ${result.chart?.timeframe || 'Unknown'}
Evidence Confidence: ${result.signal?.analysisConfidence || result.confidence}%
Action Recommendation: ${result.signal?.actionRecommendation || result.action}
Entry Level: ${result.tradePlan?.entry || result.entryPrice || 'N/A'}
Stop Loss: ${result.tradePlan?.stopLoss || result.stopLoss || 'N/A'}
Take Profit: ${result.tradePlan?.target || result.takeProfit || 'N/A'}
Market Structure: ${result.analysis?.marketStructure || result.analysis || 'Evaluated'}
Risk Warning: ${result.riskManagement?.keyWarning || 'Trade at your own risk'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInvalidChart = Boolean(
    result && (
      !result.imageValidation?.isValid || 
      result.signal?.status === 'INVALID_CHART' || 
      result.action === 'INVALID'
    )
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-7 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">Trading Chart Verification & Scanner</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 rounded-full">
              Anti-Hallucination Active
            </span>
          </div>
          <p className="text-[#8390a6] text-sm">
            Upload any Indian stock (NSE/BSE) or Forex chart. The system rigorously validates the screenshot first and will reject blank, corrupted, or non-trading images without forced signals.
          </p>
        </div>

        {/* Quick Test Presets Bar */}
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#8390a6] font-semibold flex items-center gap-1 mr-1">
            <Eye size={14} className="text-[#53dcff]" /> Quick Validation Tests:
          </span>
          <button
            onClick={() => handleLoadTestImage('valid_candlestick')}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 hover:bg-[#19d58b]/25 transition cursor-pointer font-medium"
          >
            ✓ Valid NSE Chart
          </button>
          <button
            onClick={() => handleLoadTestImage('blank_white')}
            className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer font-medium"
          >
            ✗ Blank White
          </button>
          <button
            onClick={() => handleLoadTestImage('blank_black')}
            className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer font-medium"
          >
            ✗ Blank Black
          </button>
          <button
            onClick={() => handleLoadTestImage('solid_color')}
            className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer font-medium"
          >
            ✗ Solid Color
          </button>
          <button
            onClick={() => handleLoadTestImage('ui_only')}
            className="px-2.5 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition cursor-pointer font-medium"
          >
            ✗ UI Without Candles
          </button>
        </div>

        {/* Dropzone Container */}
        <div className="border-2 border-dashed border-white/10 hover:border-[#19d58b]/50 rounded-3xl p-6 text-center transition-all bg-[#0b1220]/50 relative group flex flex-col items-center justify-center min-h-[280px]">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {previewUrl ? (
            <div className="relative w-full h-full max-h-[340px] flex items-center justify-center">
              <img src={previewUrl} alt="Chart preview" className="max-h-[320px] rounded-xl object-contain shadow-2xl border border-white/10" />
              <div className="absolute bottom-2 right-2 bg-black/80 px-3 py-1 rounded-lg text-xs backdrop-blur-md border border-white/10 text-[#8390a6]">
                Click or Drop new image to change
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#19d58b] group-hover:scale-110 transition-transform">
                <Upload size={26} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Drag & drop Indian Stock / Forex chart</h4>
                <p className="text-xs text-[#8390a6] mt-1 max-w-md mx-auto">
                  Upload screenshot from TradingView, Zerodha Kite, Groww, AngelOne, or MT4/MT5 with visible candlesticks and price scale.
                </p>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white">
                Browse Files
              </span>
            </div>
          )}
        </div>

        {/* Validation Diagnostic Tag */}
        {clientValidation && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            clientValidation.isValid && !clientValidation.isUniformOrBlank 
              ? 'bg-[#19d58b]/10 border-[#19d58b]/30 text-[#19d58b]' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {clientValidation.isValid && !clientValidation.isUniformOrBlank ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
              <span>
                {clientValidation.isValid && !clientValidation.isUniformOrBlank
                  ? 'Visual contrast & pixel structure verified (Trading chart candidate)'
                  : clientValidation.rejectionReason}
              </span>
            </div>
            <span className="font-mono text-[11px] opacity-80">
              Entropy: {clientValidation.variance.toFixed(0)} | Edge: {(clientValidation.edgeDensity * 100).toFixed(1)}%
            </span>
          </div>
        )}

        <button 
          id="analyze-chart-btn"
          onClick={handleAnalyze} 
          disabled={!file || loading}
          className="w-full py-4 bg-gradient-to-r from-[#19d58b] to-[#15b877] text-[#04100d] font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(25,213,139,0.2)] cursor-pointer"
        >
          {loading ? (
            <><RefreshCw className="animate-spin" size={20} /> Validating & Scanning Chart Structure...</>
          ) : (
            <><Sparkles size={20} /> Verify & Analyze Chart</>
          )}
        </button>
      </div>

      {/* Right Column: Dynamic Analysis Output or Rejection Warning Card */}
      <div className="lg:col-span-5">
        {!result && !loading && (
          <div className="h-full min-h-[320px] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-[#8390a6] bg-[#0b1220]/40">
            <BarChart2 size={44} className="mb-3 text-white/20" />
            <h3 className="text-lg font-medium text-white mb-2">Technical Terminal Ready</h3>
            <p className="text-sm max-w-sm">
              Upload any chart to trigger the 4-stage validation pipeline: pixel entropy check, chart feature verification, multi-factor technical analysis, and risk invalidation plan.
            </p>
          </div>
        )}

        {loading && (
          <div className="h-full min-h-[320px] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-[#0b1220]/40 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-[#19d58b] border-t-transparent animate-spin mb-4"></div>
            <h3 className="text-lg font-medium text-white mb-2">Stage 1-4 Verification Pipeline</h3>
            <p className="text-xs text-[#8390a6] max-w-xs">
              Filtering out blank/solid images • Verifying candle edges & price scale • Evaluating market structure • Calculating risk levels...
            </p>
          </div>
        )}

        {/* CASE A: INVALID / BLANK / NON-CHART IMAGE REJECTION WARNING CARD */}
        {isInvalidChart && result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#180b0f] border border-red-500/40 rounded-3xl p-6 lg:p-7 space-y-5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <ShieldAlert size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Chart Could Not Be Analyzed</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 rounded-full">
                    {result.imageValidation?.rejectionCategory || 'REJECTED'}
                  </span>
                </div>
                <p className="text-red-300/90 text-sm font-medium mt-1">
                  {result.imageValidation?.reason || 'Unable to analyze this image. Please upload a clear screenshot containing the complete trading chart.'}
                </p>
              </div>
            </div>

            {/* Strict Anti-Hallucination Guarantees */}
            <div className="p-3.5 bg-black/40 rounded-2xl border border-red-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
                <FileWarning size={15} className="text-red-400" />
                <span>Zero Signal Guarantee</span>
              </div>
              <p className="text-xs text-[#b8a2a8] leading-relaxed">
                The anti-hallucination engine strictly blocks trade signals (BUY/SELL) whenever an image is blank, solid color, corrupted, or lacking observable price action.
              </p>
            </div>

            {/* Checklist of what is required */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Screenshot Requirements:</h4>
              <div className="space-y-1.5 text-xs text-[#b8a2a8]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#19d58b] shrink-0" />
                  <span>Visible candlestick, bar, or line chart geometry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#19d58b] shrink-0" />
                  <span>Clear price scale (Y-axis) and timeframe markers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#19d58b] shrink-0" />
                  <span>Sufficient contrast against the chart background</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={13} className="text-red-400 shrink-0" />
                  <span>No blank white/black screens or UI-only dashboards</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setResult(null);
                setClientValidation(null);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/10 transition cursor-pointer"
            >
              Upload Another Screenshot
            </button>
          </motion.div>
        )}

        {/* CASE B: VALID TRADING CHART ANALYSIS RESULT CARD */}
        {!isInvalidChart && result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b1220]/90 border border-white/10 rounded-3xl p-6 lg:p-7 space-y-5 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent"></div>
            
            {/* Header: Verified Info & Identified Metadata */}
            <div className="flex justify-between items-start pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#19d58b]/20 text-[#19d58b] border border-[#19d58b]/40 rounded-md">
                    ✓ VERIFIED TRADING CHART
                  </span>
                  {result.chart?.exchangeOrPlatform && result.chart.exchangeOrPlatform !== 'Unknown' && (
                    <span className="text-[10px] text-[#8390a6] font-mono">
                      {result.chart.exchangeOrPlatform}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-black text-white">
                    {result.chart?.symbol || 'NSE / FOREX'}
                  </h3>
                  <span className="text-xs text-[#8390a6] font-mono">
                    Timeframe: {result.chart?.timeframe || 'Observed'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#8390a6] uppercase tracking-wider font-semibold">Evidence Confidence</span>
                <div className="text-2xl font-black font-mono text-white">
                  {result.signal?.analysisConfidence ?? result.confidence}%
                </div>
                <span className="text-[9px] text-[#8390a6] block">Factor consistency</span>
              </div>
            </div>

            {/* Signal Recommendation Status Pill */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8390a6] uppercase font-semibold">Signal Setup Status</span>
                <div className="text-sm font-extrabold mt-0.5">
                  <SignalStatusBadge status={result.signal?.status || 'NO_SIGNAL'} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8390a6] uppercase font-semibold">Action Target</span>
                <div className="text-sm font-bold font-mono text-[#53dcff]">
                  {result.signal?.actionRecommendation || result.action || 'WAIT_NO_TRADE'}
                </div>
              </div>
            </div>

            {/* Trade Plan Setup Numbers */}
            <div className="space-y-2">
              <SignalRow 
                label="Suggested Entry Zone" 
                value={result.tradePlan?.entry || result.entryPrice || 'Cannot reliably determine'} 
                type="neutral" 
              />
              <SignalRow 
                label="Stop Loss Level" 
                value={result.tradePlan?.stopLoss || result.stopLoss || 'Cannot reliably determine'} 
                type="danger" 
              />
              <SignalRow 
                label="Take Profit Target" 
                value={result.tradePlan?.target || result.takeProfit || 'Cannot reliably determine'} 
                type="success" 
              />
              {result.tradePlan?.riskReward && (
                <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl text-xs text-[#8390a6]">
                  <span>Risk / Reward Ratio</span>
                  <span className="font-mono font-bold text-white">{result.tradePlan.riskReward}</span>
                </div>
              )}
            </div>

            {/* Multi-Factor Technical Breakdown */}
            {result.analysis && typeof result.analysis === 'object' && (
              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#8390a6]">
                  <span className="font-semibold text-white">Trend:</span>
                  <span className="font-mono text-[#19d58b]">{result.analysis.trend}</span>
                </div>
                <div className="flex justify-between items-center text-[#8390a6]">
                  <span className="font-semibold text-white">Market Structure:</span>
                  <span className="text-right text-[#c9d2e2] max-w-[240px] truncate">{result.analysis.marketStructure}</span>
                </div>
                {result.analysis.supportLevels && result.analysis.supportLevels.length > 0 && (
                  <div className="flex justify-between items-center text-[#8390a6]">
                    <span className="font-semibold text-white">Key Support:</span>
                    <span className="font-mono text-[#53dcff]">{result.analysis.supportLevels.join(', ')}</span>
                  </div>
                )}
                {result.analysis.resistanceLevels && result.analysis.resistanceLevels.length > 0 && (
                  <div className="flex justify-between items-center text-[#8390a6]">
                    <span className="font-semibold text-white">Key Resistance:</span>
                    <span className="font-mono text-amber-300">{result.analysis.resistanceLevels.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Visible Indicators Disclosed (Anti-Hallucination) */}
            {result.chart?.visibleIndicators && result.chart.visibleIndicators.length > 0 && (
              <div className="text-xs">
                <span className="text-[#8390a6] text-[11px] block mb-1">Visible Indicators Detected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.chart.visibleIndicators.map((ind, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-[#c9d2e2]">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Disclaimer */}
            {result.riskManagement && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Shield size={14} />
                  <span>Risk Management Notice ({result.riskManagement.riskLevel} Risk)</span>
                </div>
                <p className="text-[#d8b4bc] text-[11px] leading-relaxed">
                  {result.riskManagement.keyWarning}
                </p>
              </div>
            )}
            
            {/* Copy Button */}
            <div className="pt-2">
              <button 
                onClick={handleCopyReport}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/10 text-white hover:bg-white/15 border border-white/10 text-xs"
              >
                {copied ? (
                  <><Check size={16} className="text-[#19d58b]" /> <span className="text-[#19d58b]">Report Copied to Clipboard</span></>
                ) : (
                  <><Copy size={16} /> Copy Verification Report</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function SignalStatusBadge({ status }: { status: ChartSignalStatus | string }) {
  if (status === 'STRONG_POSSIBLE_BULLISH_SETUP') {
    return <span className="text-[#19d58b]">Strong Bullish Setup</span>;
  }
  if (status === 'POSSIBLE_BULLISH_SETUP') {
    return <span className="text-[#19d58b]">Possible Bullish Setup</span>;
  }
  if (status === 'STRONG_POSSIBLE_BEARISH_SETUP') {
    return <span className="text-[#ff4e72]">Strong Bearish Setup</span>;
  }
  if (status === 'POSSIBLE_BEARISH_SETUP') {
    return <span className="text-[#ff4e72]">Possible Bearish Setup</span>;
  }
  if (status === 'NEUTRAL_WAIT') {
    return <span className="text-amber-400">Neutral / Consolidation (Wait)</span>;
  }
  if (status === 'INVALID_CHART') {
    return <span className="text-red-400">Invalid Chart</span>;
  }
  return <span className="text-[#8390a6]">No Signal (Insufficient Evidence)</span>;
}

function SignalRow({ label, value, type }: { label: string, value: string, type: 'success' | 'danger' | 'neutral' }) {
  const colors = {
    success: 'text-[#19d58b] bg-[#19d58b]/10 border-[#19d58b]/20',
    danger: 'text-[#ff4e72] bg-[#ff4e72]/10 border-[#ff4e72]/20',
    neutral: 'text-[#53dcff] bg-[#53dcff]/10 border-[#53dcff]/20',
  };
  
  return (
    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
      <span className="text-[#8390a6] font-medium">{label}</span>
      <span className={`font-mono font-bold px-2.5 py-1 rounded border ${colors[type]}`}>{value}</span>
    </div>
  );
}


// --- TAB 2: TOP MOVERS COMBINING INDIAN EQUITIES & FOREX --- //

function TopMoversTab({ onSelectStock }: { onSelectStock?: (symbol: string) => void }) {
  const [movers, setMovers] = useState<TopMoverItem[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'indian' | 'forex'>('all');

  const fetchMovers = async (isManual: boolean = false, category: string = categoryFilter) => {
    if (isManual) setLoading(true);
    setError('');
    try {
      const data: TopMoversResponse = await fetchTopMoversApi(category);
      
      if (data && Array.isArray(data.movers)) {
        setMovers(data.movers);
        setSearchMetadata(data.searchMetadata);
        setLastRefreshed(new Date().toLocaleTimeString('en-IN'));
      } else if (Array.isArray(data)) {
        setMovers(data);
        setLastRefreshed(new Date().toLocaleTimeString('en-IN'));
      } else {
        setError('Failed to fetch movers data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovers(true, categoryFilter);
    const interval = setInterval(() => {
      fetchMovers(false, categoryFilter);
    }, 4000);
    return () => clearInterval(interval);
  }, [categoryFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2 className="text-2xl font-bold">Top Market Movers</h2>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(25,213,139,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19d58b] animate-ping"></span>
              Priced in ₹ (INR)
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#53dcff]/15 text-[#53dcff] border border-[#53dcff]/30 rounded-full flex items-center gap-1">
              <Sparkles size={11} /> Real Verified Feeds
            </span>
          </div>
          <p className="text-[#8390a6] text-sm">Combined live radar of highest percentage gainers in Indian Equities (NSE/BSE) and Forex currency pairs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Category Filter Pills */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'all' ? 'bg-[#19d58b] text-[#04100d]' : 'text-[#8390a6] hover:text-white'
              }`}
            >
              ALL MARKETS
            </button>
            <button
              onClick={() => setCategoryFilter('indian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'indian' ? 'bg-[#19d58b] text-[#04100d]' : 'text-[#8390a6] hover:text-white'
              }`}
            >
              INDIAN STOCKS (NSE)
            </button>
            <button
              onClick={() => setCategoryFilter('forex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'forex' ? 'bg-[#19d58b] text-[#04100d]' : 'text-[#8390a6] hover:text-white'
              }`}
            >
              FOREX (₹ INR)
            </button>
          </div>

          <button 
            id="refresh-movers-btn"
            onClick={() => fetchMovers(true, categoryFilter)} 
            disabled={loading}
            className="px-5 py-2 bg-[#19d58b] text-[#04100d] font-bold rounded-xl hover:bg-[#15b877] transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(25,213,139,0.2)] text-sm"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
            {loading ? 'Matching...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading && movers.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-6 rounded-3xl bg-[#0b1220]/80 border border-white/10 h-[220px] animate-pulse">
               <div className="flex justify-between mb-3">
                 <div className="h-6 bg-white/10 rounded w-20"></div>
                 <div className="h-6 bg-white/10 rounded w-16"></div>
               </div>
               <div className="h-4 bg-white/5 rounded w-32 mb-4"></div>
               <div className="h-12 bg-white/5 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {movers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {movers.map((mover, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-3xl bg-[#0b1220]/80 border border-white/10 hover:border-[#19d58b]/40 hover:bg-[#0e172a] transition-all relative overflow-hidden group flex flex-col justify-between shadow-lg"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStock?.(mover.symbol)}
                          className="text-2xl font-black tracking-tight text-white hover:text-[#19d58b] transition-colors cursor-pointer text-left"
                        >
                          {mover.symbol}
                        </button>
                        {mover.exchange && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#8390a6] font-mono">
                            {mover.exchange}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8390a6] truncate font-medium">{mover.name}</p>
                    </div>
                    <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-sm flex items-center gap-1 shadow-sm ${
                      mover.isPositive 
                        ? 'bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30' 
                        : 'bg-[#ff4e72]/15 text-[#ff4e72] border border-[#ff4e72]/30'
                    }`}>
                      {mover.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {mover.changeStr}
                    </span>
                  </div>
                  
                  {/* Real-time matched price banner in INR */}
                  <div className="my-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8390a6] uppercase tracking-wider font-semibold block">Live Price (₹ INR)</span>
                      <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{mover.price}</span>
                    </div>
                    <div className="text-right text-xs">
                      {mover.high24h && (
                        <div className="text-[#8390a6] text-[11px] font-mono">
                          H: <span className="text-white font-medium">{mover.high24h}</span>
                        </div>
                      )}
                      {mover.low24h && (
                        <div className="text-[#8390a6] text-[11px] font-mono">
                          L: <span className="text-white font-medium">{mover.low24h}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-[#c9d2e2] leading-relaxed border-t border-white/5 pt-3 mb-3">
                    {mover.reason}
                  </div>

                  {/* Section 11: Real Verified News Attachment */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 mb-3 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] uppercase font-bold text-[#8390a6] flex items-center gap-1">
                        <Newspaper size={11} className="text-[#53dcff]" /> Company News Context
                      </span>
                      {mover.hasVerifiedNews && mover.newsSentiment && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                          mover.newsSentiment === 'POSITIVE' ? 'bg-[#19d58b]/20 text-[#19d58b]' :
                          mover.newsSentiment === 'NEGATIVE' ? 'bg-[#ff4e72]/20 text-[#ff4e72]' : 'bg-white/10 text-white'
                        }`}>
                          {mover.newsSentiment}
                        </span>
                      )}
                    </div>
                    
                    {mover.hasVerifiedNews ? (
                      <div>
                        <p className="font-semibold text-white leading-snug line-clamp-2 mb-1">
                          {mover.newsHeadline}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#8390a6]">
                          <span>{mover.newsSource}</span>
                          {mover.newsPublishedAt && <span>{mover.newsPublishedAt}</span>}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#8390a6] text-[11px] italic">
                        No verified recent company-specific news found.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => onSelectStock?.(mover.symbol)}
                    className="px-3 py-1 bg-white/5 hover:bg-[#19d58b]/20 hover:text-[#19d58b] border border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight size={12} />
                  </button>

                  <div className="flex items-center gap-2">
                    {mover.sourceUrl ? (
                      <a 
                        href={mover.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[11px] text-[#8390a6] hover:text-[#19d58b] flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>Quote</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/finance/quote/${mover.symbol}:NSE`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#8390a6] hover:text-[#19d58b] flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>NSE Quote</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Google Search Grounding Details Module */}
          <GoogleSearchGroundingPanel 
            metadata={searchMetadata} 
            title="Verified Feed Sources for Indian & Forex Movers" 
          />
        </>
      )}
    </motion.div>
  );
}

// --- TAB 3: CUSTOM INDIAN STOCKS & FOREX SEARCH WITH INR (₹) PRICING --- //

function CustomStocksTab({ initialQuery }: { initialQuery?: string }) {
  const [queryInput, setQueryInput] = useState(initialQuery || 'RELIANCE');
  const [result, setResult] = useState<StockAnalysisResponse | null>(null);
  const [livePriceData, setLivePriceData] = useState<LiveQuote | null>(null);
  const [verifiedStockNews, setVerifiedStockNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
    const q = initialQuery || 'RELIANCE';
    setQueryInput(q);
    handleAnalyze(q);
  }, [initialQuery]);

  // Poll live price for the actively selected stock every 3 seconds to keep price live
  useEffect(() => {
    if (!result?.symbol) return;
    
    const pollActiveLivePrice = async () => {
      try {
        const sym = result.symbol.replace('/INR', '');
        const quotes = await fetchLiveQuotesApi(sym);
        if (quotes && (quotes[sym] || quotes[result.symbol])) {
          const latestQuote = quotes[sym] || quotes[result.symbol];
          setLivePriceData(latestQuote);
        }
      } catch {
        // keep existing
      }
    };

    const interval = setInterval(pollActiveLivePrice, 3000);
    return () => clearInterval(interval);
  }, [result?.symbol]);

  const fetchHistory = () => {
    try {
      const saved = localStorage.getItem('vantatrade_search_history_inr');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const saveToHistory = (resData: any, searchQuery: string) => {
    try {
      const newItem = {
        id: Date.now().toString(),
        query: searchQuery,
        symbol: resData.symbol || searchQuery,
        result: JSON.stringify(resData),
        createdAt: new Date().toISOString()
      };
      setHistory(prev => {
        const filtered = prev.filter(p => (p.symbol || p.query).toLowerCase() !== newItem.symbol.toLowerCase());
        const updated = [newItem, ...filtered].slice(0, 8);
        localStorage.setItem('vantatrade_search_history_inr', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Failed to save search', err);
    }
  };

  const handleAnalyze = async (searchQuery: string = queryInput) => {
    if (!searchQuery.trim()) {
      setError('Please enter an Indian stock (e.g. RELIANCE, TATAMOTORS) or Forex pair (e.g. USD/INR)');
      return;
    }

    setQueryInput(searchQuery);
    setLoading(true);
    setError('');
    
    try {
      const cleanQ = searchQuery.trim();
      const sym = cleanQ.toUpperCase().replace('.NS', '').replace('.BO', '');

      const [data, newsArticles] = await Promise.all([
        analyzeStocksApi(cleanQ),
        fetchStockNewsApi(sym).catch(() => [])
      ]);

      if (data && !('error' in (data as any))) {
        setResult(data);
        setVerifiedStockNews(newsArticles || []);
        if (data.liveQuote) {
          setLivePriceData(data.liveQuote);
        }
        saveToHistory(data, cleanQ);
      } else {
        setError((data as any)?.error || 'Failed to analyze asset');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item: any) => {
    try {
      const parsed = JSON.parse(item.result);
      setResult(parsed);
      if (parsed.liveQuote) {
        setLivePriceData(parsed.liveQuote);
      }
      setQueryInput(item.query || item.symbol);
    } catch (err) {
      console.error("Failed to parse history item", err);
    }
  };

  const quickPicks = [
    { label: "RELIANCE", type: "NSE" },
    { label: "TATAMOTORS", type: "NSE" },
    { label: "USD/INR", type: "FOREX" },
    { label: "HDFCBANK", type: "NSE" },
    { label: "EUR/INR", type: "FOREX" },
    { label: "NIFTY 50", type: "NSE" },
    { label: "TCS", type: "NSE" },
    { label: "GBP/INR", type: "FOREX" },
    { label: "ADANIENT", type: "NSE" },
    { label: "ZOMATO", type: "NSE" },
  ];

  const currentDisplayPrice = livePriceData?.price || result?.currentPrice;
  const currentDisplayChange = livePriceData?.change || result?.changeStr;
  const isUp = livePriceData ? livePriceData.isUp : (result?.isPositive ?? true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-2.5 mb-2">
          <h2 className="text-3xl font-bold">Indian Stock & Forex Market Intelligence</h2>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(25,213,139,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#19d58b] animate-ping"></span>
            INR (₹) Matched
          </span>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-[#53dcff]/15 text-[#53dcff] border border-[#53dcff]/30 rounded-full flex items-center gap-1">
            <Globe size={13} /> Google Grounded
          </span>
        </div>
        <p className="text-[#8390a6] mb-6">Enter any Indian equity (NSE/BSE), NIFTY/SENSEX index, or Forex currency pair to match real-time live trading prices in Indian Rupees (INR ₹), fundamentals, technical levels, and future profitability analysis.</p>
        
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8390a6]" size={20} />
            <input 
              id="stock-search-input"
              type="text" 
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. RELIANCE, TATAMOTORS, USD/INR, HDFCBANK, NIFTY 50, EUR/INR, TCS"
              className="w-full pl-12 pr-4 py-4 text-white border border-white/10 rounded-2xl outline-none bg-[#0b1220]/80 focus:border-[#19d58b] focus:ring-2 focus:ring-[#19d58b]/20 transition-all font-mono text-lg shadow-inner"
            />
          </div>
          <button 
            id="stock-search-submit-btn"
            onClick={() => handleAnalyze()}
            disabled={loading || !queryInput.trim()}
            className="px-8 py-4 bg-gradient-to-r from-[#19d58b] to-[#15b877] text-[#04100d] font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(25,213,139,0.2)] cursor-pointer"
          >
            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
            {loading ? 'Matching in ₹...' : 'Search in ₹ (INR)'}
          </button>
        </div>

        {/* Quick Picks for Indian Stocks & Forex */}
        <div className="mb-4">
          <span className="text-xs text-[#8390a6] uppercase tracking-wider font-semibold mb-2 block">Quick Market Picks (NSE / BSE / FOREX)</span>
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((pick, i) => (
              <button
                key={i}
                onClick={() => handleAnalyze(pick.label)}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#c9d2e2] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{pick.label}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#19d58b]/15 text-[#19d58b] font-mono">
                  {pick.type}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {history.length > 0 && (
          <div className="mb-8">
            <span className="text-xs text-[#8390a6] uppercase tracking-wider font-semibold mb-2 block">Recent Searches</span>
            <div className="flex flex-wrap gap-2">
              {history.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleHistoryClick(item)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#c9d2e2] hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Search size={10} /> {item.symbol || item.query}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}
      </div>

      {loading && !result && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0b1220]/50 border border-white/5 rounded-3xl p-8 animate-pulse text-center space-y-6 py-20 flex flex-col items-center">
            <RefreshCw size={40} className="animate-spin text-[#19d58b]/50" />
            <div className="text-xl text-[#8390a6] font-medium tracking-wide">
              Matching real-time NSE/BSE & Forex trading price and querying Google Grounding intelligence for {queryInput} in ₹ INR...
            </div>
          </div>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 lg:p-10 hover:border-white/20 transition-all relative overflow-hidden shadow-2xl space-y-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent"></div>
          
          {/* Header Row with matched real-time live price */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-5xl font-black tracking-tight">{result.symbol}</h3>
                <span className="px-3.5 py-1.5 bg-white/5 rounded-xl text-sm font-semibold text-[#8390a6] uppercase tracking-wider">{result.name}</span>
                {result.exchange && (
                  <span className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-xs font-mono font-bold">
                    {result.exchange}
                  </span>
                )}
                <span className="px-3 py-1 bg-[#19d58b]/10 text-[#19d58b] border border-[#19d58b]/20 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(25,213,139,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-[#19d58b] animate-ping"></span>
                  Live Matched (₹ INR)
                </span>
              </div>

              {/* Price & 24h stats */}
              <div className="flex flex-wrap items-baseline gap-4 mt-2">
                <div className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tighter">
                  {currentDisplayPrice}
                </div>
                {currentDisplayChange && (
                  <div className={`text-lg font-mono font-bold px-3 py-1 rounded-xl flex items-center gap-1 ${
                    isUp ? 'text-[#19d58b] bg-[#19d58b]/10 border border-[#19d58b]/30' : 'text-[#ff4e72] bg-[#ff4e72]/10 border border-[#ff4e72]/30'
                  }`}>
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {currentDisplayChange}
                  </div>
                )}
              </div>

              {/* 24h Metrics Bar */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#8390a6] font-mono">
                {livePriceData?.high24h && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    24h High: <strong className="text-white">{livePriceData.high24h}</strong>
                  </span>
                )}
                {livePriceData?.low24h && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    24h Low: <strong className="text-white">{livePriceData.low24h}</strong>
                  </span>
                )}
                {livePriceData?.volume24h && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                    24h Volume / Turnover: <strong className="text-white">{livePriceData.volume24h}</strong>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-8 py-6 rounded-2xl flex flex-col items-center justify-center min-w-[160px] ${
                result.signal === 'BUY' ? 'bg-[#19d58b]/10 text-[#19d58b] border border-[#19d58b]/20 shadow-[0_0_30px_rgba(25,213,139,0.15)]' : 
                result.signal === 'SELL' ? 'bg-[#ff4e72]/10 text-[#ff4e72] border border-[#ff4e72]/20 shadow-[0_0_30px_rgba(255,78,114,0.15)]' : 
                'bg-white/10 text-white border border-white/20'
              }`}>
                <span className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-1">AI SIGNAL</span>
                <span className="text-4xl font-black tracking-tighter">{result.signal}</span>
              </div>
            </div>
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#19d58b]/5 p-6 rounded-2xl border border-[#19d58b]/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#19d58b]"></div>
              <h4 className="text-sm font-bold text-[#19d58b] uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={18} /> Future Profitability Analysis (₹)
              </h4>
              <p className="text-[#c9d2e2] leading-relaxed text-[1.02rem]">
                {result.futureProfitability}
              </p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-[#53dcff] uppercase tracking-widest mb-3 flex items-center gap-2">
                <BarChart2 size={18} /> Technical & Volume Breakdown
              </h4>
              <p className="text-[#c9d2e2] leading-relaxed">
                {result.analysis}
              </p>
            </div>
          </div>

          {/* Section 11: Verified Real-Time Company News Intelligence Layer */}
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Newspaper size={16} className="text-[#19d58b]" />
                Fundamental & Event News Context ({result.symbol})
              </h4>
              <span className="text-xs text-[#8390a6] font-mono">
                {verifiedStockNews.length > 0 ? `${verifiedStockNews.length} Verified Stories` : 'Verified Multi-Source Stream'}
              </span>
            </div>

            {verifiedStockNews.length > 0 ? (
              <div className="space-y-3">
                {verifiedStockNews.map((art) => (
                  <div 
                    key={art.id} 
                    className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#53dcff] font-semibold">{art.sourceName}</span>
                        <span className="text-[#8390a6] font-mono">{art.publishedTimeFormatted}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {art.potentialImpact && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-[#8390a6]">
                            {art.potentialImpact} Impact
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                          art.sentiment === 'POSITIVE' ? 'bg-[#19d58b]/20 text-[#19d58b]' :
                          art.sentiment === 'NEGATIVE' ? 'bg-[#ff4e72]/20 text-[#ff4e72]' :
                          'bg-white/10 text-white'
                        }`}>
                          {art.sentiment}
                        </span>
                      </div>
                    </div>

                    <h5 className="text-sm font-bold text-white">{art.headline}</h5>
                    <p className="text-xs text-[#8390a6] leading-relaxed">{art.summary}</p>
                    
                    {art.whyItMatters && (
                      <div className="text-[11px] text-[#c9d2e2] bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <strong className="text-[#53dcff]">Why It Matters:</strong> {art.whyItMatters}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <a 
                        href={art.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[#19d58b] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Original Article</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-[#8390a6]">
                <Info size={16} className="inline mr-1.5 text-[#53dcff]" />
                No verified breaking company-specific news found in the last 24 hours. The signal is driven primarily by quantitative technicals and exchange price action.
              </div>
            )}
          </div>

          {/* Company details & Direct Indian / Forex Sources */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h4 className="text-sm font-bold text-[#8390a6] uppercase tracking-widest flex items-center gap-2">
                <Globe size={16} className="text-[#53dcff]" /> Company & Exchange Background
              </h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.moneycontrol.com/india/stockpricequote/${result.symbol.toLowerCase()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#8390a6] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Moneycontrol</span>
                  <ExternalLink size={11} />
                </a>
                <a
                  href={`https://www.google.com/finance/quote/${result.symbol}:NSE`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#8390a6] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Google Finance (NSE)</span>
                  <ExternalLink size={11} />
                </a>
                <a
                  href={`https://economictimes.indiatimes.com/marketstats/top-gainers.cms`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#8390a6] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Economic Times</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
            <p className="text-[#c9d2e2] leading-relaxed text-sm">{result.companyDetails}</p>
          </div>
          
          {/* Targets Matched to Live Price */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold text-[#8390a6] tracking-wider flex items-center gap-1.5">
                <Zap size={13} className="text-[#19d58b]" /> Calculated Live Trade Levels in ₹ (INR)
              </span>
              <span className="text-[11px] font-mono text-[#8390a6]">
                Matched against current quote: {currentDisplayPrice}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#050811] rounded-2xl p-5 border border-white/10 text-center shadow-inner">
                <span className="block text-xs font-semibold text-[#8390a6] uppercase tracking-widest mb-1.5">Suggested Entry Target</span>
                <span className="font-mono text-xl font-bold text-white">{result.entry}</span>
              </div>
              <div className="bg-[#050811] rounded-2xl p-5 border border-white/10 text-center shadow-inner">
                <span className="block text-xs font-semibold text-[#8390a6] uppercase tracking-widest mb-1.5">Stop Loss Target (₹)</span>
                <span className="font-mono text-xl font-bold text-[#ff4e72]">{result.stopLoss}</span>
              </div>
              <div className="bg-[#050811] rounded-2xl p-5 border border-white/10 text-center shadow-inner">
                <span className="block text-xs font-semibold text-[#8390a6] uppercase tracking-widest mb-1.5">Take Profit Target (₹)</span>
                <span className="font-mono text-xl font-bold text-[#19d58b]">{result.takeProfit}</span>
              </div>
            </div>
          </div>

          {/* Google Search Grounding Details & Sources */}
          <GoogleSearchGroundingPanel 
            metadata={result.searchMetadata} 
            title={`Verified Feed Sources for ${result.symbol} (INR ₹)`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// --- TAB 4: GLOBAL MARKET NEWS INTELLIGENCE --- //

function NewsTab({ onSelectStock }: { onSelectStock?: (symbol: string) => void }) {
  return <NewsIntelligenceView onSelectStock={onSelectStock} />;
}
