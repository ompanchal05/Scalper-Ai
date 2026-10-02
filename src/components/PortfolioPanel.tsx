import React from 'react';
import { Portfolio, Position } from '../types/trade';
import { TrendingUp, TrendingDown, DollarSign, ShieldAlert, Award, Clock, XCircle, CheckCircle, Sliders } from 'lucide-react';

interface PortfolioPanelProps {
  portfolio: Portfolio;
  positions: Position[];
  closedPositions: Position[];
  onClosePosition: (id: string, reason?: 'TARGET_1' | 'TARGET_2' | 'STOP_LOSS' | 'MANUAL') => void;
  onMoveToBreakeven: (id: string) => void;
  currencySymbol: string;
}

export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({
  portfolio,
  positions,
  closedPositions,
  onClosePosition,
  onMoveToBreakeven,
  currencySymbol,
}) => {
  const totalUnrealizedPnl = positions.reduce((acc, pos) => acc + pos.unrealizedPnl, 0);
  const isUnrealizedProfit = totalUnrealizedPnl >= 0;
  const isDailyProfit = portfolio.dailyPnl >= 0;
  const winRate = portfolio.totalTradesToday > 0 ? ((portfolio.winCount / portfolio.totalTradesToday) * 100).toFixed(1) : '80.0';

  return (
    <div className="space-y-6">
      {/* 1. Real-time Portfolio Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Equity */}
        <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Total Account Equity</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
            {currencySymbol}{portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-2">
            Starting: {currencySymbol}{portfolio.startingBalance.toLocaleString()}
          </div>
        </div>

        {/* Live Unrealized P&L */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
          isUnrealizedProfit
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Live Unrealized P&L</span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Ticking
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono mt-1 flex items-center gap-1">
            {isUnrealizedProfit ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            <span>{isUnrealizedProfit ? '+' : ''}{currencySymbol}{totalUnrealizedPnl.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-2">
            Active in {positions.length} open position{positions.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Realized Daily P&L */}
        <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Realized P&L (Today)</span>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${isDailyProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isDailyProfit ? '+' : ''}{currencySymbol}{portfolio.dailyPnl.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-2 flex items-center gap-2">
            <span>{portfolio.winCount} Won</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{portfolio.lossCount} Lost</span>
          </div>
        </div>

        {/* Over-trading & Discipline Guard */}
        <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Over-Trade Guard</span>
            <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.5 rounded font-bold">
              PROTECTED
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-200 mt-1 flex items-baseline gap-1">
            <span>{portfolio.totalTradesToday}</span>
            <span className="text-sm text-slate-500 font-normal">/ {portfolio.maxTradesDaily} Max Trades</span>
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono mt-2">
            {portfolio.totalTradesToday >= portfolio.maxTradesDaily
              ? '⚠️ Daily Limit Reached. No new trades allowed.'
              : `${portfolio.maxTradesDaily - portfolio.totalTradesToday} scalps remaining today`}
          </div>
        </div>
      </div>

      {/* 2. Open Positions (Live Trade Real-Time Simulator) */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-[#0d1424] border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Active Open Positions ({positions.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live market feed automatically updating profits, trailing stops, and target triggers
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {positions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No active open positions. Click "Take Scalp Now" on any signal or scan a chart to execute a trade!
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-sans text-[11px] bg-slate-900/60">
                  <th className="py-3 px-4">Symbol / Direction</th>
                  <th className="py-3 px-4">Entry</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Target 1 & 2</th>
                  <th className="py-3 px-4">Stop Loss</th>
                  <th className="py-3 px-4">Live P&L</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => {
                  const isCall = pos.direction === 'CALL';
                  const isPosProfit = pos.unrealizedPnl >= 0;
                  const targetDist = Math.abs(pos.target1 - pos.entryPrice);
                  const currDist = Math.abs(pos.currentPrice - pos.entryPrice);
                  const progressPct = Math.min(Math.max((currDist / (targetDist || 1)) * 100, 0), 100);

                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/50 transition">
                      {/* Symbol & Direction */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            isCall
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}>
                            {pos.direction}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{pos.symbol}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{pos.quantity} Lots</span>
                          </div>
                        </div>
                      </td>

                      {/* Entry Price */}
                      <td className="py-3.5 px-4 text-slate-200">
                        {currencySymbol}{pos.entryPrice.toFixed(2)}
                      </td>

                      {/* Current Price */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        {currencySymbol}{pos.currentPrice.toFixed(2)}
                      </td>

                      {/* Targets */}
                      <td className="py-3.5 px-4 text-emerald-400">
                        <div>T1: {currencySymbol}{pos.target1.toFixed(1)}</div>
                        <div className="text-[10px] text-emerald-500">T2: {currencySymbol}{pos.target2.toFixed(1)}</div>
                      </td>

                      {/* Stop Loss */}
                      <td className="py-3.5 px-4 text-rose-400">
                        {currencySymbol}{pos.stopLoss.toFixed(1)}
                      </td>

                      {/* Live P&L with Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className={`font-bold text-sm flex items-center gap-1 ${
                          isPosProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          <span>{isPosProfit ? '+' : ''}{currencySymbol}{pos.unrealizedPnl.toFixed(2)}</span>
                          <span className="text-[10px] font-normal">
                            ({isPosProfit ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                          </span>
                        </div>
                        {/* Progress to target 1 */}
                        <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${isPosProfit ? 'bg-emerald-400' : 'bg-rose-400'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onMoveToBreakeven(pos.id)}
                            title="Move Stop Loss to Entry Price (Lock Breakeven)"
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-sans font-medium transition"
                          >
                            SL to BE
                          </button>
                          <button
                            onClick={() => onClosePosition(pos.id, 'MANUAL')}
                            className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-[10px] font-sans font-bold transition shadow"
                          >
                            Close / Book
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Closed Trades History Journal */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-[#0d1424] border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Completed Scalps Journal
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Win Rate: <strong className="text-emerald-400 font-bold">{winRate}%</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          {closedPositions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No completed trades yet today.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-sans text-[11px] bg-slate-900/60">
                  <th className="py-2.5 px-4">Trade</th>
                  <th className="py-2.5 px-4">Entry</th>
                  <th className="py-2.5 px-4">Exit</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Exit Reason</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedPositions.map((pos) => {
                  const isWon = (pos.unrealizedPnl || 0) >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/30">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">
                        <span className={`inline-block mr-1.5 px-1.5 py-0.2 rounded text-[10px] ${
                          pos.direction === 'CALL' ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'
                        }`}>
                          {pos.direction}
                        </span>
                        {pos.symbol}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{currencySymbol}{pos.entryPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-slate-300">{currencySymbol}{pos.closePrice?.toFixed(2) || pos.currentPrice.toFixed(2)}</td>
                      <td className={`py-2.5 px-4 font-bold ${isWon ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWon ? '+' : ''}{currencySymbol}{pos.unrealizedPnl.toFixed(2)} ({isWon ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          pos.exitReason === 'TARGET_1' || pos.exitReason === 'TARGET_2'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : pos.exitReason === 'STOP_LOSS'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-900 text-slate-300'
                        }`}>
                          {pos.exitReason?.replace('_', ' ') || 'PROFIT BOOKED'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-sans text-[11px]">{pos.closeTime || 'Just now'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
