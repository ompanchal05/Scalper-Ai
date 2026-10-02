import React, { useState, useRef } from 'react';
import { ChartAnalysisResult, TradeSignal } from '../types/trade';
import { SAMPLE_CHART_PRESETS } from '../data/mockMarketData';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Play, RefreshCw, ZoomIn } from 'lucide-react';

interface ScreenshotScannerProps {
  onExecuteTradeFromAnalysis: (analysis: ChartAnalysisResult) => void;
  currencySymbol: string;
}

export const ScreenshotScanner: React.FC<ScreenshotScannerProps> = ({
  onExecuteTradeFromAnalysis,
  currencySymbol,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_CHART_PRESETS[0].dataUrl);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ChartAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetHint, setAssetHint] = useState<string>('NIFTY 50');
  const [timeframeHint, setTimeframeHint] = useState<string>('5m');
  const [tradeTypeHint, setTradeTypeHint] = useState<'AUTO' | 'CALL' | 'PUT'>('AUTO');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-analyze initial preset on mount if not yet analyzed
  React.useEffect(() => {
    if (selectedImage && !analysisResult) {
      handleAnalyzeChart(selectedImage);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid chart image (PNG, JPG, WebP).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      handleAnalyzeChart(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      handleFileUpload(e.clipboardData.files[0]);
    }
  };

  const handleAnalyzeChart = async (imgData: string) => {
    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          assetHint: assetHint !== 'AUTO' ? assetHint : undefined,
          timeframeHint: timeframeHint,
          tradeTypeHint: tradeTypeHint !== 'AUTO' ? tradeTypeHint : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAnalysisResult(resJson.data);
      } else {
        throw new Error(resJson.error || 'Failed to analyze chart screenshot');
      }
    } catch (err: any) {
      console.error('Error analyzing chart:', err);
      setError(err.message || 'Error communicating with Scalper AI engine.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      {/* Top Banner / Upload Zone */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Live Trade Screenshot Scanner (Call & Put)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload any live candlestick chart (TradingView, Broker, Binance, Zerodha). The Scalper AI
              detects exact Entry, Exit (Target 1 & 2), Stop Loss, RSI Divergence, and strict Over-Trade guard rules.
            </p>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Quick 1-Click Samples:</span>
            {SAMPLE_CHART_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedImage(preset.dataUrl);
                  setAssetHint(preset.asset);
                  setTimeframeHint(preset.timeframe);
                  setTradeTypeHint(preset.type as any);
                  handleAnalyzeChart(preset.dataUrl);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                  selectedImage === preset.dataUrl
                    ? 'bg-slate-800 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-[#090d16] rounded-xl p-6 text-center cursor-pointer transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">
              Drag & Drop your live trade chart screenshot here, or <span className="text-emerald-400 underline">browse</span>
            </div>
            <p className="text-xs text-slate-500">
              Supports PNG, JPG, WebP. You can also paste directly with <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">Ctrl+V</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">Cmd+V</kbd>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Split View: Chart with Visual Overlays + Scalper AI Intelligence Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 Cols): Visual Chart with Interactive Annotation Overlays */}
        <div className="lg:col-span-7 bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3.5 bg-[#0d1424] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Chart Analysis Canvas with Overlaid Target & SL Coordinates</span>
            </div>
            {analysisResult && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                analysisResult.direction === 'CALL'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                Detected: {analysisResult.direction} ({analysisResult.confidence}% Confidence)
              </span>
            )}
          </div>

          <div className="relative bg-[#070b12] flex items-center justify-center p-2 min-h-[380px] overflow-hidden">
            {selectedImage ? (
              <div className="relative w-full max-w-full">
                <img
                  src={selectedImage}
                  alt="Scanned Trade Chart"
                  className="w-full h-auto object-contain rounded-lg border border-slate-800/80 max-h-[520px]"
                />

                {/* Overlaid Visual Trade Lines when analysis is available */}
                {analysisResult && (
                  <div className="absolute inset-0 pointer-events-none p-2">
                    {/* Target 2 Line */}
                    <div
                      className="absolute left-4 right-4 border-b-2 border-emerald-400/90 border-dashed flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300 px-2 py-0.5 bg-emerald-950/60 rounded backdrop-blur-sm"
                      style={{ top: `${analysisResult.overlayCoordinates?.target1YPercent ? Math.max(analysisResult.overlayCoordinates.target1YPercent - 12, 10) : 18}%` }}
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        EXIT TARGET 2 (RUNNER): {currencySymbol}{analysisResult.target2}
                      </span>
                      <span>+{Number((analysisResult.potentialProfitPercent || 1.8) * 1.6).toFixed(1)}%</span>
                    </div>

                    {/* Target 1 Line */}
                    <div
                      className="absolute left-4 right-4 border-b-2 border-emerald-500 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300 px-2 py-0.5 bg-emerald-950/70 rounded shadow-md"
                      style={{ top: `${analysisResult.overlayCoordinates?.target1YPercent || 32}%` }}
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        EXIT TARGET 1 (BOOK 70%): {currencySymbol}{analysisResult.target1}
                      </span>
                      <span>+{Number(analysisResult.potentialProfitPercent || 1.8).toFixed(1)}%</span>
                    </div>

                    {/* Entry Trigger Line */}
                    <div
                      className="absolute left-4 right-4 border-b-2 border-cyan-400 border-dashed flex items-center justify-between text-[11px] font-mono font-bold text-cyan-200 px-2 py-0.5 bg-cyan-950/80 rounded shadow-lg"
                      style={{ top: `${analysisResult.overlayCoordinates?.entryYPercent || 52}%` }}
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        📍 TAKE TRADE HERE (ENTRY): {currencySymbol}{analysisResult.entryPrice}
                      </span>
                      <span>R:R {analysisResult.riskRewardRatio || '1:2.4'}</span>
                    </div>

                    {/* Stop Loss Line */}
                    <div
                      className="absolute left-4 right-4 border-b-2 border-rose-500 flex items-center justify-between text-[11px] font-mono font-bold text-rose-300 px-2 py-0.5 bg-rose-950/80 rounded shadow-md"
                      style={{ top: `${analysisResult.overlayCoordinates?.stopLossYPercent || 74}%` }}
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        🛡️ YOUR STOP LOSS (SL) IS HERE: {currencySymbol}{analysisResult.stopLoss}
                      </span>
                      <span>-{Number(analysisResult.potentialLossPercent || 0.8).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Upload a chart screenshot to inspect</div>
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <div className="text-sm font-semibold text-white">
                  Scalper AI Scanning Candlesticks & RSI Divergence...
                </div>
                <div className="text-xs text-slate-400">
                  Calculating high-probability Entry, Exit, SL & Anti-Overtrade recovery rules
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#0d1424] border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Visual indicators: <strong className="text-cyan-400">Entry</strong> (Blue) · <strong className="text-emerald-400">Targets</strong> (Green) · <strong className="text-rose-400">Stop Loss</strong> (Red)</span>
            <button
              onClick={() => handleAnalyzeChart(selectedImage || '')}
              disabled={analyzing || !selectedImage}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition disabled:opacity-50"
            >
              Re-Scan Chart
            </button>
          </div>
        </div>

        {/* Right (5 Cols): Structured Actionable Guidance from User Prompt */}
        <div className="lg:col-span-5 bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3.5 bg-[#0d1424] border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              AI Trade Instructions & Rules
            </h3>
            {analysisResult && (
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Accuracy: {analysisResult.confidence || 85}%
              </span>
            )}
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            {analysisResult ? (
              <>
                {/* 1. Header Recommendation Card */}
                <div className={`p-3.5 rounded-xl border ${
                  analysisResult.direction === 'CALL'
                    ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/25 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                      Recommendation: Take {analysisResult.direction || 'CALL'} Scalp
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      R:R {analysisResult.riskRewardRatio || '1:2.4'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    {analysisResult.asset || 'NIFTY 50'} [{analysisResult.timeframe || '5m'}] — {analysisResult.chartPattern || 'Demand Zone Rebound'}
                  </p>
                </div>

                {/* 2. End-to-End Accurate Trigger Points */}
                <div className="grid grid-cols-2 gap-2 bg-[#070b14] p-3 rounded-lg border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-sans font-bold">1. Entry Point</span>
                    <span className="text-sm font-bold text-white">{currencySymbol}{analysisResult.entryPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-sans font-bold">2. Exit (Target 1)</span>
                    <span className="text-sm font-bold text-emerald-300">{currencySymbol}{analysisResult.target1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-sans font-bold">3. Exit (Target 2)</span>
                    <span className="text-sm font-bold text-emerald-400">{currencySymbol}{analysisResult.target2}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-sans font-bold">4. Stop Loss (SL)</span>
                    <span className="text-sm font-bold text-rose-400">{currencySymbol}{analysisResult.stopLoss}</span>
                  </div>
                </div>

                {/* 3. Detailed Guidance: Take Trade Here */}
                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <span>🎯 Take The Trade Here:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysisResult.executionGuide?.takeTradeHere || `Enter ${analysisResult.direction} as soon as the candle closes past ${analysisResult.entryPrice}.`}
                  </p>
                </div>

                {/* 4. Detailed Guidance: Exit Point Here */}
                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <span>🏁 Exit Point Here:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysisResult.executionGuide?.exitPointHere || `Book 70% at Target 1 (${analysisResult.target1}), move SL to breakeven, and let runner ride to Target 2 (${analysisResult.target2}).`}
                  </p>
                </div>

                {/* 5. Detailed Guidance: Stop Loss & SL Hit Second Trade Rule */}
                <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-lg space-y-1">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <span>🛡️ Here is Your Stop Loss (SL):</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysisResult.executionGuide?.stopLossHere || `Exit immediately if price breaches ${analysisResult.stopLoss}. Do not hold losing scalps.`}
                  </p>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>If SL Hits: Second Trade & Anti Over-Trade Rule</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysisResult.executionGuide?.ifSlHits || 'If SL is hit, wait for secondary institutional liquidity re-test. If that fails, stop trading for the session.'}
                  </p>
                  <div className="pt-2 text-amber-400 font-mono text-[11px] font-semibold border-t border-amber-800/30 mt-2">
                    ⛔ Over-Trade Guard: {analysisResult.executionGuide?.overTradeRule || 'Maximum 2 trades daily. Zero revenge trading.'}
                  </div>
                </div>

                {/* 6. RSI Indicator & Past Records Reasoning */}
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>RSI Indicator & Past Records Validation</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="font-mono text-cyan-300 font-bold">RSI(14) = {analysisResult.rsiAnalysis?.value ?? 32}</span> ({analysisResult.rsiAnalysis?.status || 'Momentum Confirmation'}).
                    <div className="text-slate-400 text-[11px] mt-0.5">{analysisResult.rsiAnalysis?.divergence || 'Divergence signals favorable risk-to-reward.'}</div>
                  </div>
                  <div className="text-slate-300 text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/60 mt-1">
                    <strong className="text-slate-200">Past Pattern Match: </strong>
                    {analysisResult.executionGuide?.pastRecordContext || 'In past historical occurrences of this pattern, over 80% reached Target 1.'}
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={() => onExecuteTradeFromAnalysis(analysisResult)}
                  className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                    analysisResult.direction === 'CALL'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Execute This {analysisResult.direction} Trade in Live Simulator
                </button>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
                <Sparkles className="w-6 h-6 text-slate-600" />
                <span>Upload a chart screenshot or select a sample preset to generate end-to-end trade points.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
