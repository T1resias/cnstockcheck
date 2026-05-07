/**
 * 从东方财富 F10 API 批量拉取股票行业 → 更新 data/industry-map.json
 * 数据源: emweb.securities.eastmoney.com/PC_HSF10/CompanySurvey/CompanySurveyAjax
 * 用法: npx tsx scripts/update-industry-map.ts
 */
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 股票代码 → 东方财富 market prefix (SH/SZ/BJ) */
function emCode(code: string): string {
  // 北交所: 8xxxxx, 92xxxx
  if (code.startsWith("8") || code.startsWith("92")) return `BJ${code}`;
  // 沪市: 6xxxxx, 5xxxxx
  if (code.startsWith("6") || code.startsWith("5")) return `SH${code}`;
  // 深市: 0xxxxx, 3xxxxx
  return `SZ${code}`;
}

async function fetchIndustry(emCode: string): Promise<string | null> {
  const url = `https://emweb.securities.eastmoney.com/PC_HSF10/CompanySurvey/CompanySurveyAjax?code=${emCode}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: "https://emweb.securities.eastmoney.com/" },
  });
  if (!res.ok) return null;
  const json: any = await res.json();
  return json?.jbzl?.sshy || null;
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
    console.log(`已有缓存: ${Object.keys(existing).length} 只`);
  } catch {}

  // 加载今日涨停数据，找出缺失的股票
  let missing: { code: string; name: string }[] = [];
  try {
    const todayData = JSON.parse(
      await readFile(
        join(process.cwd(), "data", "history", "2026-05-07.json"),
        "utf-8"
      )
    );
    const stocks = todayData.limitUpStocks.map((s: any) => ({
      code: String(s.code),
      name: s.name,
    }));
    missing = stocks.filter((s) => !existing[s.code]);
    console.log(
      `今日涨停: ${stocks.length} 只, 待补充: ${missing.length} 只\n`
    );
  } catch {
    console.log("未找到今日数据\n");
  }

  if (missing.length === 0) {
    console.log("所有股票已在缓存中");
    return;
  }

  // 并发拉取（5个一组）
  let added = 0;
  let failed = 0;
  const batchSize = 5;

  for (let i = 0; i < missing.length; i += batchSize) {
    const batch = missing.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async ({ code, name }) => {
        const ecode = emCode(code);
        const industry = await fetchIndustry(ecode);
        if (industry) {
          existing[code] = industry;
          return { code, name, industry };
        }
        return null;
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const { code, name, industry } = r.value;
        added++;
        console.log(`[${i + 1}-${Math.min(i + batchSize, missing.length)}/${missing.length}] ${code} ${name} → ${industry}`);
      } else {
        failed++;
      }
    }

    if (i + batchSize < missing.length) await sleep(100);
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
    `\n✅ 总计 ${Object.keys(existing).length} 只 (新增 ${added})${failed > 0 ? `, 失败 ${failed}` : ""}`
  );
}

main().catch((e) => {
  console.error("失败:", e);
  process.exit(1);
});
