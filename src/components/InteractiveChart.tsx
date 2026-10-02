import React, { useState, useRef, useEffect } from 'react';
import { Candle, TradeSignal } from '../types/trade';
import { Crosshair, Eye, EyeOff, Layers, Maximize2 } from 'lucide-react';

interface InteractiveChartProps {
  candles: Candle[];
  activeSignal: TradeSignal | null;
  symbol: string;
  timeframe: string;
  onSelectTimeframe: (tf: string) => void;
  onSelectSymbol: (sym: string) => void;
  currencySymbol: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  activeSignal,
  symbol,
  timeframe,
  onSelectTimeframe,
  onSelectSymbol,
  currencySymbol,
}) => {
  const [showIndicators, setShowIndicators] = useState({
    ema: true,
    volume: true,
    rsi: true,
    signalLines: true,
  });
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
        Loading real-time market candles...
      </div>
    );
  }

  const latestCandle = candles[candles.length - 1];
  const activeHover = hoveredCandle || latestCandle;

  // Chart dimensions
  const height = 480;
  const padding = { top: 25, right: 75, bottom: 120, left: 15 };
  const rsiHeight = 85;
  const priceChartHeight = height - padding.bottom;

  // Calculate scales
  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;
  const bufferedMin = minPrice - priceRange * 0.08;
  const bufferedMax = maxPrice + priceRange * 0.08;
  const bufferedRange = bufferedMax - bufferedMin;

  const maxVolume = Math.max(...candles.map((c) => c.volume), 1000);

  const usableWidth = Math.max(containerWidth - padding.left - padding.right, 300);
  const candleSlotWidth = usableWidth / candles.length;
  const candleBodyWidth = Math.max(candleSlotWidth * 0.65, 3);

  const getPriceY = (price: number) => {
    return priceChartHeight - ((price - bufferedMin) / bufferedRange) * (priceChartHeight - padding.top);
  };

  const getRsiY = (rsiVal: number) => {
    const rsiTop = height - rsiHeight - 10;
    const rsiBottom = height - 10;
    return rsiBottom - (rsiVal / 100) * (rsiBottom - rsiTop);
  };

  // Build EMA Paths
  const ema9Points = candles
    .map((c, i) => {
      const x = padding.left + i * candleSlotWidth + candleSlotWidth / 2;
      const y = getPriceY(c.ema9);
      return `${x},${y}`;
    })
    .join(' L ');

  const ema21Points = candles
    .map((c, i) => {
      const x = padding.left + i * candleSlotWidth + candleSlotWidth / 2;
      const y = getPriceY(c.ema21);
      return `${x},${y}`;
    })
    .join(' L ');

  // Build RSI Path
  const rsiPoints = candles
    .map((c, i) => {
      const x = padding.left + i * candleSlotWidth + candleSlotWidth / 2;
      const y = getRsiY(c.rsi);
      return `${x},${y}`;
    })
    .join(' L ');

  return (
    <div
      ref={containerRef}
      className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden flex flex-col"
    >
      {/* Chart Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0d1424] border-b border-slate-800/80">
        {/* Symbol & Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {['NIFTY 50', 'BANKNIFTY', 'BTC/USDT', 'SPY'].map((sym) => (
              <button
                key={sym}
                onClick={() => onSelectSymbol(sym)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  symbol === sym
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {['1m', '3m', '5m', '15m'].map((tf) => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-slate-800 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIndicators((p) => ({ ...p, ema: !p.ema }))}
            className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
              showIndicators.ema
                ? 'bg-sky-950/60 border-sky-800 text-sky-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            EMA (9/21)
          </button>
          <button
            onClick={() => setShowIndicators((p) => ({ ...p, rsi: !p.rsi }))}
            className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
              showIndicators.rsi
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            RSI (14)
          </button>
          <button
            onClick={() => setShowIndicators((p) => ({ ...p, signalLines: !p.signalLines }))}
            className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
              showIndicators.signalLines
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Target & SL Lines
          </button>
        </div>
      </div>

      {/* OHLCV Readout Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#090d16] text-[11px] font-mono border-b border-slate-800/60 text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 font-sans">{symbol}</span>
          <span className="text-slate-500">[{timeframe}]</span>
          <span>O: <strong className="text-slate-200">{activeHover.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-slate-200">{activeHover.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-slate-200">{activeHover.low.toFixed(2)}</strong></span>
          <span>C: <strong className={activeHover.close >= activeHover.open ? 'text-emerald-400' : 'text-rose-400'}>
            {activeHover.close.toFixed(2)}
          </strong></span>
          <span>Vol: <strong className="text-slate-300">{activeHover.volume.toLocaleString()}</strong></span>
        </div>

        <div className="flex items-center gap-4">
          {showIndicators.ema && (
            <>
              <span className="text-sky-400">EMA9: {activeHover.ema9.toFixed(2)}</span>
              <span className="text-purple-400">EMA21: {activeHover.ema21.toFixed(2)}</span>
            </>
          )}
          {showIndicators.rsi && (
            <span className={activeHover.rsi < 35 ? 'text-emerald-400 font-bold' : activeHover.rsi > 65 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              RSI(14): {activeHover.rsi.toFixed(1)} {activeHover.rsi < 35 ? '⚡ (OVERSOLD)' : activeHover.rsi > 65 ? '⚠️ (OVERBOUGHT)' : ''}
            </span>
          )}
        </div>
      </div>

      {/* SVG Candlestick Chart Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${containerWidth} ${height}`}
          className="w-full block"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          {/* Background Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = padding.top + (priceChartHeight - padding.top) * ratio;
            const priceVal = bufferedMax - ratio * bufferedRange;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={containerWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="0.7"
                  strokeDasharray="4 4"
                />
                <text
                  x={containerWidth - padding.right + 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {currencySymbol}{priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume bars (subtle bottom overlay of price chart) */}
          {showIndicators.volume &&
            candles.map((c, i) => {
              const x = padding.left + i * candleSlotWidth + (candleSlotWidth - candleBodyWidth) / 2;
              const barHeight = (c.volume / maxVolume) * 45;
              const y = priceChartHeight - barHeight;
              const isBull = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x}
                  y={y}
                  width={candleBodyWidth}
                  height={barHeight}
                  fill={isBull ? '#10b981' : '#f43f5e'}
                  opacity={0.18}
                />
              );
            })}

          {/* Candlesticks */}
          {candles.map((c, i) => {
            const x = padding.left + i * candleSlotWidth;
            const centerX = x + candleSlotWidth / 2;
            const isBull = c.close >= c.open;
            const openY = getPriceY(c.open);
            const closeY = getPriceY(c.close);
            const highY = getPriceY(c.high);
            const lowY = getPriceY(c.low);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
            const color = isBull ? '#10b981' : '#f43f5e';

            return (
              <g
                key={`candle-${i}`}
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredCandle(c)}
              >
                {/* Wick */}
                <line
                  x1={centerX}
                  y1={highY}
                  x2={centerX}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Body */}
                <rect
                  x={centerX - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="0.5"
                />
              </g>
            );
          })}

          {/* EMA Overlay Lines */}
          {showIndicators.ema && (
            <>
              <path
                d={`M ${ema9Points}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                opacity={0.85}
              />
              <path
                d={`M ${ema21Points}`}
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.8"
                opacity={0.85}
              />
            </>
          )}

          {/* Active Trade Signal Horizontal Levels (Target 1, Target 2, Entry, Stop Loss) */}
          {showIndicators.signalLines && activeSignal && (
            <g>
              {/* Target 2 */}
              {activeSignal.target2 && (
                <>
                  <line
                    x1={padding.left}
                    y1={getPriceY(activeSignal.target2)}
                    x2={containerWidth - padding.right}
                    y2={getPriceY(activeSignal.target2)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={containerWidth - padding.right + 2}
                    y={getPriceY(activeSignal.target2) - 10}
                    width={70}
                    height={20}
                    rx="3"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text
                    x={containerWidth - padding.right + 6}
                    y={getPriceY(activeSignal.target2) + 4}
                    fill="#34d399"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    T2: {activeSignal.target2.toFixed(1)}
                  </text>
                </>
              )}

              {/* Target 1 */}
              <line
                x1={padding.left}
                y1={getPriceY(activeSignal.target1)}
                x2={containerWidth - padding.right}
                y2={getPriceY(activeSignal.target1)}
                stroke="#10b981"
                strokeWidth="2"
              />
              <rect
                x={containerWidth - padding.right + 2}
                y={getPriceY(activeSignal.target1) - 10}
                width={70}
                height={20}
                rx="3"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="1"
              />
              <text
                x={containerWidth - padding.right + 6}
                y={getPriceY(activeSignal.target1) + 4}
                fill="#10b981"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                T1: {activeSignal.target1.toFixed(1)}
              </text>

              {/* Entry */}
              <line
                x1={padding.left}
                y1={getPriceY(activeSignal.entryPrice)}
                x2={containerWidth - padding.right}
                y2={getPriceY(activeSignal.entryPrice)}
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <rect
                x={containerWidth - padding.right + 2}
                y={getPriceY(activeSignal.entryPrice) - 10}
                width={70}
                height={20}
                rx="3"
                fill="#083344"
                stroke="#06b6d4"
                strokeWidth="1"
              />
              <text
                x={containerWidth - padding.right + 6}
                y={getPriceY(activeSignal.entryPrice) + 4}
                fill="#22d3ee"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ENTRY: {activeSignal.entryPrice.toFixed(1)}
              </text>

              {/* Stop Loss */}
              <line
                x1={padding.left}
                y1={getPriceY(activeSignal.stopLoss)}
                x2={containerWidth - padding.right}
                y2={getPriceY(activeSignal.stopLoss)}
                stroke="#f43f5e"
                strokeWidth="2"
              />
              <rect
                x={containerWidth - padding.right + 2}
                y={getPriceY(activeSignal.stopLoss) - 10}
                width={70}
                height={20}
                rx="3"
                fill="#4c0519"
                stroke="#f43f5e"
                strokeWidth="1"
              />
              <text
                x={containerWidth - padding.right + 6}
                y={getPriceY(activeSignal.stopLoss) + 4}
                fill="#fb7185"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SL: {activeSignal.stopLoss.toFixed(1)}
              </text>
            </g>
          )}

          {/* Current Price Right Label Badge */}
          <line
            x1={padding.left}
            y1={getPriceY(latestCandle.close)}
            x2={containerWidth - padding.right}
            y2={getPriceY(latestCandle.close)}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <rect
            x={containerWidth - padding.right + 2}
            y={getPriceY(latestCandle.close) - 9}
            width={70}
            height={18}
            rx="2"
            fill="#334155"
          />
          <text
            x={containerWidth - padding.right + 6}
            y={getPriceY(latestCandle.close) + 4}
            fill="#ffffff"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {latestCandle.close.toFixed(2)}
          </text>

          {/* Separator Line for RSI Panel */}
          <line
            x1={0}
            y1={priceChartHeight}
            x2={containerWidth}
            y2={priceChartHeight}
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* RSI Panel */}
          {showIndicators.rsi && (
            <g>
              {/* RSI Background */}
              <rect
                x={0}
                y={priceChartHeight}
                width={containerWidth}
                height={rsiHeight + 20}
                fill="#080c14"
              />

              {/* 70 Level (Overbought) */}
              <line
                x1={padding.left}
                y1={getRsiY(70)}
                x2={containerWidth - padding.right}
                y2={getRsiY(70)}
                stroke="#f43f5e"
                strokeWidth="0.8"
                strokeDasharray="4 4"
                opacity={0.6}
              />
              <text
                x={containerWidth - padding.right + 8}
                y={getRsiY(70) + 3}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="monospace"
              >
                70 OB
              </text>

              {/* 50 Mid Level */}
              <line
                x1={padding.left}
                y1={getRsiY(50)}
                x2={containerWidth - padding.right}
                y2={getRsiY(50)}
                stroke="#334155"
                strokeWidth="0.6"
                strokeDasharray="2 2"
              />

              {/* 30 Level (Oversold) */}
              <line
                x1={padding.left}
                y1={getRsiY(30)}
                x2={containerWidth - padding.right}
                y2={getRsiY(30)}
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="4 4"
                opacity={0.6}
              />
              <text
                x={containerWidth - padding.right + 8}
                y={getRsiY(30) + 3}
                fill="#10b981"
                fontSize="9"
                fontFamily="monospace"
              >
                30 OS
              </text>

              {/* RSI Curve */}
              <path
                d={`M ${rsiPoints}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Current RSI Label */}
              <text
                x={padding.left + 8}
                y={priceChartHeight + 18}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
              >
                RSI (14): <tspan fill="#38bdf8" fontWeight="bold">{activeHover.rsi.toFixed(1)}</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
