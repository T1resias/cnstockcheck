import type { TradingCalendar } from "./types";

const CALENDAR_PATH = "data/trading-calendar.json";

/** 中国A股标准休假日列表 2025-2026 */
const FALLBACK_HOLIDAYS: Record<number, string[]> = {
  2025: [
    "2025-01-01", "2025-01-28", "2025-01-29", "2025-01-30", "2025-01-31",
    "2025-02-03", "2025-02-04", "2025-04-04", "2025-04-05", "2025-05-01",
    "2025-05-02", "2025-05-05", "2025-06-02", "2025-09-15", "2025-09-16",
    "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-06", "2025-10-07",
    "2025-10-08",
  ],
  2026: [
    "2026-01-01", "2026-01-19", "2026-01-20", "2026-01-21", "2026-01-22",
    "2026-01-23", "2026-04-06", "2026-05-01", "2026-05-04", "2026-05-05",
    "2026-06-22", "2026-09-25", "2026-10-01", "2026-10-02", "2026-10-05",
    "2026-10-06", "2026-10-07",
  ],
};

let calendarCache: TradingCalendar | null = null;

export async function loadCalendar(): Promise<TradingCalendar> {
  if (calendarCache) return calendarCache;

  // Try to fetch from cn_stock_holidays GitHub repo
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/rainx/cn_stock_holidays/main/holidays.json"
    );
    if (res.ok) {
      const data = await res.json();
      const holidays: string[] = [];
      for (const item of data) {
        if (item.holiday) holidays.push(item.date);
      }
      calendarCache = {
        year: new Date().getFullYear(),
        holidays,
        lastUpdate: Date.now(),
      };
      return calendarCache;
    }
  } catch { /* fallback */ }

  // Use built-in fallback list
  const year = new Date().getFullYear();
  calendarCache = {
    year,
    holidays: FALLBACK_HOLIDAYS[year] || FALLBACK_HOLIDAYS[2026] || [],
    lastUpdate: Date.now(),
  };
  return calendarCache;
}

/** 判断是否为A股交易日 */
export async function isTradingDay(dateStr?: string): Promise<boolean> {
  const d = dateStr ? toDate(dateStr) : new Date();
  const day = d.getDay();
  if (day === 0 || day === 6) return false;

  const cal = await loadCalendar();
  const dateKey = formatDate(d);
  return !cal.holidays.includes(dateKey);
}

/** 获取最近交易日 */
export async function getLatestTradingDay(
  from?: string
): Promise<string> {
  const d = from ? toDate(from) : new Date();
  d.setDate(d.getDate() - 1);

  for (let i = 0; i < 30; i++) {
    const dateKey = formatDate(d);
    if (await isTradingDay(dateKey)) return dateKey;
    d.setDate(d.getDate() - 1);
  }
  throw new Error("近30日未找到交易日");
}

function toDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
