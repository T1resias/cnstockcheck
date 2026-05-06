import type { LimitUpStock, SectorRanking, NewsItem } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const EM_HEADERS = {
  "User-Agent": UA,
  Referer: "https://quote.eastmoney.com/",
};

/** 各板块涨跌幅限制 */
function limitThreshold(code: string): number {
  const prefix = code.substring(0, 3);
  if (prefix === "300" || prefix === "301" || prefix === "688") return 19.9;
  if (code.startsWith("8")) return 29.9;
  return 9.9;
}

function marketCode(code: string): number {
  return code.startsWith("6") || code.startsWith("5") ? 1 : 0;
}

// ========== 涨停股票 (新浪财经拉取 + 东方财富补题材) ==========

interface SinaStock {
  symbol: string;
  code: string;
  name: string;
  trade: string;
  pricechange: string;
  changepercent: number;
  open: string;
  high: string;
  low: string;
  settlement: string;
  volume: number;
  amount: number;
  turnoverratio: number;
  per: number;
  mktcap: number;
  nmc: number;
}

export async function fetchLimitUpPool(_dateStr: string): Promise<LimitUpStock[]> {
  const allStocks: SinaStock[] = [];

  // 从新浪分页拉取A股涨幅榜
  for (let page = 1; page <= 6; page++) {
    const url =
      `https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=${page}&num=80&sort=changepercent&asc=0&node=hs_a&symbol=`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Referer: "https://finance.sina.com.cn/",
        },
      });
    } catch {
      break;
    }
    if (!res.ok) break;

    const data = (await res.json()) as SinaStock[];
    if (!Array.isArray(data) || data.length === 0) break;

    allStocks.push(...data);

    // 最后一支涨幅低于 9.5% 即停止翻页
    const last = data[data.length - 1];
    if (last.changepercent < 9.5 || data.length < 80) break;
  }

  // 筛选涨停股票
  const candidates = allStocks.filter((s) => {
    const code = String(s.code);
    const name = String(s.name);
    // 过滤ST
    if (/\bS?\*?ST\b/.test(name)) return false;
    return s.changepercent >= limitThreshold(code);
  });

  // 加载本地行业缓存
  let meta: { lastFullRefresh?: string } = {};
  let localIndustryMap: Record<string, string> = {};
  let stale = false;
  try {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const raw = await readFile(join(process.cwd(), "data", "industry-map.json"), "utf-8");
    const full = JSON.parse(raw);
    meta = full._meta || {};
    for (const [k, v] of Object.entries(full)) {
      if (k !== "_meta" && typeof v === "string") localIndustryMap[k] = v;
    }
    // 30天无全量刷新则标记过期
    if (meta.lastFullRefresh) {
      const age = Date.now() - new Date(meta.lastFullRefresh).getTime();
      if (age > 30 * 24 * 3600 * 1000) stale = true;
    }
  } catch {
    /* no cache yet */
  }
  const cachedCount = Object.keys(localIndustryMap).length;

  // 过期缓存清除，强制重查
  if (stale) {
    localIndustryMap = {};
    meta.lastFullRefresh = undefined;
  }

  // 批量获取行业信息 (优先用缓存，缓存未命中则调API)
  // Vercel环境下跳过个股API调用（10s超时限制），仅用本地缓存
  const sectorMap = new Map<string, string>(Object.entries(localIndustryMap));
  const isVercel = process.env.VERCEL === "1";

  for (const s of candidates) {
    const code = String(s.code);
    if (sectorMap.has(code) || isVercel) continue;

    try {
      const mkt = marketCode(code) === 1 ? "1" : "0";
      const emUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${mkt}.${code}&fields=f57,f127&ut=b2884a393a59ad64002292a3e90d46a5`;
      const emRes = await fetch(emUrl, {
        headers: EM_HEADERS,
      });
      if (emRes.ok) {
        const emJson = await emRes.json();
        const industry = String(emJson?.data?.f127 || "");
        if (industry) {
          sectorMap.set(code, industry);
          localIndustryMap[code] = industry;
        }
      }
    } catch {
      // 获取失败，跳过
    }

    // 延迟 300ms 避免限流
    await new Promise((r) => setTimeout(r, 300));
  }

  // 有变更则保存缓存
  const newCount = Object.keys(localIndustryMap).length;
  if (newCount !== cachedCount || stale) {
    const { writeFile } = await import("fs/promises");
    const { join } = await import("path");
    const toSave: Record<string, unknown> = { ...localIndustryMap };
    toSave._meta = { lastFullRefresh: new Date().toISOString().slice(0, 10), totalEntries: newCount };
    const cachePath = join(process.cwd(), "data", "industry-map.json");
    writeFile(cachePath, JSON.stringify(toSave, null, 2), "utf-8").catch(() => {});
  }

  return candidates.map(
    (s): LimitUpStock => ({
      code: String(s.code),
      name: String(s.name),
      price: Number(s.trade) || 0,
      changePct: s.changepercent,
      limitUpDays: 1,
      firstLimitUpTime: "",
      turnoverRate: s.turnoverratio || 0,
      fundFlow: 0,
      sector: sectorMap.get(String(s.code)) || "",
      mkt: marketCode(String(s.code)),
    })
  );
}

// ========== 板块排行 (从涨停股聚合 + 东方财富板块API备选) ==========
export async function fetchSectorRanking(): Promise<SectorRanking[]> {
  // 尝试东方财富概念板块排行
  try {
    const params = new URLSearchParams({
      fid: "f3",
      po: "1",
      pz: "50",
      pn: "1",
      np: "1",
      fltt: "2",
      invt: "2",
      ut: "b2884a393a59ad64002292a3e90d46a5",
      fs: "m:90+t:3",
      fields: "f2,f3,f4,f8,f12,f14,f104,f105,f128",
    });

    const url = `https://push2.eastmoney.com/api/qt/clist/get?${params}`;
    const res = await fetch(url, {
      headers: {
        ...EM_HEADERS,
        Referer: "https://data.eastmoney.com/",
      },
    });
    if (res.ok) {
      const json = await res.json();
      const diff = json?.data?.diff;
      if (Array.isArray(diff)) {
        return diff.map(
          (r: Record<string, unknown>, idx: number): SectorRanking => ({
            code: String(r.f12 || ""),
            name: String(r.f14 || ""),
            changePct: Number(r.f3) || 0,
            topStock: String(r.f128 || ""),
            topStockChangePct: 0,
            stockCount: 0,
            ups: Number(r.f104) || 0,
            consecutiveDays: 0,
            rank: idx + 1,
          })
        );
      }
    }
  } catch {
    // 东方财富不可用，从涨停数据聚合
  }

  // 返回空，由 refresh 层从涨停数据聚合板块排行
  return [];
}

