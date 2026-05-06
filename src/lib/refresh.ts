import { fetchLimitUpPool, fetchSectorRanking, fetchNews, deriveSectorRanking } from "./eastmoney";
import { updateConsecutiveDays } from "./consecutive-days";
import { saveDailyData } from "./data-store";
import { isTradingDay, getLatestTradingDay } from "./trading-calendar";
import type { DailyMarketData } from "./types";

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** A股收盘时间: 北京时间 15:00 */
function isAfterMarketClose(): boolean {
  const now = new Date();
  const h = now.getHours();
  return h >= 15;
}

export async function refreshAll(): Promise<{
  date: string;
  isTradingDay: boolean;
  stockCount: number;
  sectorCount: number;
  newsCount: number;
}> {
  const today = todayStr();
  const todayIsTrading = await isTradingDay(today);

  // 选数据日期: 收盘后用今天，否则用最近交易日
  let dataDate: string;
  if (todayIsTrading && isAfterMarketClose()) {
    dataDate = today;
  } else {
    dataDate = await getLatestTradingDay(today).catch(() => today);
  }

  if (!todayIsTrading && !isAfterMarketClose()) {
    return { date: today, isTradingDay: false, stockCount: 0, sectorCount: 0, newsCount: 0 };
  }

  // 拉取数据: 股票(含行业) + 板块 + 资讯
  const [stocks, rawSectors, news] = await Promise.all([
    fetchLimitUpPool(dataDate),
    fetchSectorRanking().catch(() => [] as import("./types").SectorRanking[]),
    fetchNews().catch(() => []),
  ]);

  // 如果东方财富板块API不可用，从涨停股聚合板块排行
  const sectorInput =
    rawSectors.length > 0
      ? rawSectors
      : deriveSectorRanking(stocks);

  // 计算连榜
  const sectors = await updateConsecutiveDays(sectorInput, dataDate);

  const marketData: DailyMarketData = {
    date: dataDate,
    isTradingDay: true,
    nextTradingDay: undefined,
    limitUpStocks: stocks,
    sectorRankings: sectors,
    newsItems: news,
    updatedAt: Date.now(),
  };

  await saveDailyData(marketData);

  return {
    date: dataDate,
    isTradingDay: true,
    stockCount: stocks.length,
    sectorCount: sectors.length,
    newsCount: news.length,
  };
}
