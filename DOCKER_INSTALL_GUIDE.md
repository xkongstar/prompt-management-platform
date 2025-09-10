# 📦 Docker 完整安装指引

## 目录
1. [环境说明](#环境说明)
2. [标准环境安装](#标准环境安装)
3. [特殊环境处理](#特殊环境处理)
4. [验证安装](#验证安装)
5. [常见问题](#常见问题)

## 环境说明

### 当前环境限制
当前开发环境在容器中运行，存在以下限制：
- 无法使用 systemd 管理服务
- 无法直接运行 Docker 守护进程
- 需要在宿主机或具有完整权限的环境中运行 Docker

### 推荐方案
1. **在本地开发机器上安装 Docker**
2. **使用云服务器或虚拟机**
3. **使用 Docker Desktop（Windows/Mac）**

## 标准环境安装

### 1. Ubuntu/Debian 系统

#### 方法一：使用官方脚本（推荐）
```bash
# 下载并运行官方安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录后生效
newgrp docker
```

#### 方法二：使用 APT 包管理器
```bash
# 更新包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. CentOS/RHEL/Fedora 系统

```bash
# 安装必要的依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
```

### 3. macOS 系统

```bash
# 方法一：使用 Homebrew
brew install --cask docker

# 方法二：下载 Docker Desktop
# 访问 https://www.docker.com/products/docker-desktop
# 下载并安装 Docker Desktop for Mac
```

### 4. Windows 系统

```powershell
# 方法一：使用 Chocolatey
choco install docker-desktop

# 方法二：下载 Docker Desktop
# 访问 https://www.docker.com/products/docker-desktop
# 下载并安装 Docker Desktop for Windows
```

## 特殊环境处理

### 在容器中运行 Docker（Docker-in-Docker）

```bash
# 运行特权容器
docker run --privileged -d \
    --name dind \
    docker:dind

# 或使用 sysbox runtime（更安全）
docker run --runtime=sysbox-runc -d \
    --name secure-dind \
    docker:dind
```

### WSL2 环境

```bash
# 1. 确保 WSL2 已启用
wsl --set-default-version 2

# 2. 安装 Docker Desktop for Windows
# 3. 在 Docker Desktop 设置中启用 WSL2 集成

# 4. 在 WSL2 中验证
docker --version
```

### 云服务器环境

#### 阿里云 ECS
```bash
# 使用阿里云镜像加速
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 配置镜像加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

#### 腾讯云 CVM
```bash
# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker.io

# 配置腾讯云镜像加速
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
EOF

sudo systemctl restart docker
```

## Docker Compose 安装

### 方法一：作为 Docker 插件（推荐）
```bash
# Docker Desktop 和最新版 Docker CE 已包含 docker compose 命令
docker compose version
```

### 方法二：独立安装
```bash
# 下载最新版本
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 创建软链接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 验证安装
docker-compose --version
```

## 验证安装

### 1. 检查 Docker 版本
```bash
docker --version
docker compose version
```

### 2. 检查 Docker 服务状态
```bash
# systemd 系统
sudo systemctl status docker

# 或直接检查
docker ps
```

### 3. 运行测试容器
```bash
# 运行 hello-world 测试
docker run hello-world

# 运行交互式容器测试
docker run -it --rm alpine sh -c "echo 'Docker is working!'"
```

### 4. 检查 Docker 信息
```bash
docker info
docker system df
```

## 启动项目

安装完成后，启动提示词管理平台：

```bash
# 1. 进入项目目录
cd /workspace

# 2. 使用快速启动脚本
./start.sh

# 或使用 Make 命令
make dev

# 或直接使用 docker-compose
docker-compose up -d
```

## 常见问题

### 1. Permission denied 错误
```bash
# 问题：Got permission denied while trying to connect to the Docker daemon socket
# 解决方案：
sudo usermod -aG docker $USER
newgrp docker
# 或重新登录
```

### 2. Cannot connect to Docker daemon
```bash
# 检查 Docker 是否运行
sudo systemctl status docker

# 启动 Docker
sudo systemctl start docker

# 如果是 WSL2
sudo service docker start
```

### 3. 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# 停止占用的进程
sudo kill -9 <PID>
```

### 4. 磁盘空间不足
```bash
# 清理未使用的镜像和容器
docker system prune -a -f

# 清理所有停止的容器
docker container prune -f

# 清理未使用的镜像
docker image prune -a -f

# 清理未使用的卷
docker volume prune -f
```

### 5. 镜像拉取慢
```bash
# 配置镜像加速（中国大陆）
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 6. 在没有 systemd 的系统启动 Docker
```bash
# 直接启动 dockerd
sudo dockerd &

# 或指定参数
sudo dockerd \
    --host=unix:///var/run/docker.sock \
    --host=tcp://0.0.0.0:2375 \
    --storage-driver=overlay2 &
```

## 安全建议

### 1. 不要在生产环境暴露 Docker API
```bash
# 错误的做法
dockerd -H tcp://0.0.0.0:2375

# 正确的做法（使用 TLS）
dockerd \
    --tlsverify \
    --tlscacert=ca.pem \
    --tlscert=server-cert.pem \
    --tlskey=server-key.pem \
    -H=0.0.0.0:2376
```

### 2. 定期更新 Docker
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get upgrade docker-ce docker-ce-cli

# CentOS/RHEL
sudo yum update docker-ce docker-ce-cli
```

### 3. 使用非 root 用户运行容器
```dockerfile
# Dockerfile 中指定用户
USER 1000:1000

# 或运行时指定
docker run --user 1000:1000 myimage
```

## 卸载 Docker

### Ubuntu/Debian
```bash
sudo apt-get purge docker-ce docker-ce-cli containerd.io
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### CentOS/RHEL
```bash
sudo yum remove docker-ce docker-ce-cli containerd.io
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

## 总结

1. **标准 Linux 环境**：使用官方脚本或包管理器安装
2. **容器环境**：需要特权模式或使用宿主机 Docker
3. **开发环境**：推荐使用 Docker Desktop
4. **生产环境**：注意安全配置和权限管理

安装完成后，使用项目提供的启动脚本即可快速启动应用。如遇问题，请参考常见问题部分或查阅官方文档。

## 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [最佳实践指南](https://docs.docker.com/develop/dev-best-practices/)