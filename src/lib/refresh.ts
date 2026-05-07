import { fetchLimitUpPool, fetchSectorRanking, fetchNews, deriveSectorRanking } from "./eastmoney";
import { updateConsecutiveDays } from "./consecutive-days";
import { saveDailyData } from "./data-store";
import { isTradingDay, getLatestTradingDay } from "./trading-calendar";
import type { DailyMarketData } from "./types";

function beijingNow(): Date {
  return new Date(new Date().getTime() + 8 * 3600 * 1000);
}

function todayStr(): string {
  const d = beijingNow();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  // 交易日拉取当天数据（盘前也拉，API 会返回实时数据），非交易日取最近交易日
  const dataDate = todayIsTrading
    ? today
    : await getLatestTradingDay(today).catch(() => today);

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
