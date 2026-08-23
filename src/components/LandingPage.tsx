import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TrendingUp, ArrowRight, Sparkles, Zap, ShieldCheck, BarChart2 } from 'lucide-react';
import ChartGraphic from './ChartGraphic';
import { fetchTickersApi } from '../lib/apiClient';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const marketSectionRef = useRef<HTMLElement>(null);
  
  // Ticker state in Indian Rupees (INR ₹)
  const [heroIndex, setHeroIndex] = useState({ symbol: "NIFTY 50", price: "22,850.40", change: "+0.72%", isUp: true, name: "NSE Benchmark" });
  const [tickers, setTickers] = useState<any[]>([
    { symbol: "NIFTY 50", price: "₹22,850.40", change: "+0.72%", isUp: true },
    { symbol: "USD/INR", price: "₹86.85", change: "+0.12%", isUp: true },
    { symbol: "RELIANCE", price: "₹2,985.40", change: "+2.40%", isUp: true },
    { symbol: "EUR/INR", price: "₹91.45", change: "+0.35%", isUp: true },
    { symbol: "TATAMOTORS", price: "₹988.50", change: "+4.85%", isUp: true },
    { symbol: "GBP/INR", price: "₹109.90", change: "+0.48%", isUp: true }
  ]);

  useEffect(() => {
    // Listen for global "Enter" key press to launch platform
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter]);

  useEffect(() => {
    // Fetch live tickers via secure proxy / client fallback
    const fetchLive = async () => {
      try {
        const data = await fetchTickersApi();
        if (Array.isArray(data) && data.length > 0) {
          const nifty = data.find((d: any) => d.symbol.includes('NIFTY') || d.symbol.includes('USD/INR'));
          if (nifty) {
            setHeroIndex({
              symbol: nifty.symbol,
              price: nifty.price.replace('₹', ''),
              change: nifty.change,
              isUp: nifty.isUp,
              name: nifty.name || "Live Index"
            });
          }
          setTickers(data);
        }
      } catch (err) {
        console.warn('Ticker update handled safely:', err);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: marketSectionRef,
    offset: ["start start", "end end"]
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [-9, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [4, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // Falling Indian Rupee & Forex Particle Animation Component
  const FallingDataParticles = () => {
    const [elements, setElements] = useState<{ id: number; left: number; duration: number; delay: number; symbol: string }[]>([]);

    useEffect(() => {
      const symbols = ['₹', '₹', '▲', '⚡', '%', '₹', '◆'];
      const newElements = Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 4,
        symbol: symbols[Math.floor(Math.random() * symbols.length)]
      }));
      setElements(newElements);
    }, []);

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {elements.map((el) => (
          <motion.div
            key={el.id}
            initial={{ y: -60, opacity: 0, scale: 0.8 }}
            animate={{ 
              y: '110vh', 
              opacity: [0, 0.75, 0],
              scale: [0.8, 1.25, 0.8],
              rotate: 180
            }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute text-[#19d58b] text-xl font-bold opacity-0 drop-shadow-[0_0_12px_rgba(25,213,139,0.6)]"
            style={{ left: `${el.left}%` }}
          >
            {el.symbol}
          </motion.div>
        ))}
      </div>
    );
  };

  const scrollToEnter = () => {
    const enterEl = document.getElementById('enter');
    if (enterEl) {
      enterEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      onEnter();
    }
  };

  return (
    <div className="relative w-full overflow-x-hidden font-sans bg-[#050811]">
      {/* Navigation */}
      <nav className="fixed z-50 top-0 right-0 left-0 h-[70px] flex items-center justify-between px-6 md:px-10 border-b border-white/10 bg-[#050811]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex w-10 h-10 items-center justify-center rounded-xl text-[#06110d] font-black bg-gradient-to-br from-[#35efaa] to-[#53dcff] shadow-[0_0_20px_rgba(53,239,170,0.3)]">
            <TrendingUp size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight hidden sm:inline">
            VANTA<span className="text-[#19d58b]">TRADE</span> AI
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#19d58b]/15 text-[#19d58b] border border-[#19d58b]/30">
            NSE · BSE · FOREX (₹ INR)
          </span>
        </div>
        
        <div className="hidden md:flex gap-[30px] text-[#8390a6] text-[0.85rem]">
          <a href="#market" className="hover:text-white transition-colors">Indian & Forex Markets</a>
          <button onClick={scrollToEnter} className="hover:text-white transition-colors cursor-pointer">Explore Terminal</button>
          <a href="#enter" className="hover:text-[#19d58b] transition-colors">Enter Platform</a>
        </div>

        <button 
          onClick={onEnter} 
          className="px-5 py-2.5 text-[#04100d] bg-[#19d58b] hover:bg-[#15b877] rounded-full text-sm font-extrabold shadow-[0_0_20px_rgba(25,213,139,0.3)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
        >
          <span>Enter</span>
          <ArrowRight size={16} />
        </button>
      </nav>

      <main>
        {/* Hero Section with interactive 3D chart simulation */}
        <section id="market" ref={marketSectionRef} className="relative h-[220vh]">
          <div className="sticky top-0 h-screen min-h-[650px] overflow-hidden bg-[radial-gradient(circle_at_75%_15%,rgba(77,79,255,0.22),transparent_30rem),radial-gradient(circle_at_15%_80%,rgba(0,210,170,0.13),transparent_28rem)]">
            <div className="absolute z-10 top-[16%] md:top-[20%] left-[6vw] w-[min(510px,88vw)]">
              <div className="inline-flex items-center gap-2 px-[13px] py-[9px] text-[#19d58b] border border-[#19d58b]/30 rounded-full bg-[#19d58b]/10 text-[0.7rem] tracking-[0.13em] uppercase">
                <i className="w-[7px] h-[7px] rounded-full bg-[#19d58b] shadow-[0_0_12px_#19d58b]"></i>
                #1 Indian & Forex Market AI
              </div>

              <h1 className="my-[22px] mb-[16px] text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.05em] text-white">
                Master NSE & <span className="text-[#19d58b]">Forex in ₹</span>
              </h1>

              <p className="text-[#8390a6] leading-[1.7] text-base md:text-lg max-w-[440px]">
                Real-time AI technical analysis and price forecasting across Indian Stocks (NSE/BSE) and Global Forex Currency Markets in Indian Rupees (INR ₹).
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-[26px]">
                <button 
                  onClick={onEnter} 
                  className="px-[28px] py-[15px] text-[#04100d] rounded-xl bg-[#19d58b] shadow-[0_15px_40px_rgba(25,213,139,0.28)] font-extrabold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer text-base"
                >
                  <span>Enter the platform</span>
                  <ArrowRight size={18} />
                </button>
                
                <button
                  onClick={scrollToEnter}
                  className="px-[20px] py-[15px] text-[#c9d2e2] rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-medium hover:bg-white/10 transition-all text-sm cursor-pointer"
                >
                  Scroll Down ↓
                </button>
              </div>
            </div>

            {/* Floating Perspective Chart graphic */}
            <motion.div 
              className="absolute z-[2] top-[42%] md:top-[12%] right-[-10vw] md:right-[4vw] w-[120vw] md:w-[64vw] h-[48vh] md:h-[76vh] min-h-[380px] md:min-h-[490px] border border-white/15 rounded-[20px] bg-[#080e1a]/90 shadow-[0_35px_100px_rgba(0,0,0,0.45)]"
              style={{
                perspective: 1400,
                rotateY,
                rotateX,
                scale,
              }}
            >
              <div className="h-[80px] md:h-[86px] flex items-center justify-between px-[20px] md:px-[24px] py-[16px] border-b border-white/10 bg-white/5">
                <div>
                  <div className="text-[0.95rem] font-extrabold text-white">
                    {heroIndex.symbol} <small className="ml-[8px] text-[#8390a6] text-[0.7rem] font-normal">{heroIndex.name}</small>
                  </div>
                  <div className="mt-[4px] text-[1.4rem] md:text-[1.6rem] text-white font-bold flex items-center h-8">
                    {heroIndex.price !== "..." ? `₹${heroIndex.price}` : <div className="w-28 h-6 bg-white/10 animate-pulse rounded ml-2"></div>}
                    {heroIndex.price !== "..." && (
                      <span className={`ml-[8px] text-[0.75rem] font-medium ${heroIndex.isUp ? 'text-[#19d58b]' : 'text-[#ff4e72]'}`}>
                        {heroIndex.isUp ? '+' : ''}{heroIndex.change}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex gap-[7px]">
                  {['1m', '5m', '1H', '1D', '1W'].map(t => (
                    <button key={t} className={`px-[9px] py-[7px] text-[0.85rem] rounded-[6px] border border-transparent hover:text-[#19d58b] hover:bg-[#19d58b]/10 hover:border-[#19d58b]/30 transition-colors ${t === '1H' ? 'text-[#19d58b] bg-[#19d58b]/10 border-[#19d58b]/30' : 'text-[#8390a6]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full h-[calc(100%-80px)] md:h-[calc(100%-86px)] p-4 relative">
                <ChartGraphic progress={scrollYProgress} />
                <div className="absolute right-[22px] bottom-[17px] text-white/40 text-[0.67rem] tracking-[0.12em] uppercase pointer-events-none">
                  NSE / BSE · FOREX (₹ INR) · REAL-TIME
                </div>
              </div>
            </motion.div>

            <div className="absolute z-10 bottom-[6%] left-[6vw] text-[#8390a6] text-[0.7rem] tracking-[0.14em] uppercase flex items-center gap-2">
              <span className="w-[30px] h-[1px] bg-[#19d58b]"></span>
              Scroll down to enter terminal
            </div>
            
            <div className="absolute z-10 bottom-[6%] right-[6vw] text-[#8390a6] text-[0.7rem] tracking-[0.14em] uppercase flex items-center gap-6">
              {tickers.length > 0 ? tickers.slice(0, 4).map((t, i) => (
                <span key={i} className={i > 0 ? (i > 1 ? "hidden lg:inline-block" : "hidden md:inline-block") : "hidden sm:inline-block"}>
                  {t.symbol} <span className="text-white">{t.price.startsWith('₹') ? t.price : `₹${t.price}`}</span> <span className={t.isUp ? 'text-[#19d58b]' : 'text-[#ff4e72]'}>{t.isUp && !t.change.startsWith('+') ? '+' : ''}{t.change}</span>
                </span>
              )) : (
                <span className="hidden sm:inline-block text-white/50 animate-pulse">CONNECTING TO NSE/BSE & FOREX...</span>
              )}
            </div>
          </div>
        </section>

        {/* Enter Platform Section after scrolling down */}
        <section id="enter" className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(25,213,139,0.18),transparent_32rem)] bg-[#070d17]">
          <FallingDataParticles />

          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative z-10 w-[min(540px,94vw)] p-8 md:p-10 border border-white/10 rounded-3xl bg-[#0b1220]/85 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-[25px] overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent"></div>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[#19d58b] border border-[#19d58b]/30 rounded-full bg-[#19d58b]/10 text-xs tracking-[0.15em] uppercase font-semibold mx-auto mb-4">
              <Sparkles size={13} className="animate-pulse" />
              Indian & Forex Terminal Access
            </div>

            <h2 className="mt-2 mb-3 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Enter the Platform
            </h2>

            <p className="text-[#8390a6] text-sm md:text-base leading-relaxed mb-8 max-w-[440px] mx-auto">
              Launch into the complete Indian Stock Market (NSE/BSE) & Global Forex trading workspace with real-time Indian Rupee (INR ₹) pricing and Google Search Grounding.
            </p>

            {/* Giant ENTER Button */}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnter}
              className="w-full py-5 px-8 bg-gradient-to-r from-[#19d58b] via-[#35efaa] to-[#15b877] text-[#04100d] rounded-2xl font-black text-xl tracking-wider uppercase cursor-pointer hover:shadow-[0_0_40px_rgba(25,213,139,0.45)] transition-all flex items-center justify-center gap-3 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              <span>ENTER IN ₹ TERMINAL</span>
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <div className="mt-4 text-xs text-[#8390a6] flex items-center justify-center gap-2">
              <span>Press</span>
              <kbd className="px-2 py-0.5 bg-white/10 border border-white/20 rounded font-mono text-[11px] text-[#19d58b]">Enter ↵</kbd>
              <span>or click the button to enter</span>
            </div>

            {/* Quick platform highlights */}
            <div className="grid grid-cols-3 gap-2 pt-8 mt-8 border-t border-white/10 text-left">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[#19d58b] mb-1 font-bold text-base">₹ INR</div>
                <div className="text-white text-xs font-bold">Indian Currency</div>
                <div className="text-[#8390a6] text-[10px]">NSE · BSE · Forex</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[#53dcff] mb-1"><BarChart2 size={16} /></div>
                <div className="text-white text-xs font-bold">Chart Vision</div>
                <div className="text-[#8390a6] text-[10px]">Multimodal AI</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[#e7bd65] mb-1"><ShieldCheck size={16} /></div>
                <div className="text-white text-xs font-bold">Dalal St & FX</div>
                <div className="text-[#8390a6] text-[10px]">Live Grounding</div>
              </div>
            </div>

            <div className="mt-6 text-[#707e95] text-[0.7rem] leading-relaxed">
              AI technical analysis is for informational & educational purposes only.
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
