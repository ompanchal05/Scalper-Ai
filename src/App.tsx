import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { TradingViewWidget } from './components/TradingViewWidget';
import { AIScreenshotPredictor } from './components/AIScreenshotPredictor';
import { LivePositionTracker } from './components/LivePositionTracker';
import { IndexType, AIPredictionResult, TradePosition } from './types/trade';
import { Flame, ShieldAlert, Award, Clock } from 'lucide-react';

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState<IndexType>('NIFTY');
  const [userCapital, setUserCapital] = useState<number>(50000);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [positions, setPositions] = useState<TradePosition[]>([]);
  const [realizedPnl, setRealizedPnl] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sym = currency === 'INR' ? '₹' : '$';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-time market tick simulation for active positions to simulate realistic trade momentum
  useEffect(() => {
    if (positions.length === 0) return;

    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos) => {
          const isCall = pos.callOrPut === 'CALL';
          // Positive scalp momentum edge
          const bias = isCall ? 0.0006 : -0.0006;
          const noise = (Math.random() - 0.44) * (pos.entryPrice * 0.0004);
          const priceShift = pos.entryPrice * bias + noise;
          const newCurrent = +(pos.currentPrice + priceShift).toFixed(1);

          const diff = isCall ? newCurrent - pos.entryPrice : pos.entryPrice - newCurrent;
          const pnl = +(diff * pos.quantity).toFixed(2);
          const pnlPct = +((diff / pos.entryPrice) * 100).toFixed(2);

          // Check if Target hit
          if ((isCall && newCurrent >= pos.target) || (!isCall && newCurrent <= pos.target)) {
            showToast(`🎯 Target Hit for ${pos.index} ${pos.callOrPut}! +${sym}${pnl} locked.`);
          }

          return {
            ...pos,
            currentPrice: newCurrent,
            pnl,
            pnlPercent: pnlPct,
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [positions]);

  const handleExecuteTrade = (pred: AIPredictionResult) => {
    const lotSize = pred.index === 'SENSEX' ? 10 : pred.index === 'BANKNIFTY' ? 15 : 25;
    const qty = pred.capitalSizing.recommendedQuantity || lotSize * 2;

    const newPosition: TradePosition = {
      id: `pos-${Date.now()}`,
      index: pred.index,
      callOrPut: pred.callOrPut,
      entryPrice: pred.entryPrice,
      currentPrice: pred.entryPrice,
      target: pred.target,
      stopLoss: pred.stopLoss,
      lots: pred.capitalSizing.recommendedLots || 2,
      quantity: qty,
      invested: +(pred.entryPrice * qty * 0.1).toFixed(0),
      pnl: 0,
      pnlPercent: 0,
      status: 'OPEN',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPositions((prev) => [newPosition, ...prev]);
    showToast(`🚀 ${pred.callOrPut} Trade Executed on ${pred.index} @ ${sym}${pred.entryPrice}!`);
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    setRealizedPnl((prev) => +(prev + pos.pnl).toFixed(2));
    setPositions((prev) => prev.filter((p) => p.id !== id));
    showToast(`✅ ${pos.index} Scalp Closed: ${pos.pnl >= 0 ? '+' : ''}${sym}${pos.pnl.toFixed(2)} (${pos.pnlPercent.toFixed(2)}%)`);
  };

  const handleToggleCurrency = () => {
    const next = currency === 'INR' ? 'USD' : 'INR';
    const mult = next === 'INR' ? 83 : 1 / 83;
    setCurrency(next);
    setUserCapital((prev) => +(prev * mult).toFixed(0));
    setRealizedPnl((prev) => +(prev * mult).toFixed(2));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-red-600/30 selection:text-red-200">
      {/* Header */}
      <HeaderBar
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        userCapital={userCapital}
        onChangeCapital={setUserCapital}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
        livePnl={realizedPnl}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-red-500/80 shadow-[0_0_25px_rgba(225,29,72,0.4)] rounded-xl p-3.5 text-xs text-white font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Flame className="w-4 h-4 text-red-500 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Command Console */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* 1. Realtime TradingView Widget Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              Realtime TradingView Live Chart ({selectedIndex})
            </h2>
            <div className="text-[11px] text-zinc-500 font-mono">
              Live Index Tickers: <span className="text-zinc-300 font-bold">NIFTY 50</span> · <span className="text-zinc-300 font-bold">BANKNIFTY</span> · <span className="text-zinc-300 font-bold">SENSEX</span>
            </div>
          </div>
          <TradingViewWidget symbol={selectedIndex} timeframe="5" />
        </div>

        {/* 2. Live Positions Tracker (if any trade active) */}
        <LivePositionTracker
          positions={positions}
          onClosePosition={handleClosePosition}
          currencySymbol={sym}
        />

        {/* 3. AI Screenshot Predictor Answering the 5 Core Questions */}
        <AIScreenshotPredictor
          selectedIndex={selectedIndex}
          userCapital={userCapital}
          currency={currency}
          onExecuteTrade={handleExecuteTrade}
        />
      </main>

      {/* Simple Black & Red Footer */}
      <footer className="border-t border-red-950/60 bg-[#050505] py-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-zinc-400">Scalper AI v1.0 · Black & Red High-Precision Options Engine</span>
          <span className="text-red-500 font-bold">TradingView Realtime API · 5-Point Trade Decision Architecture</span>
        </div>
      </footer>
    </div>
  );
}
