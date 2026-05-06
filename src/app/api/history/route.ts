import { NextResponse } from "next/server";
import { loadConsecutiveDays, loadDailyData, getRecentDates } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await loadConsecutiveDays();
  const dates = await getRecentDates(10);

  // 为每个连榜≥2的板块返回最近日期的排名趋势
  const history: Record<string, { dates: string[]; ranks: number[]; bestRank: number; consecutiveDays: number }> = {};

  for (const [name, entry] of Object.entries(store.sectors)) {
    if (entry.consecutiveDays < 2) continue;
    const ranks: number[] = [];
    const availableDates: string[] = [];

    for (const d of entry.lastDates.slice(-5)) {
      const data = await loadDailyData(d);
      if (data) {
        const sector = data.sectorRankings.find((s) => s.name === name);
        availableDates.push(d);
        ranks.push(sector?.rank ?? -1);
      }
    }

    history[name] = {
      dates: availableDates,
      ranks,
      bestRank: entry.bestRank,
      consecutiveDays: entry.consecutiveDays,
    };
  }

  return NextResponse.json(history);
}