// ========== 财经资讯 (新浪财经) ==========
export async function fetchNews(): Promise<NewsItem[]> {
  const url =
    "https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2509&num=20&page=1";

  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://finance.sina.com.cn/",
    },
  });
  if (!res.ok) throw new Error(`资讯API HTTP ${res.status}`);

  const json = await res.json();
  const list = json?.result?.data;
  if (!list || !Array.isArray(list)) {
    return [];
  }

  return list.map(
    (r: Record<string, unknown>): NewsItem => ({
      id: String(r.docid || ""),
      title: String(r.title || ""),
      summary: String(r.intro || r.summary || ""),
      source: String(r.media_name || ""),
      timestamp: Number(r.intime) || Number(r.rtime) || 0,
      url: String(r.url || ""),
    })
  );
}

// ========== 工具: 从涨停股聚合板块排行 ==========
export function deriveSectorRanking(stocks: LimitUpStock[]): SectorRanking[] {
  const sectorMap = new Map<
    string,
    { totalChange: number; count: number; topStock: string; topChange: number }
  >();

  for (const s of stocks) {
    const sector = s.sector || "其他";
    const cur = sectorMap.get(sector);
    if (cur) {
      cur.totalChange += s.changePct;
      cur.count++;
      if (s.changePct > cur.topChange) {
        cur.topChange = s.changePct;
        cur.topStock = s.name;
      }
    } else {
      sectorMap.set(sector, {
        totalChange: s.changePct,
        count: 1,
        topStock: s.name,
        topChange: s.changePct,
      });
    }
  }

  return Array.from(sectorMap.entries())
    .map(([name, info], idx) => ({
      code: "",
      name,
      changePct: info.totalChange / info.count, // 平均涨幅
      topStock: info.topStock,
      topStockChangePct: info.topChange,
      stockCount: info.count,
      ups: info.count,
      consecutiveDays: 0,
      rank: idx + 1,
    }))
    .sort((a, b) => {
      // 按涨停数量降序
      if (b.stockCount !== a.stockCount) return b.stockCount - a.stockCount;
      return b.changePct - a.changePct;
    })
    .slice(0, 50)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));
}
