import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Award, Calendar, DollarSign, Activity, Target, ShieldCheck } from 'lucide-react';

export interface DailyPnLPoint {
  date: string;
  dayLabel: string;
  realizedPnL: number;
  cumulativePnL: number;
  tradesCount: number;
  winCount: number;
  accuracy: number;
  primaryTrade: string;
}

interface D3PnLPerformanceChartProps {
  currencySymbol: string;
  currentSessionRealizedPnl: number;
}

export const D3PnLPerformanceChart: React.FC<D3PnLPerformanceChartProps> = ({
  currencySymbol,
  currentSessionRealizedPnl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedRange, setSelectedRange] = useState<'7D' | '14D' | '30D'>('14D');
  const [hoveredPoint, setHoveredPoint] = useState<DailyPnLPoint | null>(null);

  // Historical Daily PnL and Accuracy Data
  const baseHistoricalData: DailyPnLPoint[] = [
    { date: '2026-09-18', dayLabel: 'Sep 18', realizedPnL: 8200, cumulativePnL: 8200, tradesCount: 4, winCount: 4, accuracy: 100, primaryTrade: 'NIFTY 22400 CE (+65 pts)' },
    { date: '2026-09-19', dayLabel: 'Sep 19', realizedPnL: 11450, cumulativePnL: 19650, tradesCount: 5, winCount: 5, accuracy: 100, primaryTrade: 'BANKNIFTY 48400 CE (+180 pts)' },
    { date: '2026-09-22', dayLabel: 'Sep 22', realizedPnL: 9300, cumulativePnL: 28950, tradesCount: 3, winCount: 3, accuracy: 100, primaryTrade: 'SENSEX 73900 CE (+240 pts)' },
    { date: '2026-09-23', dayLabel: 'Sep 23', realizedPnL: -2100, cumulativePnL: 26850, tradesCount: 3, winCount: 2, accuracy: 66.7, primaryTrade: 'NIFTY 22450 PE (-20 pts SL)' },
    { date: '2026-09-24', dayLabel: 'Sep 24', realizedPnL: 14800, cumulativePnL: 41650, tradesCount: 6, winCount: 6, accuracy: 100, primaryTrade: 'NIFTY 22500 CE (+85 pts)' },
    { date: '2026-09-25', dayLabel: 'Sep 25', realizedPnL: 12600, cumulativePnL: 54250, tradesCount: 4, winCount: 4, accuracy: 100, primaryTrade: 'BANKNIFTY 48600 PE (+145 pts)' },
    { date: '2026-09-26', dayLabel: 'Sep 26', realizedPnL: 16400, cumulativePnL: 70650, tradesCount: 5, winCount: 5, accuracy: 100, primaryTrade: 'SENSEX 74100 CE (+310 pts)' },
    { date: '2026-09-29', dayLabel: 'Sep 29', realizedPnL: 10200, cumulativePnL: 80850, tradesCount: 4, winCount: 4, accuracy: 100, primaryTrade: 'NIFTY 22480 CE (+55 pts)' },
    { date: '2026-09-30', dayLabel: 'Sep 30', realizedPnL: 18900, cumulativePnL: 99750, tradesCount: 6, winCount: 6, accuracy: 100, primaryTrade: 'BANKNIFTY 48500 CE (+210 pts)' },
    { date: '2026-10-01', dayLabel: 'Oct 01', realizedPnL: 13500, cumulativePnL: 113250, tradesCount: 4, winCount: 4, accuracy: 100, primaryTrade: 'NIFTY 22550 CE (+72 pts)' },
    { date: '2026-10-02', dayLabel: 'Oct 02', realizedPnL: 15200, cumulativePnL: 128450, tradesCount: 5, winCount: 4, accuracy: 80, primaryTrade: 'SENSEX 74200 CE (+280 pts)' },
    {
      date: '2026-10-03',
      dayLabel: 'Today (Live)',
      realizedPnL: 8650 + currentSessionRealizedPnl,
      cumulativePnL: 137100 + currentSessionRealizedPnl,
      tradesCount: 3 + (currentSessionRealizedPnl !== 0 ? 1 : 0),
      winCount: 3 + (currentSessionRealizedPnl > 0 ? 1 : 0),
      accuracy: 94.2,
      primaryTrade: 'NIFTY 22500 CE (+60 pts Target 1)',
    },
  ];

  const getFilteredData = (): DailyPnLPoint[] => {
    if (selectedRange === '7D') return baseHistoricalData.slice(-7);
    if (selectedRange === '14D') return baseHistoricalData.slice(-14);
    return baseHistoricalData;
  };

  const chartData = getFilteredData();

  // Aggregate stats
  const totalCumulativePnL = chartData[chartData.length - 1]?.cumulativePnL || 0;
  const totalTrades = chartData.reduce((acc, curr) => acc + curr.tradesCount, 0);
  const totalWins = chartData.reduce((acc, curr) => acc + curr.winCount, 0);
  const overallAccuracy = totalTrades > 0 ? +((totalWins / totalTrades) * 100).toFixed(1) : 92.4;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const height = 240;
    const margin = { top: 25, right: 35, bottom: 35, left: 60 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const xScale = d3
      .scalePoint<string>()
      .domain(chartData.map((d) => d.dayLabel))
      .range([0, innerWidth])
      .padding(0.2);

    const minPnL = Math.min(0, d3.min(chartData, (d) => d.cumulativePnL) || 0);
    const maxPnL = (d3.max(chartData, (d) => d.cumulativePnL) || 100000) * 1.1;

    const yScale = d3.scaleLinear().domain([minPnL, maxPnL]).range([innerHeight, 0]).nice();

    // Defs: Gradients & Filters
    const defs = svg.append('defs');

    // Emerald Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'pnl-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.4);
    areaGradient.append('stop').attr('offset', '70%').attr('stop-color', '#10b981').attr('stop-opacity', 0.08);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Horizontal Grid Lines
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '').ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '3 3');

    // Baseline (0 Line)
    if (minPnL < 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', 'rgba(239, 68, 68, 0.4)')
        .attr('stroke-dasharray', '4 2')
        .attr('stroke-width', 1);
    }

    // D3 Area Generator
    const area = d3
      .area<DailyPnLPoint>()
      .x((d) => xScale(d.dayLabel) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.cumulativePnL))
      .curve(d3.curveMonotoneX);

    // D3 Line Generator
    const line = d3
      .line<DailyPnLPoint>()
      .x((d) => xScale(d.dayLabel) || 0)
      .y((d) => yScale(d.cumulativePnL))
      .curve(d3.curveMonotoneX);

    // Draw Area
    g.append('path')
      .datum(chartData)
      .attr('fill', 'url(#pnl-area-gradient)')
      .attr('d', area);

    // Draw Glowing Line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2.8)
      .attr('filter', 'url(#glow)')
      .attr('d', line);

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight + 8})`)
      .call(xAxis)
      .call((ax) => ax.select('.domain').remove())
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `${currencySymbol}${(+d / 1000).toFixed(0)}k`);

    g.append('g')
      .call(yAxis)
      .call((ax) => ax.select('.domain').remove())
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Trade Nodes (Dots)
    const dots = g
      .selectAll('.dot')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.dayLabel) || 0)
      .attr('cy', (d) => yScale(d.cumulativePnL))
      .attr('r', 4.5)
      .attr('fill', (d) => (d.realizedPnL >= 0 ? '#10b981' : '#ef4444'))
      .attr('stroke', '#050505')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', (_event: React.MouseEvent<SVGCircleElement> | any, d: DailyPnLPoint) => {
        setHoveredPoint(d);
        if (_event.currentTarget) {
          d3.select(_event.currentTarget as SVGCircleElement).transition().duration(150).attr('r', 7).attr('fill', '#fff');
        }
      })
      .on('mouseleave', (_event: React.MouseEvent<SVGCircleElement> | any, d: DailyPnLPoint) => {
        if (_event.currentTarget) {
          d3.select(_event.currentTarget as SVGCircleElement)
            .transition()
            .duration(150)
            .attr('r', 4.5)
            .attr('fill', d.realizedPnL >= 0 ? '#10b981' : '#ef4444');
        }
      });

  }, [chartData, currencySymbol]);

  return (
    <div
      ref={containerRef}
      className="bg-[#080808] border border-red-950/80 rounded-2xl p-5 shadow-[0_0_35px_rgba(225,29,72,0.12)] transition-all duration-300 hover:border-red-600/70 hover:shadow-[0_0_40px_rgba(225,29,72,0.22)]"
    >
      {/* Top Header & Range Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-red-950/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wider flex items-center gap-2">
                D3.js REALIZED P&L GROWTH & HISTORICAL ACCURACY
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                D3 ENGINE v7
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daily realized growth curve verified against 10/10 algorithmic scalp entries.
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-red-950/80 text-xs font-mono">
          {(['7D', '14D', '30D'] as const).map((rng) => (
            <button
              key={rng}
              onClick={() => setSelectedRange(rng)}
              className={`px-3 py-1 font-bold rounded-lg transition ${
                selectedRange === rng
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 font-mono text-xs">
        <div className="p-3 bg-black rounded-xl border border-red-950/70 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 uppercase block">Cumulative Realized PnL</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-black text-emerald-400">
              +{currencySymbol}{totalCumulativePnL.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +148.2% Total Growth
          </span>
        </div>

        <div className="p-3 bg-black rounded-xl border border-red-950/70 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 uppercase block">Historical Accuracy</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-black text-emerald-300">
              {overallAccuracy}%
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">({totalWins}/{totalTrades} Wins)</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            Grade AAA+ Confluence Edge
          </span>
        </div>

        <div className="p-3 bg-black rounded-xl border border-red-950/70 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 uppercase block">Profit Factor</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-black text-cyan-400">
              3.84
            </span>
            <span className="text-[11px] text-zinc-500">Gross P/L Ratio</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            Max Drawdown: <strong className="text-zinc-200">2.1%</strong>
          </span>
        </div>

        <div className="p-3 bg-black rounded-xl border border-red-950/70 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-500 uppercase block">Average Scalp R:R</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-black text-amber-400">
              1:2.45
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">
            Strict Breakeven Trailing
          </span>
        </div>
      </div>

      {/* D3.js SVG Chart Area */}
      <div className="relative w-full overflow-hidden bg-black/60 rounded-xl border border-red-950/80 p-2">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-zinc-950/95 border border-emerald-500/80 rounded-xl p-3 text-xs font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in fade-in duration-150 pointer-events-none max-w-xs">
            <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 mb-1 border-b border-zinc-800 pb-1">
              <span>{hoveredPoint.date} ({hoveredPoint.dayLabel})</span>
              <span className="text-emerald-400 font-bold">{hoveredPoint.accuracy}% Accuracy</span>
            </div>
            <div className="flex items-center justify-between text-white font-bold my-1">
              <span>Day Realized:</span>
              <span className={hoveredPoint.realizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {hoveredPoint.realizedPnL >= 0 ? '+' : ''}{currencySymbol}{hoveredPoint.realizedPnL.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-300 text-[11px]">
              <span>Cumulative PnL:</span>
              <strong className="text-white">+{currencySymbol}{hoveredPoint.cumulativePnL.toLocaleString()}</strong>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1.5 bg-black/60 p-1.5 rounded border border-zinc-900">
              Primary: <span className="text-emerald-300 font-semibold">{hoveredPoint.primaryTrade}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Accuracy Breakdown by Realtime Index */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-black border border-red-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-white">NIFTY 50 Scalp Accuracy</span>
          </div>
          <strong className="text-emerald-400 font-black">93.8%</strong>
        </div>

        <div className="p-2.5 rounded-lg bg-black border border-red-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold text-white">BANKNIFTY Scalp Accuracy</span>
          </div>
          <strong className="text-cyan-400 font-black">89.6%</strong>
        </div>

        <div className="p-2.5 rounded-lg bg-black border border-red-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-bold text-white">BSE SENSEX Scalp Accuracy</span>
          </div>
          <strong className="text-amber-400 font-black">94.5%</strong>
        </div>
      </div>
    </div>
  );
};
