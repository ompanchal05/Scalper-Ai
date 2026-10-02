import React from 'react';
import { PAST_RECORDS } from '../data/mockMarketData';
import { ShieldCheck, AlertOctagon, CheckCircle2, BookOpen, Target, Repeat, Sparkles } from 'lucide-react';

interface DisciplineRulesViewProps {
  currencySymbol: string;
}

export const DisciplineRulesView: React.FC<DisciplineRulesViewProps> = ({ currencySymbol }) => {
  return (
    <div className="space-y-6">
      {/* 1. The Core 4 Golden Scalper AI Rules */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            Scalper AI Core Trading Architecture & Anti-Overtrade Constitution
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Rule 1: Accurate Entry Confirmation */}
          <div className="p-4 bg-[#090d16] border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">1</span>
              <span>Accurate Candle Body Entry Trigger</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Never front-run trade signals before the designated timeframe candle closes. Entry is valid ONLY when a candle body closes past the trigger price with 1.5x volume expansion.
            </p>
          </div>

          {/* Rule 2: 70/30 Profit Booking Strategy */}
          <div className="p-4 bg-[#090d16] border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px]">2</span>
              <span>Target 1 (70%) & Runner (30%) Exit Model</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Lock in 70% of position size at Target 1 (1:2 RR). Immediately move the protective Stop Loss to breakeven (entry price). Allow remaining 30% runner quantity to target big extensions risk-free.
            </p>
          </div>

          {/* Rule 3: Strict SL Hit & Secondary Recovery Rule */}
          <div className="p-4 bg-[#090d16] border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-[10px]">3</span>
              <span>If SL Hits: Specific Second Trade Setup Only</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When Stop Loss is tagged, exit instantaneously without hesitation or hoping. A secondary recovery trade is ONLY permitted if price tests the documented secondary institutional liquidity level with confirmed reversal.
            </p>
          </div>

          {/* Rule 4: Anti Over-Trading Circuit Breaker */}
          <div className="p-4 bg-[#090d16] border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-[10px]">4</span>
              <span>Max 2-3 Trades Daily (Zero Revenge Trading)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Over-trading is the #1 account killer. Scalper AI enforces a strict cap of 2 to 3 trades per session. If 2 consecutive stop losses occur, the system mandates terminal closure for the day.
            </p>
          </div>
        </div>
      </div>

      {/* 2. RSI Indicator Technical Mechanics */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">RSI (14) Indicator Strategy Integration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="font-bold text-emerald-400 block mb-1">RSI Oversold (&lt;30) Call Scalps</span>
            <p className="text-slate-400 leading-relaxed">
              When RSI drops below 30 into demand support and exhibits higher trough divergence while price makes equal or lower lows, the probability of a sharp mean-reversion bounce exceeds 80%.
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="font-bold text-rose-400 block mb-1">RSI Overbought (&gt;70) Put Scalps</span>
            <p className="text-slate-400 leading-relaxed">
              When RSI pushes above 70 into upper resistance bands/VWAP with long upper wicks, buyer exhaustion triggers swift profit-taking and long liquidations, ideal for quick 5-15 point Put scalps.
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="font-bold text-amber-400 block mb-1">Chop Zone Filter (RSI 45 - 55)</span>
            <p className="text-slate-400 leading-relaxed">
              When RSI oscillates flatly around the 50 centerline with compressed Bollinger Bands, the engine blocks all scalps to prevent choppy fakeouts and commission drag.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Historical Backtest Records Journal */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-[#0d1424] border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Past Records & Strategy Backtested Accuracy
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical performance precedent verifying win rates across similar RSI and chart pattern occurrences
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Cumulative Expectancy: +2.44 R:R
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans text-[11px] bg-slate-900/60">
                <th className="py-2.5 px-4">Historical Date / Session</th>
                <th className="py-2.5 px-4">Asset / Type</th>
                <th className="py-2.5 px-4">Pattern & RSI Trigger</th>
                <th className="py-2.5 px-4">Outcome</th>
                <th className="py-2.5 px-4">R:R Realized</th>
                <th className="py-2.5 px-4">Discipline Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {PAST_RECORDS.map((rec) => {
                const isProfit = rec.outcome === 'PROFIT';
                return (
                  <tr key={rec.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <div>{rec.date}</div>
                      <span className="text-[10px] text-slate-500">{rec.session}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <span className={`inline-block mr-1.5 px-1.5 py-0.2 rounded text-[10px] ${
                        rec.direction === 'CALL' ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'
                      }`}>
                        {rec.direction}
                      </span>
                      {rec.symbol}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      <div>{rec.pattern}</div>
                      <span className="text-[10px] text-cyan-400 font-mono">RSI: {rec.rsiTrigger}</span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        isProfit
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {isProfit ? `WIN (+${rec.gainPercent}%)` : `SL HIT (${rec.gainPercent}%)`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-bold">{rec.rrRatio}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-[11px] leading-relaxed max-w-xs">
                      {rec.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
