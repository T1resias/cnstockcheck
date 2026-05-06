"use client";

import { useState } from "react";
import { TradingStatusBadge } from "./trading-status-badge";

interface Props {
  isTradingDay: boolean;
  date: string;
  selectedDate: string;
  today: string;
  availableDates: string[];
  onDateChange: (date: string) => void;
}

export function Header({
  isTradingDay,
  date,
  selectedDate,
  today,
  availableDates,
  onDateChange,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRefresh() {
    setRefreshing(true);
    setMessage("");
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setMessage(
          `刷新成功: ${data.stockCount} 只涨停 / ${data.sectorCount} 个板块 / ${data.newsCount} 条资讯`
        );
      } else {
        setMessage(data.error || "刷新失败");
      }
    } catch {
      setMessage("网络错误");
    }
    setRefreshing(false);
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">A股每日复盘</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
              <div className="flex items-center gap-2">
                <span>{date}</span>
                <TradingStatusBadge isTradingDay={isTradingDay} />
              </div>
              {/* 日期选择器 */}
              <select
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-0.5 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={today}>今天 ({today})</option>
                {availableDates
                  .filter((d) => d !== today)
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {refreshing ? "刷新中..." : "刷新数据"}
          </button>
        </div>
        {message && (
          <p className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded">
            {message}
          </p>
        )}
      </div>
    </header>
  );
}
