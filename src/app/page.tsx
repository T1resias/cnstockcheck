import { loadLatestData, loadDailyData, getRecentDates } from "@/lib/data-store";
import { isTradingDay } from "@/lib/trading-calendar";
import { MainContent } from "@/components/main-content";

export const revalidate = 21600;

function todayStr(): string {
  // 北京时间 UTC+8
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 3600 * 1000);
  const y = beijing.getUTCFullYear();
  const m = String(beijing.getUTCMonth() + 1).padStart(2, "0");
  const day = String(beijing.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const today = todayStr();
  const selectedDate = params.date || today;

  const trading = await isTradingDay(selectedDate);
  const data = params.date
    ? await loadDailyData(selectedDate)
    : await loadLatestData();

  const availableDates = await getRecentDates(60);

  return (
    <MainContent
      today={today}
      selectedDate={selectedDate}
      isTradingDay={trading}
      data={data}
      availableDates={availableDates}
    />
  );
}
