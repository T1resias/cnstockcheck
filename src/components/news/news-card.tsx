import type { NewsItem } from "@/lib/types";

function formatTime(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}-${day} ${h}:${min}`;
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white"
    >
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1.5">
        {item.title}
      </h3>
      {item.summary && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.summary}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {item.source && <span>{item.source}</span>}
        {item.timestamp > 0 && <span>{formatTime(item.timestamp)}</span>}
        {item.columns && item.columns.length > 0 && (
          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
            {item.columns[0]}
          </span>
        )}
      </div>
    </a>
  );
}
