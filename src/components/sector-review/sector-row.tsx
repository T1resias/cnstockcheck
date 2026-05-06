import type { SectorRanking } from "@/lib/types";
import { StreakBadge } from "./streak-badge";

export function SectorRow({ sector }: { sector: SectorRanking }) {
  const rankChange =
    sector.prevRank != null ? sector.prevRank - sector.rank : null;

  return (
    <tr
      className={
        "border-b border-gray-100 hover:bg-blue-50/40 transition-colors " +
        (sector.consecutiveDays >= 3 ? "bg-amber-50/50" : "")
      }
    >
      <td className="px-3 py-2.5 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="tabular-nums font-semibold text-gray-900">
            {sector.rank}
          </span>
          {rankChange != null && rankChange !== 0 && (
            <span
              className={
                "text-xs tabular-nums " +
                (rankChange > 0 ? "text-up" : "text-down")
              }
            >
              {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5 font-medium">{sector.name}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        <span
          className={sector.changePct >= 0 ? "text-up font-semibold" : "text-down font-semibold"}
        >
          {sector.changePct >= 0 ? "+" : ""}
          {sector.changePct.toFixed(2)}%
        </span>
      </td>
      <td className="px-3 py-2.5 text-gray-700">
        {sector.topStock || "-"}
      </td>
      <td className="px-3 py-2.5 text-center tabular-nums text-gray-600">
        <span className="text-up">{sector.ups}</span>
        {sector.stockCount > 0 && (
          <span className="text-gray-400">/{sector.stockCount}</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-center">
        <StreakBadge days={sector.consecutiveDays} />
      </td>
    </tr>
  );
}
