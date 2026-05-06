import type { SectorRanking, ConsecutiveDaysStore } from "./types";
import { loadConsecutiveDays, saveConsecutiveDays } from "./data-store";

/**
 * 根据当日板块排行更新连榜数据
 * 传入今日Top-N板块名称集合和日期，返回附加了连榜数的板块排行
 */
export async function updateConsecutiveDays(
  todayRankings: SectorRanking[],
  todayDate: string
): Promise<SectorRanking[]> {
  const store = await loadConsecutiveDays();

  // 判断是否为新日期
  if (store.lastUpdateDate === todayDate) {
    // 同一天，直接使用已有数据
    return applyStreaks(todayRankings, store);
  }

  // 新的一天，更新连榜数据
  const todayNames = new Set(
    todayRankings.slice(0, 20).map((s) => s.name)
  );

  for (const name of todayNames) {
    if (store.sectors[name]) {
      const entry = store.sectors[name];
      entry.consecutiveDays++;
      entry.lastDates.push(todayDate);
      // 只保留最近10天
      if (entry.lastDates.length > 10) {
        entry.lastDates = entry.lastDates.slice(-10);
      }
      if (todayRankings.find(s => s.name === name && s.rank < entry.bestRank)) {
        entry.bestRank = todayRankings.find(s => s.name === name)!.rank;
      }
    } else {
      store.sectors[name] = {
        consecutiveDays: 1,
        lastDates: [todayDate],
        bestRank: todayRankings.find(s => s.name === name)?.rank || 20,
      };
    }
  }

  // 对于不在今日Top-20的板块，连续中断
  for (const [name, entry] of Object.entries(store.sectors)) {
    if (!todayNames.has(name)) {
      entry.consecutiveDays = 0;
    }
  }

  store.lastUpdateDate = todayDate;
  await saveConsecutiveDays(store);

  return applyStreaks(todayRankings, store);
}

function applyStreaks(
  rankings: SectorRanking[],
  store: ConsecutiveDaysStore
): SectorRanking[] {
  return rankings.map((s) => ({
    ...s,
    consecutiveDays: store.sectors[s.name]?.consecutiveDays || 0,
  }));
}
