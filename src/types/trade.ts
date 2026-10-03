export type Direction = 'CALL' | 'PUT' | 'NO_TRADE';
export type IndexType = 'NIFTY' | 'BANKNIFTY' | 'SENSEX';
export type AssetType = 'INDEX' | 'CRYPTO' | 'EQUITY';
export type SignalStatus = 'ACTIVE' | 'TARGET_HIT' | 'SL_HIT' | 'PENDING' | 'EXECUTED';
export type PositionStatus = 'OPEN' | 'CLOSED';
export type ExitReason = 'TARGET_1' | 'TARGET_2' | 'STOP_LOSS' | 'MANUAL';

export interface AIPredictionResult {
  takeTrade: boolean;
  tradeDecisionReason: string;
  callOrPut: Direction;
  index: IndexType;
  currentPrice: number;
  entryPrice: number;
  stopLoss: number;
  target: number;
  target2: number;
  riskRewardRatio: string;
  slPoints: number;
  targetPoints: number;
  rsiValue: number;
  rsiCondition: string;
  patternDetected: string;
  sniperScore?: number;
  confluenceList?: Array<{
    id: number;
    name: string;
    passed: boolean;
    detail: string;
  }>;
  classification: {
    predictedClass: Direction;
    probability: number;
    modelType: string;
  };
  regression: {
    expectedReturnPct: number;
    riskPct: number;
    confidenceInterval: string;
    modelType: string;
  };
  capitalSizing: {
    userCapital: number;
    riskPerTradeAmount: number;
    recommendedLots: number;
    recommendedQuantity: number;
    maxPotentialLoss: number;
    expectedProfit: number;
  };
  rules: {
    entryCondition: string;
    exitCondition: string;
    ifSlHits: string;
    overTradeWarning: string;
  };
}

export interface TradePosition {
  id: string;
  index: IndexType;
  callOrPut: Direction;
  entryPrice: number;
  currentPrice: number;
  target: number;
  stopLoss: number;
  lots: number;
  quantity: number;
  invested: number;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'TARGET_HIT' | 'SL_HIT' | 'CLOSED';
  time: string;
}

export interface TradeSignal {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  direction: Direction;
  timeframe: string;
  entryPrice: number;
  target1: number;
  target2: number;
  stopLoss: number;
  currentPrice: number;
  pnlPercent: number;
  status: SignalStatus;
  rsiValue: number;
  rsiCondition: string;
  patternName: string;
  winRatePercent: number;
  riskRewardRatio: string;
  reasoning: string;
  ifSlHitsAction: string;
  overTradeRule: string;
  timestamp: string;
}

export interface Position {
  id: string;
  signalId?: string;
  symbol: string;
  direction: Direction;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  investedAmount: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss: number;
  target1: number;
  target2: number;
  openTime: string;
  status: PositionStatus;
  closePrice?: number;
  closeTime?: string;
  exitReason?: ExitReason;
  peakPnlPercent?: number;
}

export interface Portfolio {
  balance: number;
  startingBalance: number;
  equity: number;
  realizedPnl: number;
  dailyPnl: number;
  marginUsed: number;
  availableCash: number;
  winCount: number;
  lossCount: number;
  totalTradesToday: number;
  maxTradesDaily: number;
  dailyLossLimit: number;
  currency: 'USD' | 'INR';
}

export interface ChartAnalysisResult {
  asset: string;
  timeframe: string;
  direction: Direction;
  confidence: number;
  currentPrice: number;
  entryPrice: number;
  target1: number;
  target2: number;
  stopLoss: number;
  riskRewardRatio: string;
  potentialProfitPercent: number;
  potentialLossPercent: number;
  chartPattern: string;
  rsiAnalysis: {
    value: number;
    status: string;
    divergence: string;
  };
  executionGuide: {
    takeTradeHere: string;
    exitPointHere: string;
    stopLossHere: string;
    ifSlHits: string;
    overTradeRule: string;
    pastRecordContext: string;
  };
  overlayCoordinates?: {
    entryYPercent: number;
    target1YPercent: number;
    stopLossYPercent: number;
  };
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  ema9: number;
  ema21: number;
  upperBB?: number;
  lowerBB?: number;
}

export interface PastRecord {
  id: string;
  date: string;
  symbol: string;
  pattern: string;
  direction: Direction;
  rsiTrigger: number;
  outcome: 'PROFIT' | 'LOSS';
  rrRatio: string;
  gainPercent: number;
  session: string;
  notes: string;
}
