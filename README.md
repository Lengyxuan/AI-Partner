# AI民政局 （AI Partner）

一款支持与AI伴侣进行深度绑定的RAG应用。产品包含一个仪式感强烈的"AI民政局"首页和一个类似SillyTavern的沉浸式聊天界面。系统具备知识库管理、双路召回检索、本地与云端模型无缝切换等核心能力。

## 功能特性

### 核心功能
- **AI伴侣创建**: 自定义伴侣的性格、外貌、声音，打造独一无二的AI伴侣
- **沉浸式聊天**: 类似SillyTavern的暗色主题聊天界面，支持Markdown渲染
- **知识库管理**: 上传文档让伴侣学习，支持PDF、Word、TXT等多种格式
- **双路召回检索**: 结合向量检索和关键词匹配，精准理解用户需求
- **本地/云端模型切换**: 支持OpenAI等云端API和本地llama.cpp模型

### 技术栈
- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: PostgreSQL + pgvector / Chroma / Pinecone
- **AI/ML**: 
  - 嵌入: @xenova/transformers (本地) / OpenAI API
  - LLM: OpenAI API / node-llama-cpp (本地)
  - RAG: LangChain + 自定义检索逻辑

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 14 (如使用pgvector)
- Python >= 3.8 (如使用Chroma)

### 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd AIpartner
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.local.example .env.local
# 编辑 .env.local 填入你的配置
```

4. 初始化数据库
```bash
npx prisma migrate dev
npx prisma generate
```

5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
AIpartner/
├── .env.local.example      # 环境变量示例
├── .gitignore
├── README.md
├── package.json
├── next.config.js          # Next.js 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── tsconfig.json
├── prisma/
│   └── schema.prisma       # Prisma 数据库模型
├── models/                 # 本地模型存放目录
│   └── README.md
├── public/
│   ├── uploads/            # 上传的知识库文件
│   └── assets/             # 静态资源
└── src/
    ├── app/                # Next.js App Router
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx        # 民政局首页
    │   ├── chat/
    │   │   └── [partnerId]/
    │   │       └── page.tsx
    │   └── api/            # API 路由
    ├── components/         # React 组件
    │   ├── ui/             # shadcn/ui 组件
    │   ├── civil-bureau/   # 民政局首页组件
    │   └── silly-tavern/   # 聊天界面组件
    ├── lib/                # 业务逻辑
    │   ├── db/             # 数据库
    │   ├── ai/             # AI 相关
    │   └── rag/            # RAG 相关
    └── types/              # TypeScript 类型定义
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `OPENAI_API_KEY` | OpenAI API 密钥 | - |
| `EMBEDDING_PROVIDER` | 嵌入模型提供商 | `local` |
| `EMBEDDING_MODEL` | 嵌入模型名称 | `Xenova/all-MiniLM-L6-v2` |
| `RAG_TOP_K` | 检索返回结果数量 | `5` |
| `RAG_HYBRID_ALPHA` | 混合检索权重 | `0.5` |

### 本地模型配置

1. 下载 GGUF 格式的模型文件（如 Llama-2、ChatGLM3、Qwen2.5 等）
2. 将模型文件放入 `models/` 目录
3. 在 `.env.local` 中设置 `DEFAULT_LOCAL_MODEL`

## 开发指南

### 添加新的 UI 组件

```bash
npx shadcn-ui@latest add <component-name>
```

### 数据库迁移

```bash
# 创建迁移
npx prisma migrate dev --name <migration-name>

# 生成客户端
npx prisma generate

# 查看数据库
npx prisma studio
```

### 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- API 路由使用标准 RESTful 风格
- 错误处理使用 try-catch + 统一错误格式

## 部署

### Vercel 部署

1. 在 Vercel 导入项目
2. 配置环境变量
3. 部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-partner .

# 运行容器
docker run -p 3000:3000 --env-file .env.local ai-partner
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [LangChain](https://js.langchain.com/)
- [SillyTavern](https://github.com/SillyTavern/SillyTavern) - UI 设计灵感来源
