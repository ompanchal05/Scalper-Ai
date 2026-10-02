import React, { useState, useRef, useEffect } from 'react';
import { AIPredictionResult, IndexType } from '../types/trade';
import { Upload, Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Play, RefreshCw, BarChart2, TrendingUp, TrendingDown, Target, Shield, HelpCircle } from 'lucide-react';
import { SAMPLE_CHART_PRESETS } from '../data/mockMarketData';

interface AIScreenshotPredictorProps {
  selectedIndex: IndexType;
  userCapital: number;
  currency: 'INR' | 'USD';
  onExecuteTrade: (pred: AIPredictionResult) => void;
}

export const AIScreenshotPredictor: React.FC<AIScreenshotPredictorProps> = ({
  selectedIndex,
  userCapital,
  currency,
  onExecuteTrade,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_CHART_PRESETS[0].dataUrl);
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<AIPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sym = currency === 'INR' ? '₹' : '$';

  // Sample chart matching the selected index
  const getPresetForIndex = (idx: IndexType) => {
    if (idx === 'BANKNIFTY') return SAMPLE_CHART_PRESETS[1];
    if (idx === 'SENSEX') return SAMPLE_CHART_PRESETS[2];
    return SAMPLE_CHART_PRESETS[0];
  };

  useEffect(() => {
    const preset = getPresetForIndex(selectedIndex);
    setSelectedImage(preset.dataUrl);
    handleAnalyze(preset.dataUrl, selectedIndex);
  }, [selectedIndex, userCapital]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      handleAnalyze(result, selectedIndex);
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

  const handleAnalyze = async (imgData: string, idx: IndexType) => {
    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          assetHint: idx,
          userCapital: userCapital,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setPrediction(resJson.data);
      } else {
        throw new Error(resJson.error || 'Failed to analyze chart screenshot');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Error communicating with Scalper AI engine.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      {/* Upload & Sample Bar (Black & Red aesthetic with mouse hover glow) */}
      <div className="bg-[#080808] border border-red-950/80 rounded-xl p-5 shadow-[0_0_20px_rgba(225,29,72,0.08)] transition-all duration-300 hover:border-red-600/50 hover:shadow-[0_0_25px_rgba(225,29,72,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
              Upload Live Trade Screenshot
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Drop any candlestick chart screenshot. The AI classifies direction (Call / Put) & uses regression to output exact Entry, SL, Target & Capital sizing.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">1-Click Test:</span>
            {[
              { id: 'NIFTY', name: 'NIFTY Call Setup', preset: SAMPLE_CHART_PRESETS[0] },
              { id: 'BANKNIFTY', name: 'BANKNIFTY Put Setup', preset: SAMPLE_CHART_PRESETS[1] },
              { id: 'SENSEX', name: 'SENSEX Call Setup', preset: SAMPLE_CHART_PRESETS[2] },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setSelectedImage(btn.preset.dataUrl);
                  handleAnalyze(btn.preset.dataUrl, btn.id as IndexType);
                }}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-red-950 bg-zinc-950 text-zinc-300 hover:text-white hover:border-red-500 hover:bg-red-950/30 transition-all duration-200"
              >
                {btn.id}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Input Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-red-950/90 hover:border-red-500/80 bg-black/60 rounded-xl p-5 text-center cursor-pointer transition-all duration-300 group hover:shadow-[0_0_30px_rgba(225,29,72,0.2)]"
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
            <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-900/50 group-hover:border-red-500 flex items-center justify-center text-red-400 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-zinc-200">
              Drag & Drop your chart screenshot here, or <span className="text-red-400 underline">browse</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">
              Paste from clipboard with <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 text-[10px]">Ctrl+V</kbd>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Analysis Results & The 5 Core Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (5 Cols): Uploaded Screenshot Preview with visual overlays */}
        <div className="lg:col-span-5 bg-[#080808] border border-red-950/80 rounded-xl overflow-hidden flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-red-600/50">
          <div className="p-3 bg-zinc-950 border-b border-red-950/70 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Scanned Chart View</span>
            {analyzing && <span className="text-red-400 animate-pulse font-bold">Scanning with Gemini Vision...</span>}
          </div>

          <div className="relative p-3 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
            {selectedImage && (
              <div className="relative w-full">
                <img
                  src={selectedImage}
                  alt="Target Candlestick Chart"
                  className="w-full h-auto object-contain rounded-lg border border-red-950/60 max-h-[440px]"
                />

                {/* Overlay Price Markers */}
                {prediction && (
                  <div className="absolute inset-0 pointer-events-none p-2 flex flex-col justify-around">
                    <div className="w-fit px-2 py-0.5 bg-emerald-950/90 border border-emerald-500 rounded text-[10px] font-mono font-bold text-emerald-300 shadow">
                      TARGET 1: {sym}{prediction.target} (+{prediction.targetPoints} pts)
                    </div>
                    <div className="w-fit px-2 py-0.5 bg-cyan-950/90 border border-cyan-400 rounded text-[10px] font-mono font-bold text-cyan-200 shadow">
                      ENTRY POINT: {sym}{prediction.entryPrice}
                    </div>
                    <div className="w-fit px-2 py-0.5 bg-red-950/90 border border-red-500 rounded text-[10px] font-mono font-bold text-red-300 shadow">
                      STOP LOSS: {sym}{prediction.stopLoss} (-{prediction.slPoints} pts)
                    </div>
                  </div>
                )}
              </div>
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-center p-4">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                <span className="text-sm font-bold text-white">Running Classification & Regression Models...</span>
                <span className="text-xs text-zinc-400">Computing exact Entry, Target, SL, and Risk Sizing</span>
              </div>
            )}
          </div>
        </div>

        {/* Right (7 Cols): The 5 Core Question Answers Requested by User */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            <>
              {/* Question 1 & 2: Take Trade or Not & Call or Put */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Take Trade Or Not */}
                <div className="p-4 bg-[#080808] border border-red-950/80 rounded-xl transition-all duration-300 hover:border-red-600/70 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                  <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold mb-1 flex items-center justify-between">
                    <span>1. Take Trade Or Not?</span>
                    <span className="text-red-400 font-semibold">Q1</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {prediction.takeTrade ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-extrabold text-sm tracking-wider shadow">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        YES — TAKE TRADE NOW
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/80 text-red-300 font-extrabold text-sm tracking-wider shadow">
                        <XCircle className="w-4 h-4 text-red-400" />
                        NO — DO NOT TRADE / WAIT
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-sans">
                    {prediction.tradeDecisionReason}
                  </p>
                </div>

                {/* 2. Call or Put */}
                <div className="p-4 bg-[#080808] border border-red-950/80 rounded-xl transition-all duration-300 hover:border-red-600/70 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                  <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold mb-1 flex items-center justify-between">
                    <span>2. Call or Put for {prediction.index}?</span>
                    <span className="text-red-400 font-semibold">Q2</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1.5 rounded-lg font-extrabold text-sm tracking-wider shadow flex items-center gap-1.5 ${
                      prediction.callOrPut === 'CALL'
                        ? 'bg-emerald-950/90 border border-emerald-400 text-emerald-300'
                        : 'bg-red-950/90 border border-red-500 text-red-300'
                    }`}>
                      {prediction.callOrPut === 'CALL' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      BUY {prediction.callOrPut} ({prediction.callOrPut === 'CALL' ? 'CE' : 'PE'})
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      @ {sym}{prediction.entryPrice}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-2 font-mono flex items-center gap-2">
                    <span>Confidence: <strong className="text-emerald-400">{prediction.classification.probability}%</strong></span>
                    <span>·</span>
                    <span>RSI: <strong className="text-red-400">{prediction.rsiValue}</strong></span>
                  </div>
                </div>
              </div>

              {/* Question 3 & 4: Stop Loss & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 3. Stop Loss */}
                <div className="p-4 bg-[#080808] border border-red-950/80 rounded-xl transition-all duration-300 hover:border-red-600/70 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                  <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold mb-1 flex items-center justify-between">
                    <span>3. What is Your Stop Loss?</span>
                    <span className="text-red-400 font-semibold">Q3</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-red-500">
                      {sym}{prediction.stopLoss}
                    </span>
                    <span className="text-xs font-mono font-semibold text-red-400">
                      (-{prediction.slPoints} pts)
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-2">
                    {prediction.rules.ifSlHits}
                  </div>
                </div>

                {/* 4. Target */}
                <div className="p-4 bg-[#080808] border border-red-950/80 rounded-xl transition-all duration-300 hover:border-red-600/70 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                  <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold mb-1 flex items-center justify-between">
                    <span>4. What is Your Target?</span>
                    <span className="text-red-400 font-semibold">Q4</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                      {sym}{prediction.target}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-300">
                      (+{prediction.targetPoints} pts)
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-2 flex items-center justify-between">
                    <span>Runner Target 2: <strong className="text-emerald-400 font-mono">{sym}{prediction.target2}</strong></span>
                    <span className="text-zinc-500 font-mono">R:R {prediction.riskRewardRatio}</span>
                  </div>
                </div>
              </div>

              {/* Question 5: Capital Sizing & Position Allocation */}
              <div className="p-4 bg-[#080808] border border-red-950/80 rounded-xl transition-all duration-300 hover:border-red-600/70 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold mb-2 flex items-center justify-between">
                  <span>5. What is Your Capital & Position Sizing?</span>
                  <span className="text-red-400 font-semibold">Q5</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black p-3 rounded-lg border border-red-950/60 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Account Capital</span>
                    <span className="font-bold text-white text-sm">{sym}{prediction.capitalSizing.userCapital.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 uppercase block">Recommended Lots</span>
                    <span className="font-bold text-red-300 text-sm">{prediction.capitalSizing.recommendedLots} Lots ({prediction.capitalSizing.recommendedQuantity} Qty)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-500 uppercase block">Max Risk / SL Loss</span>
                    <span className="font-bold text-red-400 text-sm">-{sym}{prediction.capitalSizing.maxPotentialLoss.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase block">Expected Profit</span>
                    <span className="font-bold text-emerald-400 text-sm">+{sym}{prediction.capitalSizing.expectedProfit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Over-trade rule warning */}
                <div className="mt-3 text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{prediction.rules.overTradeWarning}</span>
                </div>
              </div>

              {/* Classification & Regression Machine Learning Insights */}
              <div className="p-3 bg-zinc-950 border border-red-950/60 rounded-xl text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-zinc-400">
                <div>
                  <span className="text-red-400 font-bold">Classification: </span>
                  <span>{prediction.classification.predictedClass} ({prediction.classification.probability}% probability)</span>
                </div>
                <div>
                  <span className="text-red-400 font-bold">Regression: </span>
                  <span>Target Return +{prediction.regression.expectedReturnPct}% (95% CI)</span>
                </div>
                <div>
                  <span className="text-zinc-500">Pattern: </span>
                  <span className="text-zinc-200">{prediction.patternDetected}</span>
                </div>
              </div>

              {/* Action Button: Execute & Test in Simulator */}
              <button
                onClick={() => onExecuteTrade(prediction)}
                className={`w-full py-3.5 px-4 font-black text-sm uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                  prediction.callOrPut === 'CALL'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Execute This {prediction.callOrPut} Trade (Simulate Live Profit)
              </button>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 bg-[#080808] border border-red-950/80 rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
              <span>Analyzing live chart screenshot...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
