import { refreshAll } from "../src/lib/refresh";

async function main() {
  console.log("正在拉取A股市场数据...\n");
  try {
    const result = await refreshAll();
    console.log(`日期: ${result.date}`);
    console.log(`交易日: ${result.isTradingDay ? "是" : "否"}`);
    if (result.isTradingDay) {
      console.log(`涨停股票: ${result.stockCount} 只`);
      console.log(`板块排行: ${result.sectorCount} 个`);
      console.log(`财经资讯: ${result.newsCount} 条`);
    } else {
      console.log("今日休市，未拉取数据");
    }
    console.log("\n✅ 数据刷新完成");
  } catch (e) {
    console.error("❌ 数据刷新失败:", e);
    process.exit(1);
  }
}

main();
