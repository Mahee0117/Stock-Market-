import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Activity, 
  BarChart3, 
  PieChart, 
  Info, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { calculateIndicators, getStockPrediction, type StockPrediction } from './services/stockService';
import { cn, formatCurrency, formatNumber } from './lib/utils';

const DEFAULT_SYMBOL = 'AAPL';
const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B'];

export default function App() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSimulated, setIsSimulated] = useState(false);

  const fetchData = async (targetSymbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stocks/${targetSymbol}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch stock data');
      }

      const rawData = result.data;
      setIsSimulated(!!result.isSimulated);

      if (!rawData || rawData.length === 0) {
        setData([]);
      } else {
        const processedData = calculateIndicators(rawData);
        setData(processedData);
      }
      
      // Try to get existing prediction from DB
      try {
        const predResponse = await fetch(`/api/predictions/${targetSymbol}`);
        if (predResponse.ok) {
          const existingPred = await predResponse.json();
          if (existingPred) {
            setPrediction({
              predictedPrice: existingPred.predicted_price,
              direction: existingPred.direction as 'UP' | 'DOWN',
              confidence: existingPred.confidence,
              insights: existingPred.insights,
              technicalAnalysis: 'Analysis loaded from database.'
            });
          } else {
            setPrediction(null);
          }
        }
      } catch (e) {
        console.error('Failed to load prediction:', e);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(symbol);
  }, [symbol]);

  const handlePredict = async () => {
    if (data.length === 0) return;
    setPredicting(true);
    try {
      const result = await getStockPrediction(symbol, data);
      setPrediction(result);
      
      // Save to DB
      await fetch(`/api/predictions/${symbol}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predicted_price: result.predictedPrice,
          direction: result.direction,
          confidence: result.confidence,
          insights: result.insights
        })
      });
    } catch (err) {
      console.error('Prediction failed:', err);
      setError('AI Prediction failed. Please try again later.');
    } finally {
      setPredicting(false);
    }
  };

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const prevPrice = data.length > 1 ? data[data.length - 2].close : 0;
  const priceChange = currentPrice - prevPrice;
  const priceChangePct = prevPrice !== 0 ? (priceChange / prevPrice) * 100 : 0;

  const chartData = useMemo(() => data.slice(-100), [data]);

  return (
    <div className="min-h-screen data-grid pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="text-black w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold tracking-tight">StockVision AI</h1>
                {isSimulated && (
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[8px] font-bold uppercase tracking-widest border border-orange-500/20">
                    Simulated Data
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Big Data Prediction System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search symbol..."
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSymbol((e.target as HTMLInputElement).value.toUpperCase());
                  }
                }}
              />
            </div>
            <div className="flex gap-1">
              {SYMBOLS.slice(0, 4).map(s => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    symbol === s ? "bg-white text-black" : "text-white/60 hover:bg-white/5"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button 
              onClick={() => fetchData(symbol)}
              className="ml-auto text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-white/40 font-mono text-sm animate-pulse">Fetching Market Data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="glass-card p-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-white/20" />
            </div>
            <div>
              <h3 className="text-xl font-serif">No Data Found</h3>
              <p className="text-white/40">We couldn't find any trading data for "{symbol}". Please check the symbol and try again.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Current Price</p>
                <div className="flex items-end gap-3">
                  <h2 className="text-3xl font-bold">{formatCurrency(currentPrice)}</h2>
                  <div className={cn(
                    "flex items-center text-sm font-medium mb-1",
                    priceChange >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {priceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(priceChangePct).toFixed(2)}%
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">24h Volume</p>
                <h2 className="text-3xl font-bold">{formatNumber(data[data.length - 1]?.volume || 0)}</h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">AI Prediction</p>
                  {prediction ? (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-2xl font-bold",
                        prediction.direction === 'UP' ? "text-emerald-400" : "text-red-400"
                      )}>
                        {prediction.direction}
                      </span>
                      <span className="text-xs text-white/40 font-mono">({(prediction.confidence * 100).toFixed(0)}% Conf)</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handlePredict}
                      disabled={predicting || loading}
                      className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                      <span className="text-sm font-bold uppercase tracking-widest">Generate Forecast</span>
                    </button>
                  )}
                </div>
                <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Cpu className="w-24 h-24" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Market Sentiment</p>
                <div className="h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: prediction ? `${prediction.confidence * 100}%` : '50%' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-mono uppercase text-white/30">
                  <span>Bearish</span>
                  <span>Bullish</span>
                </div>
              </motion.div>
            </div>

            {/* Main Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 h-[500px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                      <h3 className="font-serif text-lg">Price Analysis</h3>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.3)" 
                          fontSize={10} 
                          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.3)" 
                          fontSize={10} 
                          domain={['auto', 'auto']}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#FFF' }}
                        />
                        <Area type="monotone" dataKey="close" stroke="#10b981" fillOpacity={1} fill="url(#colorClose)" strokeWidth={2} />
                        <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="sma50" stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6 h-[300px] flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">RSI Momentum</h3>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" hide />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} ticks={[30, 70]} />
                          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Overbought', position: 'insideTopRight', fill: '#ef4444', fontSize: 8 }} />
                          <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold', position: 'insideBottomRight', fill: '#10b981', fontSize: 8 }} />
                          <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6 h-[300px] flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Trading Volume</h3>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="date" hide />
                          <YAxis hide />
                          <Bar dataKey="volume" fill="rgba(59, 130, 246, 0.5)" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Sidebar / Insights */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {prediction ? (
                    <motion.div 
                      key="prediction-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="glass-card p-6 border-emerald-500/30 bg-emerald-500/5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-serif text-lg">AI Forecast</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-mono uppercase text-white/40 mb-1">Target Price</p>
                          <p className="text-2xl font-bold">{formatCurrency(prediction.predictedPrice)}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            Investor Insights
                          </h4>
                          <p className="text-sm text-white/70 leading-relaxed italic">
                            "{prediction.insights}"
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Technical Analysis</h4>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {prediction.technicalAnalysis}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="no-prediction"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card p-8 text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <Cpu className="w-8 h-8 text-white/20" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg">No Forecast Active</h3>
                        <p className="text-sm text-white/40">Run the Big Data AI model to generate a price prediction for {symbol}.</p>
                      </div>
                      <button 
                        onClick={handlePredict}
                        disabled={predicting || loading}
                        className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                        {predicting ? 'Processing Big Data...' : 'Run Prediction Model'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Risk Assessment
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Volatility Index</span>
                      <span className="text-xs font-mono text-orange-400">MEDIUM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">RSI Signal</span>
                      <span className={cn(
                        "text-xs font-mono",
                        data[data.length - 1]?.rsi > 70 ? "text-red-400" : data[data.length - 1]?.rsi < 30 ? "text-emerald-400" : "text-white/60"
                      )}>
                        {data[data.length - 1]?.rsi > 70 ? 'OVERBOUGHT' : data[data.length - 1]?.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">MA Crossover</span>
                      <span className="text-xs font-mono text-emerald-400">GOLDEN CROSS</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer / Disclaimer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
          Disclaimer: This system is for educational purposes only. Financial markets involve high risk.
        </p>
      </footer>
    </div>
  );
}
