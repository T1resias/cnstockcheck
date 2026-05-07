// ========== 涨停股票 ==========
export interface LimitUpStock {
  code: string;            // 股票代码 e.g. "300502"
  name: string;            // 股票名称
  price: number;           // 最新价
  changePct: number;       // 涨跌幅%
  limitUpDays: number;     // 连板天数
  turnoverRate: number;    // 换手率%
  sector: string;          // 所属题材/板块
  mkt: number;             // 市场: 0深交所 1上交所
}

// ========== 板块排行 ==========
export interface SectorRanking {
  code: string;            // 板块代码
  name: string;            // 板块名称 e.g. "CPO", "液冷"
  changePct: number;       // 涨跌幅%
  topStock: string;        // 领涨股
  topStockChangePct: number;// 领涨股涨幅
  stockCount: number;      // 成分股数量
  ups: number;             // 上涨家数

  // 由本地计算
  consecutiveDays: number; // 连续进Top20天数
  rank: number;            // 当日排名(按涨幅)
  prevRank?: number;       // 昨日排名
}

// ========== 财经资讯 ==========
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  url: string;
  columns?: string[];      // 所属栏目
}

// ========== 每日快照 ==========
export interface DailyMarketData {
  date: string;                  // YYYY-MM-DD
  isTradingDay: boolean;
  nextTradingDay?: string;
  limitUpStocks: LimitUpStock[];
  sectorRankings: SectorRanking[];
  newsItems: NewsItem[];
  updatedAt: number;             // unix timestamp
}

// ========== 连榜追踪存储 ==========
export interface ConsecutiveDaysStore {
  // key: 板块名称, value: 连续出现天数
  sectors: Record<string, {
    consecutiveDays: number;
    lastDates: string[];      // 最近N天日期列表
    bestRank: number;         // 最佳排名
  }>;
  lastUpdateDate: string;      // YYYY-MM-DD
}

// ========== 交易日历 ==========
export interface TradingCalendar {
  year: number;
  holidays: string[];          // YYYY-MM-DD 格式的节假日列表
  lastUpdate: number;
}

// ========== API 响应 ==========
export interface RefreshResponse {
  ok: boolean;
  date: string;
  isTradingDay: boolean;
  stockCount: number;
  sectorCount: number;
  newsCount: number;
  error?: string;
}

export interface HistoryResponse {
  sector: string;
  dates: string[];
  ranks: number[];
}[]
