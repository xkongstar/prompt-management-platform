# 🚀 项目启动指南

## 快速启动

### 方式一：一键启动（推荐）
```bash
# 快速启动所有服务
./start.sh

# 停止所有服务
./stop.sh
```

### 方式二：完整启动（首次运行）
```bash
# 运行完整的开发环境设置
./dev-start.sh
```

### 方式三：使用 Make 命令
```bash
# 启动开发环境
make dev

# 停止服务
make stop

# 查看日志
make logs
```

## 脚本说明

### 📄 start.sh
- **用途**: 快速启动所有 Docker 服务
- **适用场景**: 日常开发启动
- **特点**: 简单快速，适合已配置好的环境

### 📄 dev-start.sh  
- **用途**: 完整的开发环境初始化和启动
- **适用场景**: 首次运行或环境重置后
- **功能**:
  - 检查系统依赖
  - 检查端口占用
  - 创建必要目录
  - 配置环境变量
  - 初始化数据库
  - 启动所有服务

### 📄 stop.sh
- **用途**: 停止所有服务
- **功能**: 可选择是否清理数据卷

## 前置要求

### 必需依赖
- Docker (>= 20.10)
- Docker Compose (>= 1.29)

### 可选依赖
- Node.js (>= 16.x) - 本地开发
- npm (>= 8.x) - 包管理

## 启动前检查

```bash
# 1. 检查 Docker 是否安装
docker --version

# 2. 检查 Docker 守护进程是否运行
docker ps

# 3. 如果 Docker 未运行，启动它
# Linux
sudo systemctl start docker
# 或
sudo service docker start

# macOS
# Docker Desktop 应该自动启动
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 3000 | Next.js 应用 |
| 后端 | 8000 | Express API |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存服务 |

## 访问地址

启动成功后，可以访问：

- 🌐 **前端应用**: http://localhost:3000
- 🔌 **后端 API**: http://localhost:8000
- 📚 **API 文档**: http://localhost:8000/api-docs
- 🗄️ **数据库**: postgresql://localhost:5432/promptdb
- 💾 **Redis**: redis://localhost:6379

## 常见问题

### 1. Docker 守护进程未运行
```bash
# Linux
sudo systemctl start docker

# macOS
# 启动 Docker Desktop 应用
```

### 2. 端口被占用
```bash
# 查看占用端口的进程
lsof -i :3000

# 停止占用端口的进程
kill -9 <PID>
```

### 3. 权限问题
```bash
# 添加当前用户到 docker 组
sudo usermod -aG docker $USER

# 重新登录后生效
```

### 4. 容器启动失败
```bash
# 查看容器日志
docker-compose logs [service-name]

# 重建容器
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 开发命令

```bash
# 查看所有容器状态
docker-compose ps

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 进入容器内部
docker-compose exec backend sh
docker-compose exec postgres psql -U promptuser -d promptdb

# 重启特定服务
docker-compose restart backend

# 数据库操作
cd backend
npx prisma studio  # 打开数据库 GUI
npx prisma migrate dev  # 运行迁移
npx prisma db seed  # 运行种子数据
```

## 环境变量

环境变量文件会在首次运行时自动创建：

- `backend/.env` - 后端环境变量
- `frontend/.env` - 前端环境变量

如需修改，编辑对应文件后重启服务。

## 故障排除

### 重置环境
```bash
# 停止并清理所有容器和数据
docker-compose down -v
rm -rf backend/node_modules frontend/node_modules
rm -f backend/.env frontend/.env

# 重新启动
./dev-start.sh
```

### 查看详细日志
```bash
# 实时查看所有服务日志
docker-compose logs -f

# 查看特定服务的最后 100 行日志
docker-compose logs --tail=100 backend
```

## 支持

如遇到问题，请：
1. 查看容器日志：`docker-compose logs`
2. 检查 Docker 状态：`docker ps -a`
3. 确认端口未被占用：`netstat -tulpn | grep -E '3000|8000|5432|6379'`