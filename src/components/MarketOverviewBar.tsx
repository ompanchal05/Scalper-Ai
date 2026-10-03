import React, { useState, useEffect } from 'react';
import { Activity, Globe, TrendingUp, TrendingDown, Clock, ShieldAlert, DollarSign, BarChart3, Layers } from 'lucide-react';

export interface MarketOverviewData {
  todayDate: string;
  istTime: string;
  marketStatus: {
    isOpen: boolean;
    session: string;
    timer: string;
  };
  marketCapitalization: {
    totalIndiaMarketCap: string;
    nifty50MarketCap: string;
    bankNiftyMarketCap: string;
    sensexMarketCap: string;
    gdpRatio: string;
    fiiDiiFlow: {
      fiiNetCrores: number;
      diiNetCrores: number;
      institutionalBias: string;
    };
  };
  marketBreadth: {
    advances: number;
    declines: number;
    advanceDeclineRatio: number;
    sentiment: string;
  };
  volatilityAndSentiment: {
    indiaVix: number;
    vixChange: number;
    vixChangePercent: number;
    vixRegime: string;
    niftyPcr: number;
    bankNiftyPcr: number;
    pcrSignal: string;
  };
}

export const MarketOverviewBar: React.FC = () => {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [clockTime, setClockTime] = useState<string>('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/market-overview');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to fetch market overview:', e);
      }
    };
    fetchOverview();

    // Clock ticker every second
    const clockInterval = setInterval(() => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }));
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="w-full bg-[#050505] border-b border-red-950/70 text-zinc-300 font-mono text-xs">
      {/* Top Banner: Date, IST Live Time, Status & India Total Market Cap */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Today Date & Market Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-200">
            <span className="text-[10px] font-bold text-red-500 bg-red-950/80 border border-red-800/80 px-1.5 py-0.5 rounded tracking-wider uppercase">
              TODAY
            </span>
            <span className="font-semibold text-white">
              {data?.todayDate || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>IST: <strong className="text-white font-bold">{clockTime || data?.istTime || '11:30:00 AM'}</strong></span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-red-950/80 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${data?.marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
            <span className={data?.marketStatus.isOpen ? 'text-emerald-300 font-bold' : 'text-red-400 font-bold'}>
              {data?.marketStatus.session || 'LIVE SESSION OPEN'}
            </span>
          </div>
        </div>

        {/* Right: Total India Market Cap & India VIX & PCR */}
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-red-400" />
            <span className="text-zinc-400">Total Indian M-Cap:</span>
            <strong className="text-red-400 font-bold tracking-tight">
              {data?.marketCapitalization.totalIndiaMarketCap || '₹428.65 Lakh Cr ($5.14T)'}
            </strong>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">India VIX:</span>
            <strong className="text-amber-300 font-bold">{data?.volatilityAndSentiment.indiaVix || 13.25}</strong>
            <span className="text-emerald-400 text-[10px]">(-3.07%)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-zinc-400">NIFTY PCR:</span>
            <strong className="text-emerald-400 font-bold">{data?.volatilityAndSentiment.niftyPcr || 1.18}</strong>
            <span className="text-[10px] text-zinc-500">(Bullish)</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-zinc-400">FII Net:</span>
            <strong className="text-emerald-400 font-bold">+₹1,845 Cr</strong>
          </div>
        </div>
      </div>

      {/* Sub-strip: Individual Index Market Caps & Advance / Decline Breadth */}
      <div className="border-t border-red-950/40 bg-[#090909] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <span>NIFTY 50 M-Cap: <strong className="text-zinc-200">₹184.20 Lakh Cr</strong></span>
            <span className="text-zinc-700">|</span>
            <span>BANKNIFTY M-Cap: <strong className="text-zinc-200">₹45.10 Lakh Cr</strong></span>
            <span className="text-zinc-700">|</span>
            <span>BSE SENSEX M-Cap: <strong className="text-zinc-200">₹166.40 Lakh Cr</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>Market Breadth: <strong className="text-emerald-400">1,482 Adv</strong> / <strong className="text-red-400">694 Dec</strong> (2.13x Bullish)</span>
            <span className="text-zinc-700">|</span>
            <span className="text-red-400 font-bold">10/10 AI Algorithm Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
