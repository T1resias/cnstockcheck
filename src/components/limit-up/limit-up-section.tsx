"use client";

import { useState, useMemo } from "react";
import type { LimitUpStock } from "@/lib/types";
import { SectorTag, extractSectors } from "./sector-tag";
import { LimitUpTable } from "./limit-up-table";

interface Props {
  stocks: LimitUpStock[];
}

export function LimitUpSection({ stocks }: Props) {
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const sectors = useMemo(() => extractSectors(stocks), [stocks]);

  const filtered = useMemo(() => {
    if (!activeSector) return stocks;
    return stocks.filter(
      (s) => (s.sector || "其他") === activeSector
    );
  }, [stocks, activeSector]);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          涨停股票
          <span className="ml-2 text-sm font-normal text-gray-500">
            共 {stocks.length} 只
          </span>
        </h2>

        {/* 题材筛选标签 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <button
            onClick={() => setActiveSector(null)}
            className={
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors " +
              (activeSector === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200")
            }
          >
            全部
            <span className={activeSector === null ? "text-blue-200" : "text-gray-400"}>
              {stocks.length}
            </span>
          </button>
          {sectors.map((s) => (
            <SectorTag
              key={s.name}
              name={s.name}
              count={s.count}
              active={activeSector === s.name}
              onClick={() =>
                setActiveSector(activeSector === s.name ? null : s.name)
              }
            />
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <LimitUpTable stocks={filtered} />
      ) : (
        <p className="text-gray-400 text-center py-12">今日无涨停股票</p>
      )}
    </section>
  );
}
