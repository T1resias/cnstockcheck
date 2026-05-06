# CN-STOCK — A股每日复盘

对每日A股市场进行复盘分析，包含三大模块：

- **涨停股票** — 涨停个股按题材归类展示，可筛选
- **题材复盘** — 概念板块涨幅排名，连续多日涨幅前20的板块重点标记
- **财经资讯** — 当日重点财经新闻

数据来源：东方财富免费公开API。

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 首次打开后点击右上角 "刷新数据" 按钮拉取数据
# 或通过命令行刷新
npm run refresh
```

浏览器打开 http://localhost:3000

## 部署

### Vercel（推荐）

```bash
npx vercel
```

Cron 定时任务已配置（工作日 15:30 北京时间自动刷新数据），部署后自动生效。

### 其他平台

```bash
npm run build
npm start
```

需要单独配置定时任务调用 `POST /api/refresh`。
