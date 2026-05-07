import type { LimitUpStock } from "@/lib/types";

function marketLabel(mkt: number): string {
  return mkt === 1 ? "SH" : "SZ";
}

export function LimitUpRow({ stock }: { stock: LimitUpStock }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
      <td className="px-3 py-2 text-gray-500 text-xs font-mono">
        {stock.code}
        <span className="ml-1 text-gray-400">{marketLabel(stock.mkt)}</span>
      </td>
      <td className="px-3 py-2 font-medium">{stock.name}</td>
      <td className="px-3 py-2 text-right tabular-nums">{stock.price.toFixed(2)}</td>
      <td className="px-3 py-2 text-right tabular-nums text-up font-semibold">
        +{stock.changePct.toFixed(2)}%
      </td>
      <td className="px-3 py-2 text-center">
        <span
          className={
            "inline-flex items-center justify-center min-w-7 px-1.5 py-0.5 rounded text-xs font-bold tabular-nums " +
            (stock.limitUpDays >= 3
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700")
          }
        >
          {stock.limitUpDays}板
        </span>
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-gray-600">
        {stock.turnoverRate.toFixed(2)}%
      </td>
      <td className="px-3 py-2">
        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
          {stock.sector || "其他"}
        </span>
      </td>
    </tr>
  );
}
