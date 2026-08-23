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
  DollarSign
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
  LiveQuote
} from '../types';

export default function Dashboard({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<'upload' | 'movers' | 'custom' | 'news'>('upload');

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
          <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Newspaper size={16} />} label="MARKET NEWS" />
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
        <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Newspaper size={16} />} label="News" />
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {activeTab === 'upload' && <UploadChartTab />}
        {activeTab === 'movers' && <TopMoversTab />}
        {activeTab === 'custom' && <CustomStocksTab />}
        {activeTab === 'news' && <NewsTab />}
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
      const res = await fetch('/api/tickers');
      const data = await res.json();
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
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setCopied(false);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Image = base64Data.split(',')[1];
        
        const response = await fetch('/api/analyze-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Image,
            mimeType: file.type,
          }),
        });

        const data: ChartAnalysisResponse = await response.json();
        if (data && !('error' in data)) {
          setResult(data);
        } else {
          setError((data as any)?.error || 'Analysis failed. Please try another chart image.');
        }
        setLoading(false);
      };
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `VANTA TRADE AI SIGNAL (INR ₹):
Action: ${result.action}
Confidence: ${result.confidence}%
Entry: ${result.entryPrice}
Stop Loss: ${result.stopLoss}
Take Profit: ${result.takeProfit}
Reasoning: ${result.analysis}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-7 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">Indian Stock & Forex Chart Scanner</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 rounded-full">
              ₹ INR Price Action
            </span>
          </div>
          <p className="text-[#8390a6] text-sm">Upload any Indian stock (NSE/BSE), Forex currency pair (USD/INR, EUR/INR), or crypto chart for instant AI pattern recognition and entry/exit targets.</p>
        </div>

        <div className="border-2 border-dashed border-white/10 hover:border-[#19d58b]/50 rounded-3xl p-8 text-center transition-all bg-[#0b1220]/50 relative group flex flex-col items-center justify-center min-h-[300px]">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {previewUrl ? (
            <div className="relative w-full h-full max-h-[360px] flex items-center justify-center">
              <img src={previewUrl} alt="Chart preview" className="max-h-[340px] rounded-xl object-contain shadow-2xl border border-white/10" />
              <div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded-lg text-xs backdrop-blur-md border border-white/10">
                Click or Drop new image to change
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#19d58b] group-hover:scale-110 transition-transform">
                <Upload size={28} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Drag & drop Indian Stock / Forex chart</h4>
                <p className="text-xs text-[#8390a6] mt-1">Supports PNG, JPG, WEBP screenshots from TradingView, Zerodha Kite, Groww, AngelOne, or MT4/MT5</p>
              </div>
              <span className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white">
                Browse Files
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <button 
          id="analyze-chart-btn"
          onClick={handleAnalyze} 
          disabled={!file || loading}
          className="w-full py-4 bg-gradient-to-r from-[#19d58b] to-[#15b877] text-[#04100d] font-bold rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(25,213,139,0.2)] cursor-pointer"
        >
          {loading ? (
            <><RefreshCw className="animate-spin" size={20} /> Analyzing Price Action in ₹...</>
          ) : (
            <><Sparkles size={20} /> Generate AI Signal in ₹ (INR)</>
          )}
        </button>
      </div>

      <div className="lg:col-span-5">
        {!result && !loading && (
          <div className="h-full min-h-[300px] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-[#8390a6] bg-[#0b1220]/40">
            <BarChart2 size={48} className="mb-4 text-white/20" />
            <h3 className="text-lg font-medium text-white mb-2">NSE / BSE & Forex Terminal Ready</h3>
            <p className="text-sm">Upload a chart image to view AI confidence rating, entry levels in ₹ INR, stop loss, and target profit objectives.</p>
          </div>
        )}

        {loading && (
          <div className="h-full min-h-[300px] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-[#0b1220]/40 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-[#19d58b] border-t-transparent animate-spin mb-4"></div>
            <h3 className="text-lg font-medium text-white mb-2">Scanning Chart Geometry</h3>
            <p className="text-sm text-[#8390a6]">Detecting candle structures, support zones in ₹ INR, and momentum divergences...</p>
          </div>
        )}

        {result && (
          <div className="bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent"></div>
            
            <div className="flex justify-between items-start pb-4 border-b border-white/5">
              <div>
                <span className="text-xs text-[#8390a6] uppercase tracking-wider font-semibold">AI Recommendation</span>
                <div className="text-3xl font-black mt-1 flex items-center gap-3">
                  <span className={result.action === 'BUY' ? 'text-[#19d58b]' : result.action === 'SELL' ? 'text-[#ff4e72]' : 'text-[#53dcff]'}>
                    {result.action}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8390a6] uppercase tracking-wider font-semibold">Confidence</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">{result.confidence}%</div>
              </div>
            </div>

            <div className="space-y-3">
              <SignalRow label="Suggested Entry (₹ INR)" value={result.entryPrice} type="neutral" />
              <SignalRow label="Stop Loss Target (₹)" value={result.stopLoss} type="danger" />
              <SignalRow label="Take Profit Target (₹)" value={result.takeProfit} type="success" />
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-[#8390a6] uppercase tracking-wider mb-2">Technical Analysis Reasoning</p>
              <p className="text-[#c9d2e2] text-sm leading-relaxed">{result.analysis}</p>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={handleCopyReport}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/10 text-white hover:bg-white/15 border border-white/10"
              >
                {copied ? (
                  <><Check size={18} className="text-[#19d58b]" /> <span className="text-[#19d58b]">Report Copied to Clipboard</span></>
                ) : (
                  <><Copy size={18} /> Copy Signal Report (INR)</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SignalRow({ label, value, type }: { label: string, value: string, type: 'success' | 'danger' | 'neutral' }) {
  const colors = {
    success: 'text-[#19d58b] bg-[#19d58b]/10 border-[#19d58b]/20',
    danger: 'text-[#ff4e72] bg-[#ff4e72]/10 border-[#ff4e72]/20',
    neutral: 'text-[#53dcff] bg-[#53dcff]/10 border-[#53dcff]/20',
  };
  
  return (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
      <span className="text-[#8390a6] text-sm font-medium">{label}</span>
      <span className={`font-mono font-bold px-3 py-1 rounded border ${colors[type]}`}>{value}</span>
    </div>
  );
}

// --- TAB 2: TOP MOVERS COMBINING INDIAN EQUITIES & FOREX --- //

function TopMoversTab() {
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
      const response = await fetch(`/api/top-movers?category=${category}`);
      const data: TopMoversResponse = await response.json();
      
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
              <Sparkles size={11} /> Google Grounded
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
                        <h3 className="text-2xl font-black tracking-tight text-white">
                          {mover.symbol}
                        </h3>
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
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#53dcff] font-medium truncate">
                    <Globe size={13} className="shrink-0" />
                    <span className="truncate">{mover.sourceTitle || 'Live Market Quote'}</span>
                  </div>
                  {mover.sourceUrl ? (
                    <a 
                      href={mover.sourceUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[11px] text-[#8390a6] hover:text-[#19d58b] flex items-center gap-1 font-semibold transition-colors shrink-0 ml-2"
                    >
                      <span>Quote</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/finance/quote/${mover.symbol}:NSE`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#8390a6] hover:text-[#19d58b] flex items-center gap-1 font-semibold transition-colors shrink-0 ml-2"
                    >
                      <span>NSE Quote</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Search Grounding Details Module */}
          <GoogleSearchGroundingPanel 
            metadata={searchMetadata} 
            title="Google Search Grounding Details for Indian & Forex Movers" 
          />
        </>
      )}
    </motion.div>
  );
}

