import fs from "fs/promises";
import path from "path";
import type { DailyMarketData, ConsecutiveDaysStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const CONSECUTIVE_FILE = path.join(DATA_DIR, "consecutive-days.json");

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

// ========== 每日快照 ==========
export async function saveDailyData(data: DailyMarketData): Promise<void> {
  await ensureDirs();
  const filepath = path.join(HISTORY_DIR, `${data.date}.json`);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadDailyData(dateStr: string): Promise<DailyMarketData | null> {
  const filepath = path.join(HISTORY_DIR, `${dateStr}.json`);
  try {
    const raw = await fs.readFile(filepath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadLatestData(): Promise<DailyMarketData | null> {
  await ensureDirs();
  let files: string[];
  try {
    files = await fs.readdir(HISTORY_DIR);
  } catch {
    return null;
  }
  const jsonFiles = files
    .filter((f) => f.endsWith(".json") && f.startsWith("20"))
    .sort()
    .reverse();

  // 跳过空数据文件 (今天盘前生成的)
  for (const f of jsonFiles) {
    const data = await loadDailyData(f.replace(".json", ""));
    if (data && data.limitUpStocks.length > 0) return data;
  }
  return null;
}

export async function getRecentDates(days: number): Promise<string[]> {
  await ensureDirs();
  let files: string[];
  try {
    files = await fs.readdir(HISTORY_DIR);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith(".json") && f.startsWith("20"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse()
    .slice(0, days);
}

// ========== 连榜存储 ==========
export async function loadConsecutiveDays(): Promise<ConsecutiveDaysStore> {
  try {
    const raw = await fs.readFile(CONSECUTIVE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { sectors: {}, lastUpdateDate: "" };
  }
}

export async function saveConsecutiveDays(store: ConsecutiveDaysStore): Promise<void> {
  await ensureDirs();
  await fs.writeFile(CONSECUTIVE_FILE, JSON.stringify(store, null, 2), "utf-8");
}
