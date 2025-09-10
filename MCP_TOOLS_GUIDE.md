# MCP 工具集成指南

## 概述
本文档介绍了为提示词收集管理平台集成的 MCP (Model Context Protocol) 工具，以提升开发效率。

## 已安装的 MCP 工具

### 1. enhanced-postgres-mcp-server
**功能**: PostgreSQL 数据库的读写操作
**用途**: 
- 直接查询和修改数据库
- 执行数据迁移
- 数据库调试和测试

**配置**:
```json
{
  "postgres": {
    "command": "npx",
    "args": ["enhanced-postgres-mcp-server"],
    "env": {
      "DATABASE_URL": "postgresql://promptuser:promptpass123@localhost:5432/promptdb"
    }
  }
}
```

### 2. @modelcontextprotocol/server-filesystem
**功能**: 文件系统操作增强
**用途**:
- 批量文件操作
- 目录结构管理
- 文件搜索和过滤

**配置**:
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-filesystem", "/workspace"]
  }
}
```

### 3. @modelcontextprotocol/sdk
**功能**: MCP SDK 核心库
**用途**:
- 开发自定义 MCP 工具
- 扩展现有功能

## 使用方法

### 快速开始
```bash
# 检查工具状态
./scripts/mcp-manager.sh status

# 安装所有工具
./scripts/mcp-manager.sh install

# 启动 PostgreSQL MCP 服务
./scripts/mcp-manager.sh postgres

# 启动文件系统 MCP 服务
./scripts/mcp-manager.sh filesystem
```

### 交互式管理
```bash
# 运行交互式管理器
./scripts/mcp-manager.sh
```

## 开发场景应用

### 场景 1: 数据库操作
使用 enhanced-postgres-mcp-server 可以：
- 快速查询提示词数据
- 批量更新用户权限
- 实时监控数据库性能

### 场景 2: 文件管理
使用 filesystem 服务可以：
- 批量生成组件文件
- 自动整理项目结构
- 快速搜索和替换代码

### 场景 3: API 测试
虽然专用的 fetch 工具暂不可用，可以使用：
- 内置的 curl 命令
- Node.js 脚本进行 API 测试

## 推荐的额外工具

基于项目特点，建议后续考虑添加：

1. **Docker 管理工具** - 当官方发布时
2. **GitHub 集成** - 用于版本控制
3. **Redis 客户端** - 缓存管理
4. **Swagger/OpenAPI 工具** - API 文档生成

## 注意事项

1. 确保 Docker Compose 服务正在运行
2. MCP 工具需要正确的环境变量配置
3. 某些工具可能需要额外的权限设置

## 故障排除

### PostgreSQL 连接失败
```bash
# 检查容器状态
docker ps | grep prompt-postgres

# 查看容器日志
docker logs prompt-postgres
```

### MCP 工具无响应
```bash
# 重启服务
pkill -f mcp-server
./scripts/mcp-manager.sh postgres
```

## 更新日志

- **2025-09-10**: 初始安装和配置
  - 安装 enhanced-postgres-mcp-server
  - 安装 @modelcontextprotocol/server-filesystem
  - 创建管理脚本和配置文件