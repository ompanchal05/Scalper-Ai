import React from 'react';
import { TradePosition } from '../types/trade';
import { TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';

interface LivePositionTrackerProps {
  positions: TradePosition[];
  onClosePosition: (id: string) => void;
  currencySymbol: string;
}

export const LivePositionTracker: React.FC<LivePositionTrackerProps> = ({
  positions,
  onClosePosition,
  currencySymbol,
}) => {
  if (positions.length === 0) return null;

  return (
    <div className="bg-[#080808] border border-red-950/80 rounded-xl p-4 shadow-[0_0_20px_rgba(225,29,72,0.15)] transition-all duration-300 hover:border-red-600/60">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-red-950/70">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
            Live Active Scalp Positions ({positions.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">Auto-Tracking Live Market Ticks</span>
      </div>

      <div className="space-y-3">
        {positions.map((pos) => {
          const isCall = pos.callOrPut === 'CALL';
          const isProfit = pos.pnl >= 0;

          return (
            <div
              key={pos.id}
              className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-black border border-red-950/70 gap-3 font-mono text-xs transition-all hover:border-red-500/50"
            >
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  isCall
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {pos.callOrPut}
                </span>
                <div>
                  <span className="font-bold text-white text-sm font-sans">{pos.index}</span>
                  <span className="text-[10px] text-zinc-500 block">
                    {pos.lots} Lots ({pos.quantity} Qty) · Entry: {currencySymbol}{pos.entryPrice}
                  </span>
                </div>
              </div>

              {/* Price progress */}
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 block">CURRENT</span>
                  <span className="font-bold text-white text-sm">{currencySymbol}{pos.currentPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-500 block">TARGET</span>
                  <span className="font-bold text-emerald-400 text-sm">{currencySymbol}{pos.target}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-500 block">STOP LOSS</span>
                  <span className="font-bold text-red-500 text-sm">{currencySymbol}{pos.stopLoss}</span>
                </div>
              </div>

              {/* Live Ticking P&L & Book button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block">UNREALIZED P&L</span>
                  <span className={`text-base font-black flex items-center gap-1 ${
                    isProfit ? 'text-emerald-400' : 'text-red-500'
                  }`}>
                    {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isProfit ? '+' : ''}{currencySymbol}{pos.pnl.toFixed(2)}</span>
                    <span className="text-[11px] font-normal">({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)</span>
                  </span>
                </div>

                <button
                  onClick={() => onClosePosition(pos.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-sans font-bold shadow-md transition-all hover:scale-105"
                >
                  Book / Exit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
