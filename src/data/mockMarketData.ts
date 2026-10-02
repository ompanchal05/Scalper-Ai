import { TradeSignal, PastRecord, Candle } from '../types/trade';

// Pre-packaged chart screenshot data URLs for instant 1-click testing
export const SAMPLE_CHART_PRESETS = [
  {
    id: 'nifty-call-breakout',
    name: 'NIFTY 50 (5M) - Morning Call Scalp',
    asset: 'NIFTY 50',
    timeframe: '5m',
    type: 'CALL',
    description: 'Demand Zone double-bounce with RSI bullish divergence at 28.5',
    svgColor: '#10b981',
    dataUrl: createChartSvgDataUrl({
      symbol: 'NIFTY 50 [5m] · NSE',
      title: 'Bullish Hammer Demand Bounce',
      trend: 'up',
      basePrice: 22460,
      rsi: 31.2,
      isCall: true,
    }),
  },
  {
    id: 'banknifty-put-rejection',
    name: 'BANKNIFTY (15M) - Supply Put Scalp',
    asset: 'BANKNIFTY',
    timeframe: '15m',
    type: 'PUT',
    description: 'Rejection wick at upper VWAP resistance band with RSI overbought at 74.2',
    svgColor: '#f43f5e',
    dataUrl: createChartSvgDataUrl({
      symbol: 'BANKNIFTY [15m] · NSE',
      title: 'Upper Band Rejection Star',
      trend: 'down',
      basePrice: 48550,
      rsi: 74.8,
      isCall: false,
    }),
  },
  {
    id: 'btc-call-reversal',
    name: 'BTC/USDT (3M) - Liquidity Sweep Call',
    asset: 'BTC/USDT',
    timeframe: '3m',
    type: 'CALL',
    description: 'Support wick sweep below previous swing low, immediate reclaiming candle',
    svgColor: '#06b6d4',
    dataUrl: createChartSvgDataUrl({
      symbol: 'BTCUSDT [3m] · Binance',
      title: 'Liquidity Grab & Reclaim',
      trend: 'up',
      basePrice: 65420,
      rsi: 29.4,
      isCall: true,
    }),
  },
  {
    id: 'spy-put-breakdown',
    name: 'SPY (1M) - Opening Range Breakdown',
    asset: 'SPY',
    timeframe: '1m',
    type: 'PUT',
    description: 'Failed high break followed by high-volume 9 EMA breakdown',
    svgColor: '#e11d48',
    dataUrl: createChartSvgDataUrl({
      symbol: 'SPY [1m] · NYSE',
      title: 'VWAP Breakdown Momentum',
      trend: 'down',
      basePrice: 546.8,
      rsi: 68.9,
      isCall: false,
    }),
  },
];

