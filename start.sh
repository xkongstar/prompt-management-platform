#!/bin/bash

# ===================================================================
# 快速启动脚本 - 一键启动所有服务
# ===================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 快速启动提示词管理平台...${NC}"

# 检查 Docker
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose >/dev/null 2>&1; then
    echo -e "${RED}错误: Docker Compose 未安装${NC}"
    exit 1
fi

# 启动 Docker 服务
echo -e "${YELLOW}启动 Docker 容器...${NC}"
docker-compose up -d

# 等待服务就绪
echo -e "${YELLOW}等待服务就绪...${NC}"
sleep 5

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 服务启动成功！${NC}"
    echo ""
    echo -e "${GREEN}访问地址:${NC}"
    echo "  前端: http://localhost:3000"
    echo "  后端: http://localhost:8000"
    echo ""
    echo -e "${YELLOW}查看日志: docker-compose logs -f${NC}"
    echo -e "${YELLOW}停止服务: docker-compose down${NC}"
else
    echo -e "${RED}❌ 服务启动失败${NC}"
    docker-compose logs
    exit 1
fi