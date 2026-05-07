import type { DailyMarketData, ConsecutiveDaysStore } from "./types";

const isVercel = process.env.VERCEL === "1";

/** Vercel Blob 是否可用 */
function blobReady(): boolean {
  return isVercel && !!process.env.BLOB_READ_WRITE_TOKEN;
}

// 编译时就打包到函数里的已提交数据
import committedHistory0506 from "@/../data/history/2026-05-06.json";
import committedConsecutive from "@/../data/consecutive-days.json";

const committedData: Record<string, DailyMarketData> = {
  "2026-05-06": committedHistory0506 as unknown as DailyMarketData,
};

// ========== 每日快照 ==========

export async function saveDailyData(data: DailyMarketData): Promise<void> {
  const content = JSON.stringify(data);

  if (blobReady()) {
    try {
      const { put } = await import("@vercel/blob");
      await put(`history/${data.date}.json`, content, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return;
    } catch {
      // Blob 写入失败，降级
    }
  } else {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "data", "history");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${data.date}.json`), content, "utf-8");
  }
}

export async function loadDailyData(dateStr: string): Promise<DailyMarketData | null> {
  if (blobReady()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `history/${dateStr}.json` });
      if (blobs.length === 0) return null;
      const res = await fetch(blobs[0].url);
      if (!res.ok) return null;
      return res.json();
    } catch {
      // Blob 读取失败，走降级
    }
  }

  // Vercel 上无 Blob 时用编译时打包的数据
  if (isVercel) {
    return committedData[dateStr] || null;
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const filepath = path.join(process.cwd(), "data", "history", `${dateStr}.json`);
  try {
    const raw = await fs.readFile(filepath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadLatestData(): Promise<DailyMarketData | null> {
  if (blobReady()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "history/202" });
      const sorted = blobs
        .map((b) => b.pathname.replace("history/", "").replace(".json", ""))
        .filter((d) => d.startsWith("20"))
        .sort()
        .reverse();

      for (const dateStr of sorted) {
        const data = await loadDailyData(dateStr);
        if (data && data.limitUpStocks.length > 0) return data;
      }
    } catch {
      // Blob 列表失败
    }
    return null;
  }

  // Vercel 上无 Blob 时用编译时打包的数据
  if (isVercel) {
    const dates = Object.keys(committedData).sort().reverse();
    for (const d of dates) {
      if (committedData[d]?.limitUpStocks?.length > 0) return committedData[d];
    }
    return null;
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "data", "history");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return null;
  }
  const jsonFiles = files
    .filter((f) => f.endsWith(".json") && f.startsWith("20"))
    .sort()
    .reverse();

  for (const f of jsonFiles) {
    const data = await loadDailyData(f.replace(".json", ""));
    if (data && data.limitUpStocks.length > 0) return data;
  }
  return null;
}

export async function getRecentDates(days: number): Promise<string[]> {
  if (blobReady()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "history/202" });
      return blobs
        .map((b) => b.pathname.replace("history/", "").replace(".json", ""))
        .filter((d) => d.startsWith("20"))
        .sort()
        .reverse()
        .slice(0, days);
    } catch {
      // 降级
    }
  }

  if (isVercel) {
    return Object.keys(committedData).sort().reverse().slice(0, days);
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "data", "history");
  let files: string[];
  try {
    files = await fs.readdir(dir);
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
  if (blobReady()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: "consecutive-days.json" });
      if (blobs.length === 0) return { sectors: {}, lastUpdateDate: "" };
      const res = await fetch(blobs[0].url);
      if (!res.ok) return { sectors: {}, lastUpdateDate: "" };
      return res.json();
    } catch {
      // 降级
    }
  }

  if (isVercel) {
    return committedConsecutive as unknown as ConsecutiveDaysStore;
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const filepath = path.join(process.cwd(), "data", "consecutive-days.json");
  try {
    const raw = await fs.readFile(filepath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { sectors: {}, lastUpdateDate: "" };
  }
}

export async function saveConsecutiveDays(store: ConsecutiveDaysStore): Promise<void> {
  const content = JSON.stringify(store);

  if (blobReady()) {
    const { put } = await import("@vercel/blob");
    await put("consecutive-days.json", content, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "data");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "consecutive-days.json"), content, "utf-8");
}
