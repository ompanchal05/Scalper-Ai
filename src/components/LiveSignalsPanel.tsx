import React, { useState } from 'react';
import { TradeSignal } from '../types/trade';
import { TrendingUp, TrendingDown, ArrowRight, Shield, Clock, CheckCircle2, AlertTriangle, Play, Sparkles } from 'lucide-react';

interface LiveSignalsPanelProps {
  signals: TradeSignal[];
  onExecuteTrade: (signal: TradeSignal) => void;
  onSelectSignal: (signal: TradeSignal) => void;
  activeSignalId: string | null;
  currencySymbol: string;
}

export const LiveSignalsPanel: React.FC<LiveSignalsPanelProps> = ({
  signals,
  onExecuteTrade,
  onSelectSignal,
  activeSignalId,
  currencySymbol,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CALL' | 'PUT'>('ALL');

  const filteredSignals = signals.filter((s) => {
    if (filter === 'ALL') return true;
    return s.direction === filter;
  });

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="p-4 bg-[#0d1424] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Scalper AI Signals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accurate Entry, Target 1, Target 2, and Stop Loss with RSI & Past Record Analysis
          </p>
        </div>

        {/* Filter segment control (zero-pill rule) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Signals ({signals.length})
          </button>
          <button
            onClick={() => setFilter('CALL')}
            className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1 ${
              filter === 'CALL'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Calls ({signals.filter((s) => s.direction === 'CALL').length})
          </button>
          <button
            onClick={() => setFilter('PUT')}
            className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1 ${
              filter === 'PUT'
                ? 'bg-rose-950/80 border border-rose-800 text-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Puts ({signals.filter((s) => s.direction === 'PUT').length})
          </button>
        </div>
      </div>

      {/* Signals List */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[700px]">
        {filteredSignals.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No signals match the selected filter.
          </div>
        ) : (
          filteredSignals.map((signal) => {
            const isCall = signal.direction === 'CALL';
            const isSelected = activeSignalId === signal.id;

            return (
              <div
                key={signal.id}
                onClick={() => onSelectSignal(signal)}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/90 border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'bg-[#0e1526]/80 hover:bg-[#111a30] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Symbol, Direction, Win Rate & R:R */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded ${
                        isCall
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isCall ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {signal.direction}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        {signal.name}
                        <span className="text-xs font-normal text-slate-400">({signal.timeframe})</span>
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Pattern: <span className="text-slate-300 font-sans font-medium">{signal.patternName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">R:R RATIO</span>
                      <span className="text-amber-400 font-bold">{signal.riskRewardRatio}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">HIST. WIN RATE</span>
                      <span className="text-emerald-400 font-bold">{signal.winRatePercent}%</span>
                    </div>
                    <div className="text-right pl-2 border-l border-slate-800">
                      <span className="text-slate-500 text-[10px] block">SIGNAL TIME</span>
                      <span className="text-slate-300">{signal.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Core Levels Matrix: Entry, Target 1, Target 2, SL */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 p-3 rounded-lg bg-[#070b14] border border-slate-800/80 font-mono">
                  {/* Entry */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Entry Point
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5">
                      {currencySymbol}{signal.entryPrice >= 1000 ? signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 1 }) : signal.entryPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">Candle close trigger</span>
                  </div>

                  {/* Target 1 */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Target 1 (70%)
                    </span>
                    <span className="text-sm font-bold text-emerald-300 mt-0.5">
                      {currencySymbol}{signal.target1 >= 1000 ? signal.target1.toLocaleString(undefined, { minimumFractionDigits: 1 }) : signal.target1.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-sans">Secure main profit</span>
                  </div>

                  {/* Target 2 */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Target 2 (Runner)
                    </span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5">
                      {currencySymbol}{signal.target2 >= 1000 ? signal.target2.toLocaleString(undefined, { minimumFractionDigits: 1 }) : signal.target2.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-sans">Trail with breakeven</span>
                  </div>

                  {/* Stop Loss */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Stop Loss (SL)
                    </span>
                    <span className="text-sm font-bold text-rose-400 mt-0.5">
                      {currencySymbol}{signal.stopLoss >= 1000 ? signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 1 }) : signal.stopLoss.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-rose-500 font-sans">Hard stop, zero hope</span>
                  </div>
                </div>

                {/* RSI Technical Indicator & Past Analogy */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">RSI Catalyst: </span>
                      <span className="font-mono text-cyan-300 font-bold">RSI(14) = {signal.rsiValue}</span>
                      <span className="text-slate-400"> — {signal.rsiCondition}. {signal.reasoning}</span>
                    </div>
                  </div>

                  {/* SL Hit Protocol & Over-trade Rule */}
                  <div className="flex items-start gap-2 text-amber-300/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-800/30">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-200">If SL Hits Protocol: </strong>
                      <span className="text-amber-300/90">{signal.ifSlHitsAction}</span>
                      <div className="text-[11px] text-amber-400/80 font-mono mt-1">
                        🛡️ Anti Over-Trade Guard: {signal.overTradeRule}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-mono">
                    Current: <strong className="text-white">{currencySymbol}{signal.currentPrice.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSignal(signal);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium rounded-lg transition"
                    >
                      Inspect On Chart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExecuteTrade(signal);
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition shadow-md flex items-center gap-1.5 ${
                        isCall
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Take {signal.direction} Scalp Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
