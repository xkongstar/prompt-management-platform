#!/bin/bash

# ===================================================================
# 提示词收集管理平台 - 开发环境启动脚本
# ===================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 打印带颜色的消息
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 打印分隔线
print_separator() {
    echo -e "${BLUE}=================================================================${NC}"
}

# 打印步骤
print_step() {
    local step=$1
    local message=$2
    echo -e "${CYAN}[Step ${step}]${NC} ${BOLD}${message}${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 显示启动画面
show_banner() {
    clear
    print_separator
    echo -e "${MAGENTA}${BOLD}"
    echo "   ____                        _     __  __                   "
    echo "  |  _ \ _ __ ___  _ __ ___  | |_  |  \/  | __ _ _ __   __ _ "
    echo "  | |_) | '__/ _ \| '_ \` _ \ | __| | |\/| |/ _\` | '_ \ / _\` |"
    echo "  |  __/| | | (_) | | | | | || |_  | |  | | (_| | | | | (_| |"
    echo "  |_|   |_|  \___/|_| |_| |_| \__| |_|  |_|\__, |_| |_|\__,_|"
    echo "                                            |___/              "
    echo -e "${NC}"
    echo -e "${CYAN}         提示词收集管理平台 - 开发环境启动器 v1.0${NC}"
    print_separator
    echo ""
}

# 环境检查
check_requirements() {
    print_step 1 "检查系统依赖..."
    
    local missing_deps=()
    
    # 检查 Docker
    if command_exists docker; then
        print_color "$GREEN" "  ✓ Docker 已安装 ($(docker --version | cut -d' ' -f3 | sed 's/,//'))"
    else
        print_color "$RED" "  ✗ Docker 未安装"
        missing_deps+=("docker")
    fi
    
    # 检查 Docker Compose
    if command_exists docker-compose; then
        print_color "$GREEN" "  ✓ Docker Compose 已安装 ($(docker-compose --version | cut -d' ' -f3 | sed 's/,//'))"
    else
        print_color "$RED" "  ✗ Docker Compose 未安装"
        missing_deps+=("docker-compose")
    fi
    
    # 检查 Node.js
    if command_exists node; then
        print_color "$GREEN" "  ✓ Node.js 已安装 ($(node --version))"
    else
        print_color "$YELLOW" "  ⚠ Node.js 未安装 (可选，用于本地开发)"
    fi
    
    # 检查 npm
    if command_exists npm; then
        print_color "$GREEN" "  ✓ npm 已安装 ($(npm --version))"
    else
        print_color "$YELLOW" "  ⚠ npm 未安装 (可选，用于本地开发)"
    fi
    
    # 如果有缺失的必要依赖
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_color "$RED" "\n错误: 缺少必要的依赖: ${missing_deps[*]}"
        print_color "$YELLOW" "请先安装缺失的依赖后再运行此脚本"
        exit 1
    fi
    
    echo ""
}

# 检查端口占用
check_ports() {
    print_step 2 "检查端口占用..."
    
    local ports=(3000 5432 6379 8000)
    local port_names=("Frontend" "PostgreSQL" "Redis" "Backend API")
    local occupied_ports=()
    
    for i in "${!ports[@]}"; do
        if check_port ${ports[$i]}; then
            print_color "$YELLOW" "  ⚠ 端口 ${ports[$i]} (${port_names[$i]}) 已被占用"
            occupied_ports+=(${ports[$i]})
        else
            print_color "$GREEN" "  ✓ 端口 ${ports[$i]} (${port_names[$i]}) 可用"
        fi
    done
    
    if [ ${#occupied_ports[@]} -gt 0 ]; then
        echo ""
        print_color "$YELLOW" "发现端口冲突，是否停止占用这些端口的服务？ (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            for port in "${occupied_ports[@]}"; do
                print_color "$YELLOW" "  正在释放端口 $port..."
                lsof -ti:$port | xargs kill -9 2>/dev/null || true
            done
            print_color "$GREEN" "  端口已释放"
        else
            print_color "$RED" "请手动处理端口冲突后重新运行脚本"
            exit 1
        fi
    fi
    
    echo ""
}

# 创建必要的目录
setup_directories() {
    print_step 3 "创建必要的目录..."
    
    local dirs=(
        "backend/logs"
        "backend/uploads"
        "frontend/public/uploads"
        "docker/postgres/data"
        "docker/redis/data"
        "docker/nginx/logs"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_color "$GREEN" "  ✓ 创建目录: $dir"
        else
            print_color "$BLUE" "  ○ 目录已存在: $dir"
        fi
    done
    
    echo ""
}

# 创建环境配置文件
setup_env_files() {
    print_step 4 "配置环境变量..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Backend Environment Variables
NODE_ENV=development
PORT=8000

# Database
DATABASE_URL=postgresql://promptuser:promptpass123@localhost:5432/promptdb

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-jwt-secret-$(openssl rand -hex 32)
JWT_REFRESH_SECRET=dev-refresh-secret-$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
EOF
        print_color "$GREEN" "  ✓ 创建 backend/.env"
    else
        print_color "$BLUE" "  ○ backend/.env 已存在"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# Frontend Environment Variables
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Prompt Management Platform
VITE_NODE_ENV=development
VITE_ENABLE_DEVTOOLS=true
EOF
        print_color "$GREEN" "  ✓ 创建 frontend/.env"
    else
        print_color "$BLUE" "  ○ frontend/.env 已存在"
    fi
    
    echo ""
}

# 启动 Docker 服务
start_docker_services() {
    print_step 5 "启动 Docker 服务..."
    
    # 检查 Docker 守护进程
    if ! docker info >/dev/null 2>&1; then
        print_color "$RED" "Docker 守护进程未运行，正在尝试启动..."
        if command_exists systemctl; then
            sudo systemctl start docker
        elif command_exists service; then
            sudo service docker start
        else
            print_color "$RED" "无法启动 Docker 守护进程，请手动启动"
            exit 1
        fi
    fi
    
    # 停止旧容器
    print_color "$YELLOW" "  清理旧容器..."
    docker-compose down 2>/dev/null || true
    
    # 启动服务
    print_color "$CYAN" "  启动容器服务..."
    docker-compose up -d
    
    # 等待服务就绪
    print_color "$YELLOW" "  等待服务就绪..."
    
    # 等待 PostgreSQL
    local max_attempts=30
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U promptuser -d promptdb >/dev/null 2>&1; then
            print_color "$GREEN" "  ✓ PostgreSQL 已就绪"
            break
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    # 等待 Redis
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
            print_color "$GREEN" "  ✓ Redis 已就绪"
            break
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo ""
}

# 初始化数据库
init_database() {
    print_step 6 "初始化数据库..."
    
    # 运行 Prisma 迁移
    print_color "$CYAN" "  运行数据库迁移..."
    cd backend
    
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        print_color "$YELLOW" "  安装 backend 依赖..."
        npm install
    fi
    
    # 生成 Prisma 客户端
    npx prisma generate
    
    # 运行迁移
    npx prisma migrate deploy 2>/dev/null || npx prisma db push
    
    # 运行种子数据（如果存在）
    if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
        print_color "$CYAN" "  导入种子数据..."
        npx prisma db seed
    fi
    
    cd ..
    print_color "$GREEN" "  ✓ 数据库初始化完成"
    echo ""
}

# 显示服务状态
show_status() {
    print_step 7 "检查服务状态..."
    
    docker-compose ps
    
    echo ""
    print_separator
    print_color "$GREEN" "🎉 开发环境启动成功！"
    print_separator
    echo ""
    print_color "$CYAN" "访问地址:"
    print_color "$GREEN" "  • 前端应用: http://localhost:3000"
    print_color "$GREEN" "  • 后端 API: http://localhost:8000"
    print_color "$GREEN" "  • API 文档: http://localhost:8000/api-docs"
    print_color "$GREEN" "  • 数据库: postgresql://localhost:5432/promptdb"
    print_color "$GREEN" "  • Redis: redis://localhost:6379"
    echo ""
    print_color "$CYAN" "常用命令:"
    print_color "$YELLOW" "  • 查看日志: docker-compose logs -f [service]"
    print_color "$YELLOW" "  • 停止服务: docker-compose down"
    print_color "$YELLOW" "  • 重启服务: docker-compose restart [service]"
    print_color "$YELLOW" "  • 数据库控制台: docker-compose exec postgres psql -U promptuser -d promptdb"
    print_color "$YELLOW" "  • Redis 控制台: docker-compose exec redis redis-cli"
    echo ""
}

# 错误处理
handle_error() {
    print_color "$RED" "\n❌ 启动过程中发生错误"
    print_color "$YELLOW" "请检查错误信息并重试"
    
    # 清理
    docker-compose down 2>/dev/null || true
    
    exit 1
}

# 设置错误处理
trap handle_error ERR

# 主函数
main() {
    show_banner
    check_requirements
    check_ports
    setup_directories
    setup_env_files
    start_docker_services
    init_database
    show_status
}

# 运行主函数
main