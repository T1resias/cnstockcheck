/**
 * 批量拉取全部A股行业 → 更新 data/industry-map.json
 * 用法: npx tsx scripts/update-industry-map.ts
 */
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const MARKETS = [
  { fs: "m:0+t:6", label: "深市主板" },
  { fs: "m:0+t:80", label: "创业板" },
  { fs: "m:0+t:81", label: "北交所" },
  { fs: "m:1+t:2", label: "沪市主板" },
  { fs: "m:1+t:23", label: "科创板" },
];

async function fetchMarket(market: string): Promise<[string, string][]> {
  const params = new URLSearchParams({
    fid: "f3",
    po: "1",
    pz: "6000",
    pn: "1",
    np: "1",
    fltt: "2",
    invt: "2",
    ut: "b2884a393a59ad64002292a3e90d46a5",
    fs: market,
    fields: "f12,f14,f127",
  });

  const url = `https://push2.eastmoney.com/api/qt/clist/get?${params}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://data.eastmoney.com/",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json: any = await res.json();
  const diff = json?.data?.diff;
  if (!Array.isArray(diff)) {
    throw new Error("unexpected response format");
  }

  return diff
    .filter((r: any) => r.f12 && r.f127)
    .map((r: any) => [String(r.f12), String(r.f127)] as [string, string]);
}

async function main() {
  // 加载现有缓存
  let existing: Record<string, string> = {};
  try {
    const raw = await readFile(
      join(process.cwd(), "data", "industry-map.json"),
      "utf-8"
    );
    const full = JSON.parse(raw);
    for (const [k, v] of Object.entries(full)) {
      if (k !== "_meta" && typeof v === "string" && v) {
        existing[k] = v;
      }
    }
    console.log(`已有缓存: ${Object.keys(existing).length} 只股票`);
  } catch {
    console.log("无现有缓存，将全量拉取");
  }

  // 逐市场拉取
  let totalNew = 0;
  let totalSkipped = 0;
  for (const { fs, label } of MARKETS) {
    try {
      const stocks = await fetchMarket(fs);
      let added = 0;
      for (const [code, industry] of stocks) {
        if (!existing[code]) {
          existing[code] = industry;
          added++;
        }
      }
      totalNew += added;
      totalSkipped += stocks.length - added;
      console.log(`${label}: ${stocks.length} 只 (新增 ${added})`);
    } catch (e: any) {
      console.error(`${label}: 失败 - ${e.message}`);
    }
  }

  // 保存
  const toSave: Record<string, unknown> = { ...existing };
  toSave._meta = {
    lastFullRefresh: new Date().toISOString().slice(0, 10),
    totalEntries: Object.keys(existing).length,
  };

  await writeFile(
    join(process.cwd(), "data", "industry-map.json"),
    JSON.stringify(toSave, null, 2),
    "utf-8"
  );

  console.log(
    `\n完成: 总计 ${Object.keys(existing).length} 只, 新增 ${totalNew} 只`
  );
}

main().catch((e) => {
  console.error("更新失败:", e);
  process.exit(1);
});
