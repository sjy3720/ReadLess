# ReadLess

> 少读一点，也能度过考试周和工作日。

**ReadLess** 是一个 AI 文件阅读总结工具，帮助大学生和打工人快速理解和消化大量文档内容。

## 功能

- **AI 全文总结** — 自动提炼核心观点，说人话
- **考试周模式** — 必考点提炼 + 背诵卡片 + 熬夜复习版
- **工作重点提取** — 关键任务、风险点、Deadline、行动建议
- **5 分钟速读版** — 极简总结，适合临时抱佛脚
- **人话翻译** — 复杂内容翻译成大白话
- **高频关键词** — 标签化展示核心概念
- **背诵卡片** — 一问一答，手机刷题
- **截图分享** — 一键生成小红书风格分享图

## 支持格式

- PDF
- Word (.docx / .doc)
- WPS (.wps)
- TXT
- Markdown (.md)

单文件最大 2GB。

## 技术栈

- **前端**: Next.js 14 + TypeScript + TailwindCSS + Framer Motion
- **后端**: Next.js Route Handlers
- **AI**: OpenAI API / DeepSeek API
- **文件解析**: pdf-parse, mammoth
- **截图**: html2canvas
- **图标**: Lucide React

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

```env
# 推荐使用 DeepSeek（更便宜）
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# 或者使用 OpenAI
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式
│   ├── upload/
│   │   └── page.tsx        # 上传页
│   ├── result/
│   │   └── page.tsx        # 结果页
│   └── api/
│       ├── parse/route.ts  # 文件解析 API
│       ├── summarize/route.ts  # AI 分析 API
│       └── checkout/route.ts   # 支付 API
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── DragDropZone.tsx    # 拖拽上传
│   ├── ProgressBar.tsx
│   ├── LoadingSpinner.tsx
│   ├── ResultCard.tsx
│   ├── KeywordTags.tsx
│   ├── FlashCards.tsx      # 背诵卡片
│   └── ScreenshotButton.tsx
├── lib/
│   ├── ai.ts              # AI 服务（分块策略）
│   ├── parser.ts          # 文件解析
│   ├── chunker.ts         # 文本切片
│   ├── mock.ts            # Mock 数据（无 API Key 时使用）
│   └── utils.ts
└── types/
    └── index.ts           # 类型定义
```

## 架构设计

### 大文件处理策略

1. **文本切片** — 按章节/段落将文档拆分为小块
2. **结构化分析** — 识别标题层级、目录结构
3. **局部摘要** — 对每个切片单独生成摘要
4. **汇总合并** — 将所有局部摘要合并为最终输出
5. **内容过滤** — 自动去噪、去页眉页脚

### API Key 安全

- 所有 AI 请求在服务端完成
- API Key 仅存储在 `.env.local`
- 前端永远无法访问 API Key

## 定价

- **免费**: 新用户前 2 次免费
- **月会员**: ¥29.9/月
- **季度会员**: ¥79.9/季
- **年会员**: ¥199.9/年

## License

MIT
