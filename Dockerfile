# 使用官方的 Node.js 镜像作为基础镜像
FROM node:21

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果有）到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

COPY . .

RUN npm run setup

# 复制项目的所有文件到工作目录
COPY . .

# 暴露应用运行的端口（如果你的应用在特定端口上运行）
EXPOSE 8888

# 定义容器启动时运行的命令
CMD ["npm", "start"]