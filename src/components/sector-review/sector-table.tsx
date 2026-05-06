import type { SectorRanking } from "@/lib/types";
import { SectorRow } from "./sector-row";

interface Props {
  sectors: SectorRanking[];
}

export function SectorTable({ sectors }: Props) {
  return (
    <div className="overflow-x-auto table-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-left">
            <th className="px-3 py-2.5 font-medium w-16 text-center">排名</th>
            <th className="px-3 py-2.5 font-medium">板块名称</th>
            <th className="px-3 py-2.5 font-medium w-24 text-right">涨幅</th>
            <th className="px-3 py-2.5 font-medium w-28">领涨股</th>
            <th className="px-3 py-2.5 font-medium w-20 text-center">上涨/总数</th>
            <th className="px-3 py-2.5 font-medium w-28 text-center">特别标记</th>
          </tr>
        </thead>
        <tbody>
          {sectors.slice(0, 30).map((s) => (
            <SectorRow key={s.code} sector={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
