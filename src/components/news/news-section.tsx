import type { NewsItem } from "@/lib/types";
import { NewsCard } from "./news-card";

interface Props {
  news: NewsItem[];
}

export function NewsSection({ news }: Props) {
  if (news.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">财经资讯</h2>
        <p className="text-gray-400 text-center py-12">暂无资讯</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        财经资讯
        <span className="ml-2 text-sm font-normal text-gray-500">
          共 {news.length} 条
        </span>
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
