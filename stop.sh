#!/bin/bash

# ===================================================================
# 停止脚本 - 一键停止所有服务
# ===================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🛑 停止提示词管理平台...${NC}"

# 停止容器
if docker-compose down; then
    echo -e "${GREEN}✅ 服务已停止${NC}"
else
    echo -e "${RED}❌ 停止服务失败${NC}"
    exit 1
fi

# 询问是否清理数据
echo ""
echo -e "${YELLOW}是否清理数据卷？(y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}清理数据卷...${NC}"
    docker-compose down -v
    echo -e "${GREEN}✅ 数据已清理${NC}"
fi