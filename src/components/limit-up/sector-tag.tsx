interface Props {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function SectorTag({ name, count, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors " +
        (active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
      }
    >
      {name}
      <span className={active ? "text-blue-200" : "text-gray-400"}>{count}</span>
    </button>
  );
}

/** 从涨停池提取题材统计 */
export function extractSectors(
  stocks: { sector: string }[]
): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of stocks) {
    const name = s.sector || "其他";
    map.set(name, (map.get(name) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
