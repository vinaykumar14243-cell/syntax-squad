import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Building2,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  NewsArticle,
  NewsCategory,
  NewsSentiment,
  PotentialImpact,
  NewsIntelligenceResponse,
  EconomicCalendarEvent
} from '../types';
import { fetchNewsIntelligenceApi } from '../lib/apiClient';

interface NewsIntelligenceViewProps {
  onSelectStock?: (symbol: string) => void;
}

export function NewsIntelligenceView({ onSelectStock }: NewsIntelligenceViewProps) {
  const [data, setData] = useState<NewsIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string>('All Verified News');

  const filterTabs = [
    { id: 'all', label: 'All News', icon: <Layers size={14} /> },
    { id: 'india', label: '🇮🇳 Dalal Street (NSE/BSE)', icon: <Building2 size={14} /> },
    { id: 'global', label: '🌐 Global & US', icon: <Globe size={14} /> },
    { id: 'breaking', label: '⚡ Breaking', icon: <Zap size={14} /> },
    { id: 'high-impact', label: '🔥 High Impact', icon: <Flame size={14} /> },
    { id: 'central-bank', label: '🏛️ RBI & Fed Rates', icon: <Building2 size={14} /> },
    { id: 'earnings', label: '📊 Earnings & Orders', icon: <TrendingUp size={14} /> },
    { id: 'commodities', label: '🛢️ Oil & Metals', icon: <Sparkles size={14} /> },
    { id: 'forex', label: '💱 Forex & Rupee (₹)', icon: <Globe size={14} /> },
  ];

  const loadNews = async (cat: string = activeCategory, q: string = searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchNewsIntelligenceApi(cat, q);
      if (res && res.articles) {
        setData(res);
      } else {
        setError('Unable to fetch live news stream. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve live news intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(activeCategory, searchQuery);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews(activeCategory, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadNews(activeCategory, '');
  };

  const getSentimentBadge = (sentiment: NewsSentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 flex items-center gap-1">
            <TrendingUp size={12} /> POSITIVE
          </span>
        );
      case 'NEGATIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff4e72]/15 text-[#ff4e72] border border-[#ff4e72]/30 flex items-center gap-1">
            <TrendingDown size={12} /> NEGATIVE
          </span>
        );
      case 'MIXED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Sparkles size={12} /> MIXED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-[#c9d2e2] border border-white/15 flex items-center gap-1">
            NEUTRAL
          </span>
        );
    }
  };

  const getImpactBadge = (impact: PotentialImpact) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
            <Flame size={11} /> High Impact
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#53dcff]/15 text-[#53dcff] border border-[#53dcff]/30">
            Med Impact
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-white/5 text-[#8390a6] border border-white/10">
            Low Impact
          </span>
        );
    }
  };

  const getCategoryColor = (category: NewsCategory) => {
    switch (category) {
      case 'CENTRAL_BANK':
      case 'INTEREST_RATES':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'EARNINGS':
      case 'CONTRACT_ORDER':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'OIL':
      case 'COMMODITIES':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'CURRENCY':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'REGULATORY':
      case 'GEOPOLITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-white/10 text-white border-white/10';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header & Source Diagnostics Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0b1220]/90 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53dcff] to-transparent"></div>
        
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Globe size={28} className="text-[#53dcff]" />
              Global Market News Intelligence
            </h2>
            <span className="px-3 py-1 text-xs font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(25,213,139,0.15)]">
              <ShieldCheck size={14} /> 100% Real Verified Feeds
            </span>
          </div>
          <p className="text-[#8390a6] text-sm max-w-3xl leading-relaxed">
            Multi-source financial intelligence aggregating Economic Times, Livemint, Moneycontrol, Yahoo Finance, and central bank feeds. Identifies directly and indirectly impacted stocks, potential market direction, and event catalysts.
          </p>

          {/* Provider Health Metadata */}
          {data?.providerHealth && (
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[#8390a6]">
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#19d58b] animate-ping"></span>
                <span className="text-[#c9d2e2] font-semibold">{data.providerHealth.activeSources.length} Active Feeds</span>
              </div>
              <div className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                <Clock size={12} className="text-[#53dcff]" />
                <span>Last Synced: <strong className="text-white font-mono">{data.providerHealth.lastSync} IST</strong></span>
              </div>
              <div className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                <Layers size={12} className="text-[#19d58b]" />
                <span><strong className="text-white font-mono">{data.totalArticles}</strong> Verified Articles</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            id="refresh-news-feed-btn"
            onClick={() => loadNews(activeCategory, searchQuery)}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#19d58b] to-[#15b877] hover:opacity-95 text-[#04100d] font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(25,213,139,0.2)] disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Live News'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8390a6]" size={18} />
            <input 
              id="news-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by stock ticker (e.g. RELIANCE, HDFCBANK, USD/INR, TSLA), company name, sector, or keyword..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#0b1220]/80 border border-white/10 rounded-2xl text-white outline-none focus:border-[#53dcff] focus:ring-2 focus:ring-[#53dcff]/20 transition-all font-sans text-sm shadow-inner"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8390a6] hover:text-white text-xs bg-white/10 px-2 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <button 
            type="submit"
            className="px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-2xl transition-all text-sm cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Filter Category Tabs */}
        <div className="flex p-1.5 bg-[#0b1220]/80 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setSelectedCategoryLabel(tab.label);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeCategory === tab.id
                  ? 'bg-[#19d58b] text-[#04100d] shadow-[0_0_15px_rgba(25,213,139,0.2)]'
                  : 'text-[#8390a6] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button 
            onClick={() => loadNews(activeCategory, searchQuery)}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Breaking / High Impact Spotlight Banner */}
      {data?.breakingNews && data.breakingNews.length > 0 && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Flame size={16} /> Breaking & High Impact Spotlight
              </h3>
            </div>
            <span className="text-xs text-[#8390a6]">{data.breakingNews.length} Critical Catalysts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.breakingNews.slice(0, 2).map((item) => (
              <div 
                key={item.id}
                className="bg-gradient-to-br from-[#1c0f18] via-[#0f172a] to-[#0b1220] border border-red-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl group flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500 text-white flex items-center gap-1">
                        <Zap size={11} /> BREAKING
                      </span>
                      <span className="text-xs text-[#8390a6] font-medium">{item.sourceName}</span>
                    </div>
                    {getSentimentBadge(item.sentiment)}
                  </div>

                  <h4 className="text-base lg:text-lg font-bold text-white mb-2 leading-snug group-hover:text-amber-300 transition-colors">
                    {item.headline}
                  </h4>
                  <p className="text-xs text-[#c9d2e2] leading-relaxed mb-4 line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.relatedStocks.slice(0, 2).map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectStock?.(s.symbol)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#19d58b]/20 hover:text-[#19d58b] text-[11px] font-mono font-bold text-white border border-white/10 transition-all cursor-pointer"
                      >
                        {s.symbol}
                      </button>
                    ))}
                  </div>

                  <a 
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Source</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Layout: News Feed + Real-Time Economic Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: News Articles Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{searchQuery ? `Search Results for "${searchQuery}"` : selectedCategoryLabel}</span>
              {data && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-[#8390a6] font-mono">
                  {data.articles.length}
                </span>
              )}
            </h3>

            {searchQuery && (
              <button 
                onClick={handleClearSearch}
                className="text-xs text-[#19d58b] hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-[#0b1220]/80 rounded-3xl border border-white/5 animate-pulse p-6">
                  <div className="h-4 bg-white/10 rounded w-48 mb-3"></div>
                  <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
                  <div className="h-10 bg-white/5 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && (!data || data.articles.length === 0) && (
            <div className="bg-[#0b1220]/60 border border-white/10 rounded-3xl p-12 text-center space-y-4">
              <Info size={40} className="text-[#8390a6] mx-auto" />
              <h4 className="text-lg font-bold text-white">No articles matched your criteria</h4>
              <p className="text-sm text-[#8390a6] max-w-md mx-auto">
                No verified articles were found for the current query or filter category. Try switching tabs or searching for another asset.
              </p>
              <button 
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  loadNews('all', '');
                }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reset to All News
              </button>
            </div>
          )}

          {/* Articles List */}
          {!loading && data && data.articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 hover:bg-[#0e172a] hover:border-white/20 transition-all relative overflow-hidden group shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Meta Row: Source, Time, Freshness, Sentiment, Impact */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#53dcff] flex items-center gap-1.5">
                      <Globe size={13} /> {article.sourceName}
                    </span>
                    <span className="text-xs text-[#8390a6] flex items-center gap-1 font-mono">
                      <Clock size={11} /> {article.publishedTimeFormatted}
                    </span>
                    {article.category && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryColor(article.category)}`}>
                        {article.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getImpactBadge(article.potentialImpact)}
                    {getSentimentBadge(article.sentiment)}
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-lg lg:text-xl font-bold text-white leading-snug group-hover:text-[#53dcff] transition-colors">
                  {article.headline}
                </h3>

                {/* Summary */}
                <p className="text-sm text-[#8390a6] leading-relaxed">
                  {article.summary}
                </p>

                {/* "Why It Matters" Callout Box */}
                {article.whyItMatters && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-[#c9d2e2] space-y-1">
                    <div className="font-bold text-[#53dcff] flex items-center gap-1.5">
                      <Info size={13} /> Market Interpretation Context:
                    </div>
                    <p className="leading-relaxed">
                      {article.whyItMatters}
                    </p>
                    {article.sentimentReason && (
                      <p className="text-[11px] text-[#8390a6] italic pt-1 border-t border-white/5">
                        Catalyst Rationale: {article.sentimentReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Affected Equities & Indirect Sectors */}
                {(article.relatedStocks.length > 0 || (article.indirectSectors && article.indirectSectors.length > 0)) && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#8390a6] font-semibold flex items-center gap-1">
                      <Building2 size={12} /> Impacted Assets:
                    </span>

                    {/* Direct Company Badges */}
                    {article.relatedStocks.map((stock, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => onSelectStock?.(stock.symbol)}
                        title={`Analyze ${stock.symbol} (${stock.company})`}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-[#19d58b]/20 text-xs font-semibold text-white hover:text-[#19d58b] border border-white/10 hover:border-[#19d58b]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="font-mono font-bold">{stock.symbol}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-[#8390a6] font-mono">
                          {stock.exchange}
                        </span>
                        {stock.relationship === 'INDIRECT' && (
                          <span className="text-[9px] text-amber-400">Indirect</span>
                        )}
                      </button>
                    ))}

                    {/* Indirect Sectors */}
                    {article.indirectSectors?.map((sec, secIdx) => (
                      <span
                        key={`sec-${secIdx}`}
                        className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-[#8390a6] border border-white/5"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Multi-source citation & External Link */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#8390a6]">
                  <span className="flex items-center gap-1 text-[#19d58b]">
                    <CheckCircle2 size={13} /> Verified Publisher
                  </span>
                  {article.duplicateCount && article.duplicateCount > 1 && (
                    <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-[#8390a6]">
                      Covered by {article.duplicateCount} sources
                    </span>
                  )}
                </div>

                <a 
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#19d58b] hover:text-[#35efaa] font-semibold flex items-center gap-1.5 transition-all border border-white/10 hover:border-white/20 cursor-pointer"
                >
                  <span>Read Full Article</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Real-Time Economic Calendar & Guidance (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Economic Calendar Card */}
          <div className="bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent"></div>

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#19d58b]/15 border border-[#19d58b]/30 flex items-center justify-center text-[#19d58b]">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Economic Calendar</h4>
                  <p className="text-[11px] text-[#8390a6]">Scheduled Macro Triggers</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#8390a6]">
                RBI · FED · MoSPI
              </span>
            </div>

            <div className="space-y-4">
              {data?.economicEvents?.map((evt: EconomicCalendarEvent) => (
                <div 
                  key={evt.id}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{evt.flag}</span>
                      <span className="text-xs font-bold text-white leading-tight">{evt.event}</span>
                    </div>
                    {evt.importance === 'HIGH' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/20 text-red-400 shrink-0">
                        HIGH
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-black/20 p-2 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[#8390a6] block text-[9px]">Expected</span>
                      <span className="font-mono font-bold text-[#c9d2e2]">{evt.forecast || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#8390a6] block text-[9px]">Previous</span>
                      <span className="font-mono text-[#8390a6]">{evt.previous || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#8390a6] block text-[9px]">Actual/Stance</span>
                      <span className="font-mono font-bold text-[#19d58b]">{evt.actual || 'Pending'}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#8390a6]">
                    <strong className="text-[#c9d2e2]">Impact:</strong> {evt.impactOn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision-Support System Guidelines */}
          <div className="bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#19d58b]" />
              Event Context & Decision Support
            </h4>
            <ul className="text-xs text-[#8390a6] space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#19d58b] font-bold">1.</span>
                <span><strong>No Automatic Signals:</strong> News sentiment provides narrative context; it never replaces technical price action confirmation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#19d58b] font-bold">2.</span>
                <span><strong>Priced-In Realities:</strong> Positive news often meets profit-taking if anticipated; verify technical key support & resistance before execution.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#19d58b] font-bold">3.</span>
                <span><strong>Entity Mapping:</strong> Indirect impacts track raw commodity dependencies (e.g. Brent Crude moves directly influencing Paints & Aviation).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
