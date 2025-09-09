# AI提示词管理平台 - 部署指南

## 🚀 快速启动

### 1. 环境要求
- Node.js 18.17+ 
- npm 或 pnpm
- Git

### 2. 安装步骤

```bash
# 克隆项目（如需要）
git clone <your-repo-url>
cd <project-directory>

# 安装依赖
npm install --legacy-peer-deps

# 初始化数据库
npx prisma generate
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 🔐 GitHub OAuth 配置

### 创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写以下信息：
   - **Application name**: AI Prompt Manager (或您喜欢的名称)
   - **Homepage URL**: http://localhost:3000 (开发环境)
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. 点击 "Register application"
5. 记录 Client ID
6. 生成并记录 Client Secret

### 配置环境变量

编辑 `.env.local` 文件：

```env
# 已配置的变量
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=c0f8e3a7b5d1f4e9b2a6d8c1e3f7a9b4d1e6f2a8c3d5e7a9b2c4d6e8f1a3b5

# 替换为您的 GitHub OAuth App 凭据
AUTH_GITHUB_ID=您的_GitHub_Client_ID
AUTH_GITHUB_SECRET=您的_GitHub_Client_Secret
```

## 📦 生产部署

### 构建项目

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### 生产环境配置

1. **更新环境变量**：
   - 将 `NEXTAUTH_URL` 改为您的生产域名
   - 生成新的 `NEXTAUTH_SECRET`：`openssl rand -base64 32`
   - 更新 GitHub OAuth App 的 URLs 为生产地址

2. **数据库备份**（推荐）：
   - 考虑使用 Litestream 进行实时备份
   - 定期备份 `prisma/database.db` 文件

### Docker 部署（可选）

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 数据库
npx prisma studio    # 打开数据库管理界面
npx prisma db push   # 更新数据库架构
npx prisma generate  # 生成 Prisma Client

# 代码检查
npm run lint         # 运行 ESLint
```

## 📋 功能清单

✅ **已实现功能**：
- GitHub OAuth 登录
- 提示词 CRUD 操作
- 搜索功能（标题、内容、标签）
- 响应式设计
- 一键复制功能
- 标签管理

## 🐛 故障排除

### 常见问题

1. **middleware 错误**：
   - 临时解决方案：删除 `middleware.ts` 文件
   - 注意：这会禁用路由保护

2. **依赖冲突**：
   - 使用 `npm install --legacy-peer-deps`

3. **数据库连接问题**：
   - 确保运行了 `npx prisma generate`
   - 检查 `prisma/database.db` 文件是否存在

## 📝 注意事项

- 开发服务器运行在 http://localhost:3000
- 数据库文件位于 `prisma/database.db`
- 首次运行需要配置 GitHub OAuth
- 生产环境需要 HTTPS 支持

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Auth.js 文档](https://authjs.dev)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)