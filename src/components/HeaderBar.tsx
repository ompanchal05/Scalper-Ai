import React from 'react';
import { Flame, Activity, ShieldCheck, DollarSign } from 'lucide-react';
import { IndexType } from '../types/trade';

interface HeaderBarProps {
  selectedIndex: IndexType;
  onSelectIndex: (idx: IndexType) => void;
  userCapital: number;
  onChangeCapital: (val: number) => void;
  currency: 'INR' | 'USD';
  onToggleCurrency: () => void;
  livePnl: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedIndex,
  onSelectIndex,
  userCapital,
  onChangeCapital,
  currency,
  onToggleCurrency,
  livePnl,
}) => {
  const sym = currency === 'INR' ? '₹' : '$';

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-red-950/70 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-transform hover:scale-105">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">
                SCALPER<span className="text-red-500">AI</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/80 border border-red-800/80 px-1.5 py-0.5 rounded tracking-widest uppercase">
                BLACK & RED v1
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
              <span>Realtime Call/Put Prediction Engine</span>
            </div>
          </div>
        </div>

        {/* Realtime Index Quick Switchers */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-950 border border-red-950/80 rounded-xl">
          {(['NIFTY', 'BANKNIFTY', 'SENSEX'] as IndexType[]).map((idx) => {
            const active = selectedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => onSelectIndex(idx)}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-red-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-red-950 border border-transparent'
                }`}
              >
                {idx}
              </button>
            );
          })}
        </div>

        {/* User Capital & Live P&L */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 border border-red-950/70 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-zinc-400">Capital:</span>
            <div className="flex items-center">
              <span className="text-red-400 font-bold">{sym}</span>
              <input
                type="number"
                value={userCapital}
                onChange={(e) => onChangeCapital(Math.max(Number(e.target.value) || 1000, 100))}
                className="w-20 bg-transparent text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1"
                step="5000"
              />
            </div>
          </div>

          <button
            onClick={onToggleCurrency}
            title={`Switch Currency (${currency})`}
            className="p-2 rounded-lg bg-zinc-950 border border-red-950/70 text-zinc-400 hover:text-red-400 hover:border-red-600 transition"
          >
            <DollarSign className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex flex-col items-end font-mono text-xs">
            <span className="text-[10px] text-zinc-500 uppercase">Live Session P&L</span>
            <span className={`font-bold ${livePnl >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
              {livePnl >= 0 ? '+' : ''}{sym}{livePnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Index Bar */}
      <div className="md:hidden flex items-center justify-around bg-zinc-950 border-t border-red-950/60 py-1.5 px-3">
        {(['NIFTY', 'BANKNIFTY', 'SENSEX'] as IndexType[]).map((idx) => (
          <button
            key={idx}
            onClick={() => onSelectIndex(idx)}
            className={`px-3 py-1 text-xs font-mono font-bold rounded ${
              selectedIndex === idx ? 'bg-red-600 text-white' : 'text-zinc-400'
            }`}
          >
            {idx}
          </button>
        ))}
      </div>
    </header>
  );
};