// --- TAB 3: CUSTOM INDIAN STOCKS & FOREX SEARCH WITH INR (₹) PRICING --- //

function CustomStocksTab() {
  const [queryInput, setQueryInput] = useState('RELIANCE');
  const [result, setResult] = useState<StockAnalysisResponse | null>(null);
  const [livePriceData, setLivePriceData] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
    handleAnalyze('RELIANCE');
  }, []);

  // Poll live price for the actively selected stock every 3 seconds to keep price live
  useEffect(() => {
    if (!result?.symbol) return;
    
    const pollActiveLivePrice = async () => {
      try {
        const sym = result.symbol.replace('/INR', '');
        const res = await fetch(`/api/live-quotes?symbols=${sym}`);
        const data = await res.json();
        if (data && data.quotes && (data.quotes[sym] || data.quotes[result.symbol])) {
          const latestQuote = data.quotes[sym] || data.quotes[result.symbol];
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
      const response = await fetch('/api/analyze-stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      
      const data: StockAnalysisResponse = await response.json();
      if (data && !('error' in data)) {
        setResult(data);
        if (data.liveQuote) {
          setLivePriceData(data.liveQuote);
        }
        saveToHistory(data, searchQuery.trim());
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
            title={`Google Search Details & Sources for ${result.symbol} (INR ₹)`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// --- TAB 4: COMBINED MARKET NEWS (INDIAN STOCKS & FOREX) --- //

function NewsTab() {
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<SearchMetadata | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newsCategory, setNewsCategory] = useState<'all' | 'indian' | 'forex'>('all');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/market-news');
      const data: MarketNewsResponse = await res.json();
      
      if (data && Array.isArray(data.news)) {
        setNews(data.news);
        setSearchMetadata(data.searchMetadata);
      } else if (Array.isArray(data)) {
        setNews(data);
      } else {
        setError('Failed to fetch news');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = newsCategory === 'all'
    ? news
    : newsCategory === 'indian'
    ? news.filter(n => n.marketCategory === 'INDIAN' || n.headline.includes('NIFTY') || n.headline.includes('SENSEX') || n.headline.includes('Tata') || n.headline.includes('India'))
    : news.filter(n => n.marketCategory === 'FOREX' || n.headline.includes('Forex') || n.headline.includes('USD/INR') || n.headline.includes('Rupee') || n.headline.includes('Currency'));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">Indian & Forex Market News</h2>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 rounded-full flex items-center gap-1">
              <Globe size={12} /> Google Search Grounded
            </span>
          </div>
          <p className="text-[#8390a6]">Breaking Dalal Street headlines, RBI monetary policy developments, and global Forex currency market updates.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setNewsCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                newsCategory === 'all' ? 'bg-[#19d58b] text-[#04100d]' : 'text-[#8390a6] hover:text-white'
              }`}
            >
              ALL NEWS
            </button>
            <button
              onClick={() => setNewsCategory('indian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                newsCategory === 'indian' ? 'bg-[#19d58b] text-[#04100d]' : 'text-[#8390a6] hover:text-white'
              }`}
            >
              DALAL STREET / NSE
            </button>
            <button
              onClick={() => setNewsCategory('forex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                newsCategory === 'forex' ? 'bg-[#19d58b] text-[#04100d]' : 'text-[#8390a6] hover:text-white'
              }`}
            >
              FOREX / RUPEE
            </button>
          </div>

          <button 
            id="refresh-news-btn"
            onClick={fetchNews}
            disabled={loading}
            className="px-5 py-2 bg-[#19d58b]/10 hover:bg-[#19d58b]/20 text-[#19d58b] border border-[#19d58b]/30 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Fetching...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {loading && filteredNews.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[220px] bg-[#0b1220]/80 rounded-3xl border border-white/5 animate-pulse p-6">
              <div className="h-4 bg-white/10 rounded w-24 mb-4"></div>
              <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
              <div className="h-12 bg-white/5 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNews.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 hover:bg-[#0e172a] hover:border-[#53dcff]/40 transition-all relative overflow-hidden group flex flex-col justify-between h-full shadow-lg"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53dcff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-[#53dcff] font-semibold flex items-center gap-1.5">
                        <Globe size={13} /> {item.source}
                      </span>
                      {item.marketCategory && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#8390a6]">
                          {item.marketCategory}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                      item.sentiment === 'Bullish' ? 'bg-[#19d58b]/15 text-[#19d58b] border-[#19d58b]/30' : 
                      item.sentiment === 'Bearish' ? 'bg-[#ff4e72]/15 text-[#ff4e72] border-[#ff4e72]/30' : 
                      'bg-white/10 text-white border-white/20'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-3 leading-snug text-white group-hover:text-[#53dcff] transition-colors">{item.headline}</h3>
                  <p className="text-[#8390a6] text-sm leading-relaxed mb-4">{item.summary}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#8390a6] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-[#19d58b]" /> Google Search Verified
                  </span>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[#19d58b] hover:text-[#35efaa] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Read Article</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Search Grounding Details & Sources for News */}
          <GoogleSearchGroundingPanel 
            metadata={searchMetadata} 
            title="Google Search Grounding Sources for Indian & Forex News"
          />
        </>
      )}
    </motion.div>
  );
}
