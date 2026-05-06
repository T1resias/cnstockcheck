interface Props {
  days: number;
}

export function StreakBadge({ days }: Props) {
  if (days < 2) return null;

  const intense = days >= 4 ? "hot" : days >= 3 ? "warm" : "normal";

  const styles = {
    normal: "bg-amber-50 text-amber-700 border-amber-200",
    warm: "bg-orange-50 text-orange-700 border-orange-300",
    hot: "bg-red-50 text-red-700 border-red-300",
  };

  const fireIcons = {
    normal: "🔥",
    warm: "🔥🔥",
    hot: "🔥🔥🔥",
  };

  return (
    <span
      className={
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold border " +
        styles[intense]
      }
      title={`连续 ${days} 天进入涨幅前20`}
    >
      {fireIcons[intense]} {days}连榜
    </span>
  );
}
