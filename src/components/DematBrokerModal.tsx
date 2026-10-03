import React, { useState, useEffect } from 'react';
import { AIPredictionResult } from '../types/trade';
import { X, CheckCircle2, Copy, Play, Terminal, ShieldCheck, DollarSign, Layers, ArrowRight, RefreshCw, Code2, Globe } from 'lucide-react';

interface DematBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: AIPredictionResult | null;
  userCapital: number;
  currencySymbol: string;
  onOrderSuccess: (orderData: any) => void;
}

export const DematBrokerModal: React.FC<DematBrokerModalProps> = ({
  isOpen,
  onClose,
  prediction,
  userCapital,
  currencySymbol,
  onOrderSuccess,
}) => {
  const [selectedBroker, setSelectedBroker] = useState<'GROWW' | 'ZERODHA' | 'ANGEL_ONE' | 'DHAN' | 'UPSTOX' | 'PAPER'>('GROWW');
  const [lots, setLots] = useState<number>(2);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [strikeOffset, setStrikeOffset] = useState<'ATM' | 'ITM' | 'OTM'>('ATM');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);

  // Code Tab state: Ticket vs Groww API vs Zerodha vs Node
  const [activeTab, setActiveTab] = useState<'TICKET' | 'GROWW_CODE' | 'PYTHON_CODE' | 'NODE_CODE'>('TICKET');
  const [generatedCode, setGeneratedCode] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !prediction) return null;

  const lotSize = prediction.index === 'SENSEX' ? 10 : prediction.index === 'BANKNIFTY' ? 15 : 25;
  const baseStrike = Math.round(prediction.entryPrice / (prediction.index === 'SENSEX' ? 100 : 50)) * (prediction.index === 'SENSEX' ? 100 : 50);

  const selectedStrike =
    strikeOffset === 'ATM'
      ? baseStrike
      : strikeOffset === 'ITM'
      ? (prediction.callOrPut === 'CALL' ? baseStrike - 100 : baseStrike + 100)
      : (prediction.callOrPut === 'CALL' ? baseStrike + 100 : baseStrike - 100);

  const estimatedOptionPremium =
    strikeOffset === 'ITM' ? 135.0 : strikeOffset === 'ATM' ? 84.5 : 42.0;

  const totalQuantity = lots * lotSize;
  const marginRequired = totalQuantity * estimatedOptionPremium;
  const maxRisk = prediction.slPoints * totalQuantity;
  const expectedProfit = prediction.targetPoints * totalQuantity;

  // Fetch Groww & other Python / Node.js Broker Code on mount or parameter changes
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch('/api/broker/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            broker: selectedBroker,
            symbol: prediction.index,
            direction: prediction.callOrPut,
            strike: selectedStrike,
            price: estimatedOptionPremium,
            lots,
            lotSize,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setGeneratedCode(data);
        }
      } catch (e) {
        console.error('Failed to generate broker code:', e);
      }
    };
    fetchCode();
  }, [prediction, selectedStrike, lots, estimatedOptionPremium, selectedBroker]);

  const handlePunchOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/broker/execute-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: selectedBroker,
          symbol: prediction.index,
          direction: prediction.callOrPut,
          strike: selectedStrike,
          lots,
          lotSize,
          price: estimatedOptionPremium,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderReceipt(data);
        onOrderSuccess(data);
      }
    } catch (e) {
      console.error('Order execution failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090909] border border-red-600/80 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.35)] overflow-hidden font-mono text-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 bg-black border-b border-red-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h3 className="font-extrabold text-white text-base tracking-wider">
              DEMAT TRADING TERMINAL & BROKER API RUNNER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers: Order Ticket vs Groww API vs Python Code vs Node Code */}
        <div className="flex items-center border-b border-red-950/80 bg-zinc-950 px-4 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('TICKET')}
            className={`py-2.5 px-3.5 font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'TICKET'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ⚡ 1-Click Order Ticket
          </button>
          <button
            onClick={() => setActiveTab('GROWW_CODE')}
            className={`py-2.5 px-3.5 font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'GROWW_CODE'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Groww API (Python)</span>
            <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">NEW</span>
          </button>
          <button
            onClick={() => setActiveTab('PYTHON_CODE')}
            className={`py-2.5 px-3.5 font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'PYTHON_CODE'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Zerodha Kite Code
          </button>
          <button
            onClick={() => setActiveTab('NODE_CODE')}
            className={`py-2.5 px-3.5 font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'NODE_CODE'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Node.js Client Code
          </button>
        </div>

        {/* CONTENT TAB 1: ORDER TICKET */}
        {activeTab === 'TICKET' && (
          <div className="p-5 space-y-4">
            {orderReceipt ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Trade Punched Successfully to {orderReceipt.broker} Demat Account!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-black/60 p-3 rounded-lg border border-emerald-800/60 font-mono">
                  <div>Order ID: <strong className="text-white">#{orderReceipt.orderId}</strong></div>
                  <div>Broker: <strong className="text-emerald-400">{orderReceipt.broker} API</strong></div>
                  <div>Contract: <strong className="text-white">{orderReceipt.tradingsymbol}</strong></div>
                  <div>Executed Qty: <strong className="text-white">{orderReceipt.quantity} ({orderReceipt.lots} Lots)</strong></div>
                  <div>Avg Price: <strong className="text-white">{currencySymbol}{orderReceipt.averagePrice}</strong></div>
                  <div>Margin Blocked: <strong className="text-white">{currencySymbol}{orderReceipt.marginBlocked}</strong></div>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Order status: <strong className="text-emerald-400">FILLED / COMPLETE</strong>. Live P&L tracking enabled.
                </div>
                <button
                  onClick={() => {
                    setOrderReceipt(null);
                    onClose();
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                >
                  Return to Live Terminal
                </button>
              </div>
            ) : (
              <>
                {/* Broker Selector (Groww API highlighted) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase">
                      Select Your Demat Broker
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold">Groww Trade API Integrated</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {[
                      { id: 'GROWW', label: 'Groww API', highlight: true },
                      { id: 'ZERODHA', label: 'Zerodha' },
                      { id: 'ANGEL_ONE', label: 'Angel One' },
                      { id: 'DHAN', label: 'DhanHQ' },
                      { id: 'UPSTOX', label: 'Upstox' },
                      { id: 'PAPER', label: 'Sandbox' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBroker(b.id as any)}
                        className={`p-2 rounded-lg border text-center transition font-bold ${
                          selectedBroker === b.id
                            ? b.id === 'GROWW'
                              ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500'
                              : 'bg-red-950/70 border-red-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strike & Strike Offset (ITM, ATM, OTM) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black p-3.5 rounded-xl border border-red-950">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                      Option Contract Strike
                    </label>
                    <div className="text-sm font-bold text-white">
                      {prediction.index} {selectedStrike} {prediction.callOrPut === 'CALL' ? 'CE' : 'PE'}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Est. Premium: <strong className="text-red-400">{currencySymbol}{estimatedOptionPremium.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">
                      Moneyness Filter
                    </label>
                    <div className="flex items-center gap-1.5 text-xs">
                      {(['ITM', 'ATM', 'OTM'] as const).map((moneyness) => (
                        <button
                          key={moneyness}
                          onClick={() => setStrikeOffset(moneyness)}
                          className={`flex-1 py-1 rounded text-center font-bold border transition ${
                            strikeOffset === moneyness
                              ? 'bg-red-600 border-red-400 text-white shadow'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {moneyness}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lots & Quantity Slider */}
                <div className="space-y-1.5 bg-black p-3.5 rounded-xl border border-red-950">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Position Quantity:</span>
                    <strong className="text-white">{lots} Lots = {totalQuantity} Qty (Lot Size: {lotSize})</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 4, 8, 12].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLots(l)}
                        className={`flex-1 py-1 rounded text-xs font-bold border transition ${
                          lots === l
                            ? 'bg-red-600 border-red-400 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {l}L ({l * lotSize})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capital, Margin & Expected P&L Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/60 p-3 rounded-lg border border-red-950/70 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Account Capital</span>
                    <span className="font-bold text-white">{currencySymbol}{userCapital.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 uppercase block">Margin Blocked</span>
                    <span className="font-bold text-amber-400">{currencySymbol}{marginRequired.toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-500 uppercase block">SL Risk Amount</span>
                    <span className="font-bold text-red-400">-{currencySymbol}{maxRisk.toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-500 uppercase block">Target Profit</span>
                    <span className="font-bold text-emerald-400">+{currencySymbol}{expectedProfit.toFixed(0)}</span>
                  </div>
                </div>

                {/* Punch Order Button */}
                <button
                  onClick={handlePunchOrder}
                  disabled={submitting}
                  className={`w-full py-3.5 px-4 font-black text-sm uppercase tracking-wider rounded-xl transition shadow-xl flex items-center justify-center gap-2 ${
                    selectedBroker === 'GROWW'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/80 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                      : prediction.callOrPut === 'CALL'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Punching order to {selectedBroker} Demat...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Punch {prediction.callOrPut} Order to {selectedBroker} Demat ({totalQuantity} Qty)</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* CONTENT TAB 2: GROWW API CODE (NEW) */}
        {activeTab === 'GROWW_CODE' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-400">Groww Trade API Python Client:</span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Endpoint: <code className="text-zinc-300">POST https://api.groww.in/v1/order/create</code>
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(generatedCode?.growwPythonCode || generatedCode?.pythonCode || '')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Groww Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-black rounded-xl border border-emerald-950/80 text-[11px] leading-relaxed text-emerald-300 overflow-x-auto max-h-[360px]">
              {generatedCode?.growwPythonCode || generatedCode?.pythonCode || '# Loading Groww API script...'}
            </pre>
          </div>
        )}

        {/* CONTENT TAB 3: ZERODHA PYTHON CODE */}
        {activeTab === 'PYTHON_CODE' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Zerodha KiteConnect Python Script:
              </span>
              <button
                onClick={() => handleCopyCode(generatedCode?.zerodhaPythonCode || generatedCode?.pythonCode || '')}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Zerodha Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-black rounded-xl border border-red-950/80 text-[11px] leading-relaxed text-emerald-300 overflow-x-auto max-h-[360px]">
              {generatedCode?.zerodhaPythonCode || generatedCode?.pythonCode || '# Loading Zerodha Kite script...'}
            </pre>
          </div>
        )}

        {/* CONTENT TAB 4: NODE.JS DEMAT CODE */}
        {activeTab === 'NODE_CODE' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Node.js Client (Groww & Kite REST API):
              </span>
              <button
                onClick={() => handleCopyCode(generatedCode?.growwNodeCode || generatedCode?.nodeCode || '')}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Node.js Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-black rounded-xl border border-red-950/80 text-[11px] leading-relaxed text-cyan-300 overflow-x-auto max-h-[360px]">
              {generatedCode?.growwNodeCode || generatedCode?.nodeCode || '// Loading Node.js script...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
