type Tab = "limit-up" | "sector" | "news";

interface Props {
  active: Tab;
  onTab: (t: Tab) => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: "limit-up", label: "涨停股票" },
  { key: "sector", label: "题材复盘" },
  { key: "news", label: "财经资讯" },
];

export function TabNav({ active, onTab }: Props) {
  return (
    <nav className="flex gap-0 max-w-6xl mx-auto px-4 border-b border-gray-200 bg-white">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onTab(t.key)}
          className={
            "px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px" +
            (active === t.key
              ? " border-blue-600 text-blue-600"
              : " border-transparent text-gray-500 hover:text-gray-700")
          }
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
