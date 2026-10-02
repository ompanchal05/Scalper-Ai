import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string; // e.g. 'NIFTY', 'BANKNIFTY', 'SENSEX'
  timeframe?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, timeframe = '5' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map internal symbol name to TradingView ticker
  const tvSymbolMap: Record<string, string> = {
    'NIFTY': 'NSE:NIFTY',
    'NIFTY 50': 'NSE:NIFTY',
    'BANKNIFTY': 'NSE:BANKNIFTY',
    'BANK NIFTY': 'NSE:BANKNIFTY',
    'SENSEX': 'BSE:SENSEX',
    'BSE SENSEX': 'BSE:SENSEX',
  };

  const tvSymbol = tvSymbolMap[symbol.toUpperCase()] || 'NSE:NIFTY';

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    currentContainer.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    currentContainer.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: timeframe === '15m' ? '15' : timeframe === '1m' ? '1' : timeframe === '3m' ? '3' : '5',
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#050505',
      gridColor: 'rgba(255, 0, 50, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [tvSymbol, timeframe]);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-red-950/60 bg-black shadow-[0_0_30px_rgba(225,29,72,0.1)] group transition-all duration-300 hover:border-red-600/60 hover:shadow-[0_0_35px_rgba(225,29,72,0.25)]">
      {/* Black & Red Top Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-black/90 backdrop-blur border-b border-red-950/80 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold tracking-wider">TRADINGVIEW REALTIME FEED</span>
          <span className="text-zinc-500">|</span>
          <span className="text-white font-semibold">{tvSymbol}</span>
        </div>
        <span className="text-[10px] text-zinc-500">Official WebSocket Live Feed</span>
      </div>

      <div ref={containerRef} className="w-full h-full pt-7" />
    </div>
  );
};
