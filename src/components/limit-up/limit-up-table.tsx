import type { LimitUpStock } from "@/lib/types";
import { LimitUpRow } from "./limit-up-row";

interface Props {
  stocks: LimitUpStock[];
}

export function LimitUpTable({ stocks }: Props) {
  return (
    <div className="overflow-x-auto table-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-left">
            <th className="px-3 py-2.5 font-medium w-24">代码</th>
            <th className="px-3 py-2.5 font-medium w-28">名称</th>
            <th className="px-3 py-2.5 font-medium w-20 text-right">最新价</th>
            <th className="px-3 py-2.5 font-medium w-20 text-right">涨幅</th>
            <th className="px-3 py-2.5 font-medium w-16 text-center">连板</th>
            <th className="px-3 py-2.5 font-medium w-20 text-right">换手率</th>
            <th className="px-3 py-2.5 font-medium">题材</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <LimitUpRow key={s.code} stock={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
