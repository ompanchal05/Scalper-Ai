import React from 'react';
import { Activity, ShieldAlert, Sliders, Volume2, VolumeX, DollarSign, RefreshCw, Zap } from 'lucide-react';
import { Portfolio } from '../types/trade';

interface NavbarProps {
  activeTab: 'dashboard' | 'signals' | 'scanner' | 'portfolio' | 'discipline';
  setActiveTab: (tab: 'dashboard' | 'signals' | 'scanner' | 'portfolio' | 'discipline') => void;
  portfolio: Portfolio;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onResetPortfolio: () => void;
  onToggleCurrency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  portfolio,
  soundEnabled,
  setSoundEnabled,
  onResetPortfolio,
  onToggleCurrency,
}) => {
  const isProfit = portfolio.dailyPnl >= 0;
  const currencySymbol = portfolio.currency === 'INR' ? '₹' : '$';

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur border-b border-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                SCALPER <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded tracking-wider">
                V1.0 LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Algorithmic Engine Active
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>1:2+ R:R Guard</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Zero-pill, clean interactive segment controls) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Live Terminal
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'signals'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            AI Trade Signals
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Chart Screenshot Scanner
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'portfolio'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Live Portfolio
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'discipline'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Risk & Over-Trade Guard
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Portfolio P&L Snapshot */}
          <div className="hidden sm:flex flex-col items-end text-right font-mono">
            <div className="text-[11px] text-slate-400">
              Equity: {currencySymbol}{portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{isProfit ? '+' : ''}{currencySymbol}{portfolio.dailyPnl.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({portfolio.winCount}W / {portfolio.lossCount}L)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCurrency}
              title={`Switch Currency (${portfolio.currency})`}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <DollarSign className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? 'Mute Trade Alerts' : 'Unmute Trade Alerts'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onResetPortfolio}
              title="Reset Demo Capital to $25,000 / ₹2,50,000"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 py-1.5 px-2 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 rounded ${activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`px-2 py-1 rounded ${activeTab === 'signals' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Signals
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-2 py-1 rounded ${activeTab === 'scanner' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Scan Chart
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-2 py-1 rounded ${activeTab === 'portfolio' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab('discipline')}
          className={`px-2 py-1 rounded ${activeTab === 'discipline' ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}
        >
          Rules
        </button>
      </div>
    </header>
  );
};
