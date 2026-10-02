import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MarketTickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  flash?: 'up' | 'down';
}

interface LiveMarketTickerProps {
  tickers: MarketTickerItem[];
  currencySymbol: string;
}

export const LiveMarketTicker: React.FC<LiveMarketTickerProps> = ({ tickers, currencySymbol }) => {
  return (
    <div className="w-full bg-[#070b12] border-b border-slate-800/80 py-2 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Live Ticks</span>
        </div>

        <div className="flex items-center gap-6">
          {tickers.map((item) => {
            const isPos = item.change >= 0;
            return (
              <div
                key={item.symbol}
                className={`flex items-center gap-2 text-xs font-mono transition-colors duration-300 ${
                  item.flash === 'up'
                    ? 'text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded'
                    : item.flash === 'down'
                    ? 'text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded'
                    : 'text-slate-300'
                }`}
              >
                <span className="font-sans font-medium text-slate-400">{item.symbol}</span>
                <span className="font-semibold text-slate-100">
                  {currencySymbol}{item.price >= 1000 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(2)}
                </span>
                <span className={`flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPos ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
          <span className="text-slate-500">Vol Ratio: <strong className="text-slate-300 font-mono">1.84x</strong></span>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <span className="text-slate-500">VIX: <strong className="text-slate-300 font-mono">13.40</strong></span>
        </div>
      </div>
    </div>
  );
};
