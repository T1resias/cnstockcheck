"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DailyMarketData } from "@/lib/types";
import { Header } from "./header";
import { TabNav } from "./tab-nav";
import { LimitUpSection } from "./limit-up/limit-up-section";
import { SectorReviewSection } from "./sector-review/sector-review-section";
import { NewsSection } from "./news/news-section";
import { Footer } from "./footer";

type Tab = "limit-up" | "sector" | "news";

interface Props {
  today: string;
  selectedDate: string;
  isTradingDay: boolean;
  data: DailyMarketData | null;
  availableDates: string[];
}

export function MainContent({
  today,
  selectedDate,
  isTradingDay,
  data,
  availableDates,
}: Props) {
  const [tab, setTab] = useState<Tab>("limit-up");
  const router = useRouter();

  const handleDateChange = useCallback(
    (date: string) => {
      router.push(date === today ? "/" : `/?date=${date}`);
    },
    [router, today]
  );

  // 展示：今天日期为主，数据日期为辅
  const isStale = data && data.date !== selectedDate && selectedDate === today;

  return (
    <div className="min-h-screen">
      <Header
        isTradingDay={isTradingDay}
        date={selectedDate}
        dataDate={data?.date}
        selectedDate={selectedDate}
        today={today}
        availableDates={availableDates}
        onDateChange={handleDateChange}
      />

      {!isTradingDay && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg text-center text-sm text-gray-600">
            {selectedDate === today
              ? "今日休市 — 显示最近交易日数据"
              : "该日期为非交易日"}
          </div>
        </div>
      )}

      <TabNav active={tab} onTab={setTab} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!data ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">该日期暂无数据</p>
            <p className="text-sm text-gray-400">
              {selectedDate === today
                ? '请点击右上角"刷新数据"按钮拉取今日数据'
                : "请选择其他日期查看"}
            </p>
          </div>
        ) : selectedDate !== displayDate ? (
          <div className="text-center py-20">
            <p className="text-gray-400">该日期暂无数据</p>
          </div>
        ) : (
          <>
            {tab === "limit-up" && (
              <LimitUpSection stocks={data.limitUpStocks} />
            )}
            {tab === "sector" && (
              <SectorReviewSection sectors={data.sectorRankings} />
            )}
            {tab === "news" && <NewsSection news={data.newsItems} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
