"use client";

import type { SectorRanking } from "@/lib/types";
import { SectorTable } from "./sector-table";

interface Props {
  sectors: SectorRanking[];
}

export function SectorReviewSection({ sectors }: Props) {
  const hotStreaks = sectors.filter((s) => s.consecutiveDays >= 3);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          题材板块复盘
          <span className="ml-2 text-sm font-normal text-gray-500">
            概念板块涨幅前30
          </span>
        </h2>

        {hotStreaks.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-1.5">
              ⚡ 连续3天以上进入涨幅前20的板块
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hotStreaks.map((s) => (
                <span
                  key={s.code}
                  className={
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold " +
                    (s.consecutiveDays >= 5
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-orange-100 text-orange-700 border border-orange-200")
                  }
                >
                  {s.consecutiveDays >= 5 ? "🔥🔥" : "🔥"} {s.name}
                  <span className="opacity-70">x{s.consecutiveDays}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <SectorTable sectors={sectors} />
    </section>
  );
}
