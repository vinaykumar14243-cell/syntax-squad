const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const importFirestore = `import { auth, db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';`;

if (!content.includes('import { auth, db }')) {
  content = content.replace("import { shareToGoogleChat } from '../lib/chat';", "import { shareToGoogleChat } from '../lib/chat';\n" + importFirestore);
}

const tabStart = content.indexOf('function CustomStocksTab() {');
const nextTab = content.indexOf('function NewsTab() {');
const tabContent = content.substring(tabStart, nextTab);

const newTabContent = `function CustomStocksTab() {
  const [queryInput, setQueryInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'searches'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(items);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const saveToHistory = async (resData: any, searchQuery: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'searches'), {
        userId: auth.currentUser.uid,
        query: searchQuery,
        symbol: resData.symbol || searchQuery,
        result: JSON.stringify(resData),
        createdAt: serverTimestamp()
      });
      fetchHistory();
    } catch (err) {
      console.error('Failed to save search', err);
    }
  };

  const handleAnalyze = async (searchQuery: string = queryInput) => {
    if (!searchQuery.trim()) {
      setError('Please enter a stock or crypto symbol to search');
      return;
    }

    setQueryInput(searchQuery);
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/analyze-stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        saveToHistory(data, searchQuery.trim());
      } else {
        setError(data.error || 'Failed to analyze stock');
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
      setQueryInput(item.query);
    } catch (err) {
      console.error("Failed to parse history item", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Deep Stock Search & Signals</h2>
        <p className="text-[#8390a6] mb-8">Enter a stock or crypto to get comprehensive fundamental details, technical signals, and a definitive declaration on its future profitability based on real-time web search and market data.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input 
            type="text" 
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. AAPL, Tesla, Bitcoin"
            className="flex-1 p-4 text-white border border-white/10 rounded-2xl outline-none bg-[#0b1220]/80 focus:border-[#19d58b] focus:ring-2 focus:ring-[#19d58b]/20 transition-all font-mono text-lg shadow-inner"
          />
          <button 
            onClick={() => handleAnalyze()}
            disabled={loading || !queryInput.trim()}
            className="px-8 py-4 bg-gradient-to-r from-[#19d58b] to-[#15b877] text-[#04100d] font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(25,213,139,0.2)]"
          >
            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
            {loading ? 'Analyzing...' : 'Search Asset'}
          </button>
        </div>
        
        {history.length > 0 && (
          <div className="mb-8">
            <span className="text-xs text-[#8390a6] uppercase tracking-wider font-semibold mb-2 block">Recent Searches</span>
            <div className="flex flex-wrap gap-2">
              {history.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleHistoryClick(item)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#c9d2e2] hover:bg-white/10 transition-colors flex items-center gap-1"
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
              Initiating deep market scan and querying live financial web data for {queryInput}...
            </div>
          </div>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto bg-[#0b1220]/80 border border-white/10 rounded-3xl p-6 lg:p-10 hover:border-white/20 transition-all relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#19d58b] to-transparent"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-5xl font-black tracking-tight">{result.symbol}</h3>
                <span className="px-4 py-1.5 bg-white/5 rounded-lg text-sm font-semibold text-[#8390a6] uppercase tracking-widest">{result.name}</span>
              </div>
              <div className="text-4xl font-bold font-mono text-[#c9d2e2] tracking-tighter">{result.currentPrice}</div>
            </div>
            
            <div className={\`px-8 py-6 rounded-2xl flex flex-col items-center justify-center min-w-[160px] \${
              result.signal === 'BUY' ? 'bg-[#19d58b]/10 text-[#19d58b] border border-[#19d58b]/20 shadow-[0_0_30px_rgba(25,213,139,0.15)]' : 
              result.signal === 'SELL' ? 'bg-[#ff4e72]/10 text-[#ff4e72] border border-[#ff4e72]/20 shadow-[0_0_30px_rgba(255,78,114,0.15)]' : 
              'bg-white/10 text-white border border-white/20'
            }\`}>
              <span className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-2">AI SIGNAL</span>
              <span className="text-4xl font-black tracking-tighter">{result.signal}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-[#19d58b]/5 p-6 rounded-2xl border border-[#19d58b]/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#19d58b]"></div>
              <h4 className="text-sm font-bold text-[#19d58b] uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={18} /> Future Profitability
              </h4>
              <p className="text-[#c9d2e2] leading-relaxed text-[1.05rem]">
                {result.futureProfitability}
              </p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-[#8390a6] uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart2 size={18} /> Technical Breakdown
              </h4>
              <p className="text-[#c9d2e2] leading-relaxed">
                {result.analysis}
              </p>
            </div>
          </div>

          <div className="mb-10 bg-white/5 p-6 rounded-2xl border border-white/5">
            <h4 className="text-sm font-bold text-[#8390a6] uppercase tracking-widest mb-4">Company & Asset Background</h4>
            <p className="text-[#c9d2e2] leading-relaxed">{result.companyDetails}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-2">
            <div className="bg-[#050811] rounded-2xl p-6 border border-white/10 text-center shadow-inner">
              <span className="block text-xs font-semibold text-[#8390a6] uppercase tracking-widest mb-2">Entry Target</span>
              <span className="font-mono text-2xl font-bold text-white">{result.entry}</span>
            </div>
            <div className="bg-[#050811] rounded-2xl p-6 border border-white/10 text-center shadow-inner">
              <span className="block text-xs font-semibold text-[#8390a6] uppercase tracking-widest mb-2">Stop Loss</span>
              <span className="font-mono text-2xl font-bold text-[#ff4e72]">{result.stopLoss}</span>
            </div>
            <div className="bg-[#050811] rounded-2xl p-6 border border-white/10 text-center shadow-inner">
              <span className="block text-xs font-semibold text-[#8390a6] uppercase tracking-widest mb-2">Take Profit</span>
              <span className="font-mono text-2xl font-bold text-[#19d58b]">{result.takeProfit}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
`;

content = content.substring(0, tabStart) + newTabContent + content.substring(nextTab);
fs.writeFileSync('src/components/Dashboard.tsx', content);