// Helper to generate realistic high-resolution SVG candlestick screenshots
function createChartSvgDataUrl({
  symbol,
  title,
  trend,
  basePrice,
  rsi,
  isCall,
}: {
  symbol: string;
  title: string;
  trend: 'up' | 'down';
  basePrice: number;
  rsi: number;
  isCall: boolean;
}): string {
  const candlesSvg = [];
  let price = basePrice - (trend === 'up' ? 30 : -30);
  const count = 32;

  for (let i = 0; i < count; i++) {
    const x = 50 + i * 22;
    const isBull = trend === 'up' ? (i > count - 8 ? true : Math.random() > 0.42) : (i > count - 8 ? false : Math.random() > 0.58);
    const bodyHeight = 10 + Math.random() * 24;
    const wickHigh = 4 + Math.random() * 12;
    const wickLow = 4 + Math.random() * 12;
    const delta = isBull ? bodyHeight * 0.8 : -bodyHeight * 0.8;
    price += delta;

    const yMid = 180 - (price - basePrice) * 1.8;
    const candleColor = isBull ? '#10b981' : '#f43f5e';
    const topY = isBull ? yMid - bodyHeight : yMid;

    candlesSvg.push(`
      <line x1="${x + 6}" y1="${topY - wickHigh}" x2="${x + 6}" y2="${topY + bodyHeight + wickLow}" stroke="${candleColor}" stroke-width="1.5" />
      <rect x="${x}" y="${topY}" width="12" height="${bodyHeight}" fill="${candleColor}" rx="1" />
    `);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="460" viewBox="0 0 800 460" style="background:#0b0f19; font-family: ui-monospace, SFMono-Regular, monospace;">
    <!-- Grid -->
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.7" stroke-opacity="0.4" />
      </pattern>
      <linearGradient id="rsiGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="460" fill="#090d16" />
    <rect width="800" height="340" fill="url(#grid)" />

    <!-- Top Watermark & Header -->
    <rect x="0" y="0" width="800" height="36" fill="#0f172a" />
    <text x="20" y="24" fill="#f8fafc" font-size="14" font-weight="bold">${symbol}</text>
    <text x="240" y="24" fill="#94a3b8" font-size="12">O: ${(basePrice - 2).toFixed(2)}  H: ${(basePrice + 14).toFixed(2)}  L: ${(basePrice - 12).toFixed(2)}  C: ${basePrice.toFixed(2)}</text>
    <text x="640" y="24" fill="${isCall ? '#10b981' : '#f43f5e'}" font-size="12" font-weight="bold">${isCall ? 'BULLISH SETUP' : 'BEARISH SETUP'}</text>

    <!-- Candlesticks -->
    ${candlesSvg.join('')}

    <!-- EMA lines -->
    <path d="M 50 200 Q 250 190, 450 170 T 750 ${isCall ? 140 : 230}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2"/>
    <path d="M 50 215 Q 260 205, 470 185 T 750 ${isCall ? 160 : 250}" fill="none" stroke="#a855f7" stroke-width="2"/>
    <text x="680" y="60" fill="#38bdf8" font-size="11">EMA(9): ${(basePrice + 3).toFixed(1)}</text>
    <text x="680" y="76" fill="#a855f7" font-size="11">EMA(21): ${(basePrice - 2).toFixed(1)}</text>

    <!-- Sub-Chart Separator: RSI -->
    <rect x="0" y="340" width="800" height="120" fill="#0b0f19" />
    <line x1="0" y1="340" x2="800" y2="340" stroke="#334155" stroke-width="1.5" />
    <text x="20" y="360" fill="#cbd5e1" font-size="12" font-weight="bold">RSI(14): <tspan fill="${rsi < 35 ? '#10b981' : rsi > 65 ? '#f43f5e' : '#38bdf8'}">${rsi.toFixed(1)}</tspan></text>
    <line x1="20" y1="375" x2="780" y2="375" stroke="#475569" stroke-width="0.8" stroke-dasharray="3 3"/>
    <text x="750" y="378" fill="#64748b" font-size="10">70</text>
    <line x1="20" y1="420" x2="780" y2="420" stroke="#475569" stroke-width="0.8" stroke-dasharray="3 3"/>
    <text x="750" y="423" fill="#64748b" font-size="10">30</text>
    
    <!-- RSI line -->
    <path d="M 50 ${rsi < 40 ? 420 : 370} C 200 ${rsi < 40 ? 410 : 380}, 400 ${rsi < 40 ? 430 : 365}, 750 ${rsi < 40 ? 415 : 372}" fill="none" stroke="#38bdf8" stroke-width="2.5" />

    <!-- Pattern tag box -->
    <rect x="20" y="55" width="230" height="34" rx="4" fill="#020617" stroke="#334155" stroke-width="1" />
    <text x="32" y="76" fill="#f8fafc" font-size="12" font-weight="600">[SETUP] ${title}</text>
  </svg>`;

  const safeBase64 = (str: string) => {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
    } catch {
      return btoa(str.replace(/[^\x00-\x7F]/g, ''));
    }
  };

  return `data:image/svg+xml;base64,${safeBase64(svg)}`;
}

// Initial live scalp signals
export const INITIAL_SIGNALS: TradeSignal[] = [
  {
    id: 'sig-001',
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index (5M)',
    assetType: 'INDEX',
    direction: 'CALL',
    timeframe: '5m',
    entryPrice: 22460.0,
    target1: 22495.0,
    target2: 22530.0,
    stopLoss: 22438.0,
    currentPrice: 22474.5,
    pnlPercent: 0.88,
    status: 'ACTIVE',
    rsiValue: 29.8,
    rsiCondition: 'Oversold Divergence Rebound (<30)',
    patternName: 'Demand Zone Hammer Reversal',
    winRatePercent: 82.4,
    riskRewardRatio: '1:2.4',
    reasoning:
      '5-minute candle printed sharp hammer wick at institutional demand zone. RSI formed classic bullish divergence with expanding buy volume above 9 EMA.',
    ifSlHitsAction:
      'If Stop Loss hits at 22,438: DO NOT REVENGE TRADE. Secondary bounce level is at 22,410. Only enter Trade 2 if 22,410 prints a green engulfing candle.',
    overTradeRule:
      'Max 2 trades today. If this trade hits target or SL, pause minimum 20 minutes before next evaluation.',
    timestamp: '10:15 AM',
  },
  {
    id: 'sig-002',
    symbol: 'BANKNIFTY',
    name: 'BANKNIFTY Index (15M)',
    assetType: 'INDEX',
    direction: 'PUT',
    timeframe: '15m',
    entryPrice: 48540.0,
    target1: 48420.0,
    target2: 48310.0,
    stopLoss: 48610.0,
    currentPrice: 48510.0,
    pnlPercent: 0.62,
    status: 'ACTIVE',
    rsiValue: 73.5,
    rsiCondition: 'Overbought Supply Exhaustion (>70)',
    patternName: 'Upper VWAP Band Shooting Star',
    winRatePercent: 78.9,
    riskRewardRatio: '1:2.3',
    reasoning:
      'Price rejected decisively from major daily resistance. RSI reached 73.5 showing exhaustion and heavy call writing at 48,600 strike.',
    ifSlHitsAction:
      'If SL is breached at 48,610, STOP all Put trades immediately. Bulls will trigger short-squeeze up to 48,750.',
    overTradeRule:
      'Strict adherence: Never increase lot size after a loss. Follow 1.5% fixed account risk.',
    timestamp: '10:28 AM',
  },
  {
    id: 'sig-003',
    symbol: 'BTC/USDT',
    name: 'Bitcoin Perpetual (3M)',
    assetType: 'CRYPTO',
    direction: 'CALL',
    timeframe: '3m',
    entryPrice: 65420.0,
    target1: 65880.0,
    target2: 66250.0,
    stopLoss: 65210.0,
    currentPrice: 65690.0,
    pnlPercent: 2.14,
    status: 'ACTIVE',
    rsiValue: 34.2,
    rsiCondition: 'Hidden Bullish Momentum Cross',
    patternName: 'Liquidity Grab & VWAP Reclaim',
    winRatePercent: 84.1,
    riskRewardRatio: '1:2.8',
    reasoning:
      'Aggressive liquidity sweep below $65,300 with immediate V-shape recovery back over 21 EMA. Funding rate reset to neutral.',
    ifSlHitsAction:
      'If $65,210 SL triggers, stay flat. The order book indicates a cascade risk down to $64,500.',
    overTradeRule:
      'No more crypto scalps after 2 trades during European/US session overlap.',
    timestamp: '10:41 AM',
  },
  {
    id: 'sig-004',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF (1M)',
    assetType: 'EQUITY',
    direction: 'PUT',
    timeframe: '1m',
    entryPrice: 546.8,
    target1: 544.9,
    target2: 543.2,
    stopLoss: 547.8,
    currentPrice: 545.9,
    pnlPercent: 0.92,
    status: 'ACTIVE',
    rsiValue: 69.1,
    rsiCondition: 'Bearish Breakdown Momentum',
    patternName: 'Opening Range Low Breakdown',
    winRatePercent: 76.5,
    riskRewardRatio: '1:2.1',
    reasoning:
      'Failed opening range breakout followed by sharp breakdown under VWAP. Big institutional block sell orders detected.',
    ifSlHitsAction:
      'If $547.80 hits, exit and lock trading. Range contraction implies chop zone.',
    overTradeRule:
      'Zero revenge trading. Cap total trades to 3 across all asset classes.',
    timestamp: '10:48 AM',
  },
];

// Historical trade journal records to demonstrate past performance
export const PAST_RECORDS: PastRecord[] = [
  {
    id: 'past-1',
    date: 'Yesterday, 02:45 PM',
    symbol: 'NIFTY 50',
    pattern: 'Double Bottom with RSI Divergence',
    direction: 'CALL',
    rsiTrigger: 28.2,
    outcome: 'PROFIT',
    rrRatio: '1:2.6',
    gainPercent: 2.85,
    session: 'Closing Power Hour',
    notes: 'Hit Target 2 in 11 minutes. Booked 75% at T1, runner booked near day high.',
  },
  {
    id: 'past-2',
    date: 'Yesterday, 11:20 AM',
    symbol: 'BANKNIFTY',
    pattern: 'VWAP Rejection Wick',
    direction: 'PUT',
    rsiTrigger: 72.8,
    outcome: 'PROFIT',
    rrRatio: '1:2.4',
    gainPercent: 1.95,
    session: 'Midday Reversal',
    notes: 'Exited clean at Target 1. Followed rule not to over-stay in sideways regime.',
  },
  {
    id: 'past-3',
    date: 'Yesterday, 09:35 AM',
    symbol: 'BTC/USDT',
    pattern: 'Break of Structure (BOS)',
    direction: 'CALL',
    rsiTrigger: 33.1,
    outcome: 'LOSS',
    rrRatio: '1:2.2',
    gainPercent: -0.75,
    session: 'Asian Morning Open',
    notes: 'SL hit at -0.75%. Obeyed rule: Took second trade 35 min later at support and recovered +2.2%.',
  },
  {
    id: 'past-4',
    date: '2 Days Ago, 01:10 PM',
    symbol: 'SPY',
    pattern: 'Rising Wedge Breakdown',
    direction: 'PUT',
    rsiTrigger: 71.4,
    outcome: 'PROFIT',
    rrRatio: '1:3.1',
    gainPercent: 3.4,
    session: 'Fed Speaker Session',
    notes: 'High volatility runner achieved Target 2 smoothly with trailing stop loss.',
  },
  {
    id: 'past-5',
    date: '2 Days Ago, 10:05 AM',
    symbol: 'NIFTY 50',
    pattern: 'Morning Opening Gap Fill',
    direction: 'CALL',
    rsiTrigger: 32.0,
    outcome: 'PROFIT',
    rrRatio: '1:2.5',
    gainPercent: 2.1,
    session: 'Opening Bell Scalp',
    notes: 'RSI oversold rebound off prior day close. Solid +2.1% profit locked.',
  },
];

// Initial candle stream generator for chart
export function generateInitialCandles(symbol: string, basePrice: number, count = 40): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.99;
  const now = Date.now();
  const intervalMs = 60 * 1000 * 5; // 5 min interval

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const volatility = basePrice * 0.0025;
    const change = (Math.random() - 0.48) * volatility;
    const open = +price.toFixed(2);
    const close = +(price + change).toFixed(2);
    const high = +(Math.max(open, close) + Math.random() * volatility * 0.7).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * volatility * 0.7).toFixed(2);
    const volume = Math.floor(1500 + Math.random() * 8500);

    // Approximate RSI & EMAs
    const rsi = +(35 + Math.sin(i * 0.3) * 25 + Math.random() * 8).toFixed(1);
    const ema9 = +(close * 0.998).toFixed(2);
    const ema21 = +(close * 0.995).toFixed(2);

    candles.push({
      time: timeStr,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      rsi,
      ema9,
      ema21,
    });

    price = close;
  }

  return candles;
}
