---
layout: article
title: MCP 使用环境记录
type: Post
date_label: 2026-06-08
updated: 2026-06-08
category: 工程实践
summary: 记录当前在 Windows 与 WSL 中使用的 MCP 服务、启动方式、环境依赖和敏感信息处理边界。
words: 1600
views: 1
tags:
  - MCP
  - Cursor
  - WSL
  - 工具链
---

## 背景

这是一份 MCP 使用环境记录，目标不是公开可直接复制的私有配置，而是沉淀一份可维护的结构说明。

我把配置拆成两类：

```text
Windows 环境
→ 直接通过 npx 启动
→ 适合简单工具、轻量调试、无复杂 shell 依赖的服务

WSL 环境
→ 通过 bash -lc 启动
→ 先进入用户目录
→ 加载 profile 和 nvm
→ 再执行 npx 或项目内服务
```

公开记录时必须先脱敏。真实 token、API Key、数据库地址、数据库账号和数据库密码都不应该写进博客正文。

## 当前 MCP 服务清单

| 服务 | 主要用途 | Windows | WSL | 敏感级别 |
| --- | --- | --- | --- | --- |
| `browsermcp` | 连接浏览器侧能力，需配合 Browser MCP 浏览器插件使用 | 支持 | 支持 | 低 |
| `context7` | 查询库、框架、SDK 文档 | 支持 | 支持 | 低 |
| `playwright` | 浏览器自动化与页面验证 | 支持 | 支持 | 中 |
| `figma-context` | 读取 Figma 设计上下文 | 支持 | 支持 | 高 |
| `github` | GitHub 仓库、Issue、PR 操作 | 未记录 | 支持 | 高 |
| `mcp_server_mysql` | MySQL 数据库访问 | 未记录 | 支持 | 极高 |

## WSL 环境要求

WSL 配置的共同前提是：

```text
bash 可用
/home/<user> 存在
/home/<user>/.profile 可加载
/home/<user>/.nvm/nvm.sh 可加载
Node.js 和 npx 由 nvm 管理
需要的 token、key、数据库连接信息通过环境变量注入
```

推荐结构：

```json
{
  "mcpServers": {
    "service-name": {
      "command": "bash",
      "args": [
        "-lc",
        "cd /home/<user> && source /home/<user>/.profile && source /home/<user>/.nvm/nvm.sh && npx -y <package>"
      ]
    }
  }
}
```

这种写法的重点是稳定加载用户 shell 环境，避免 Cursor 启动 MCP 时拿不到 `node`、`npx` 或私有环境变量。

## WSL 服务配置模板

### browsermcp

```json
{
  "browsermcp": {
    "command": "bash",
    "args": [
      "-lc",
      "cd /home/<user> && source /home/<user>/.profile && source /home/<user>/.nvm/nvm.sh && npx -y @browsermcp/mcp@latest"
    ]
  }
}
```

Browser MCP 不是只启动一个本地 MCP server 就结束。它需要同时满足三段链路：

```text
Cursor MCP 配置
→ 启动 browsermcp server
→ 浏览器安装 Browser MCP extension
→ 在扩展里点击 Connect
→ 当前标签页成为可自动化页面
```

官方文档入口：[`Browser MCP Docs`](https://docs.browsermcp.io/)

安装顺序建议按官方流程走：

1. 配置 MCP server：[`Set up MCP server`](https://docs.browsermcp.io/setup-server)
2. 安装并固定浏览器插件：[`Set up extension`](https://docs.browsermcp.io/setup-extension)
3. 在插件中连接当前 tab：点击扩展图标，再点 `Connect`
4. 在 Cursor 中发起浏览器操作：例如打开网页、填写表单、点击按钮

这里的关键点是：所有浏览器动作都会发生在已经连接的当前标签页里。如果没有安装插件，或者插件没有连接当前 tab，`browsermcp` 即使在 MCP 列表里显示可用，也不能真正操作浏览器页面。

### context7

```json
{
  "context7": {
    "command": "bash",
    "args": [
      "-lc",
      "cd /home/<user> && source /home/<user>/.profile && source /home/<user>/.nvm/nvm.sh && npx -y @upstash/context7-mcp@latest"
    ]
  }
}
```

### playwright

```json
{
  "playwright": {
    "command": "bash",
    "args": [
      "-lc",
      "cd /home/<user> && source /home/<user>/.profile && source /home/<user>/.nvm/nvm.sh && npx -y @playwright/mcp@latest --proxy-server http://127.0.0.1:<proxy-port>"
    ]
  }
}
```

如果本地没有代理要求，可以去掉 `--proxy-server`。

### figma-context

```json
{
  "figma-context": {
    "command": "bash",
    "args": [
      "-lc",
      "cd /home/<user> && source /home/<user>/.profile && source /home/<user>/.nvm/nvm.sh && FIGMA_API_KEY=$FIGMA_API_KEY npx -y figma-developer-mcp@latest --stdio"
    ],
    "env": {}
  }
}
```

`FIGMA_API_KEY` 不应该直接写进公开配置。更稳妥的方式是放在 WSL 用户环境里，由启动命令读取。

### github

```json
{
  "github": {
    "command": "bash",
    "args": [
      "-lc",
      "cd /home/<user> && source /home/<user>/.profile && source /home/<user>/.nvm/nvm.sh && GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN npx -y @modelcontextprotocol/server-github"
    ],
    "env": {}
  }
}
```

GitHub token 必须走环境变量，不进入文章、截图、仓库或共享配置。

### mcp_server_mysql

```json
{
  "mcp_server_mysql": {
    "command": "bash",
    "args": [
      "-lc",
      "source /home/<user>/.profile && cd /home/<user>/projects/<project-name> && source /home/<user>/.nvm/nvm.sh && npx -y @benborla29/mcp-server-mysql"
    ],
    "env": {
      "MYSQL_HOST": "$MYSQL_HOST",
      "MYSQL_PORT": "$MYSQL_PORT",
      "MYSQL_USER": "$MYSQL_USER",
      "MYSQL_PASS": "$MYSQL_PASS",
      "MULTI_DB_WRITE_MODE": "true",
      "ALLOW_INSERT_OPERATION": "true",
      "ALLOW_UPDATE_OPERATION": "true",
      "ALLOW_DELETE_OPERATION": "true",
      "ALLOW_DDL_OPERATION": "false",
      "SCHEMA_INSERT_PERMISSIONS": "<db-name>:true",
      "SCHEMA_UPDATE_PERMISSIONS": "<db-name>:true",
      "SCHEMA_DELETE_PERMISSIONS": "<db-name>:true",
      "SCHEMA_DDL_PERMISSIONS": "<db-name>:false"
    }
  }
}
```

数据库 MCP 是最高风险项。公开记录只保留权限模型，不保留真实地址、账号、密码和库名细节。

## Windows 环境要求

Windows 配置更短，前提是：

```text
Node.js 可用
npx 可用
Cursor 能读取当前用户环境变量
需要私钥的服务使用 env 注入
```

推荐结构：

```json
{
  "mcpServers": {
    "service-name": {
      "command": "npx",
      "args": ["-y", "<package>"]
    }
  }
}
```

## Windows 服务配置模板

### browsermcp

```json
{
  "browsermcp": {
    "command": "npx",
    "args": ["@browsermcp/mcp@latest"]
  }
}
```

Windows 环境下也需要安装 Browser MCP 浏览器插件。`npx @browsermcp/mcp@latest` 只负责启动 MCP server；真正的页面上下文来自插件连接的当前 tab。

最小可用链路：

```text
Cursor 中启用 browsermcp
→ 浏览器安装 Browser MCP extension
→ 打开目标页面
→ 点击插件里的 Connect
→ Cursor 才能控制这个 tab
```

### context7

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp@latest"]
  }
}
```

### playwright

```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@playwright/mcp@latest"]
  }
}
```

### figma-context

```json
{
  "figma-context": {
    "command": "npx",
    "args": ["-y", "figma-developer-mcp@latest", "--stdio"],
    "env": {
      "FIGMA_API_KEY": "$FIGMA_API_KEY"
    }
  }
}
```

Windows 环境同样不应该把真实 Figma key 写进公开文件。

## 敏感信息处理边界

这类 MCP 配置里至少有四类敏感信息：

```text
API Key / Token
→ Figma、GitHub 等第三方访问凭据

数据库连接信息
→ host、port、user、password、schema

本机路径
→ 用户名、项目名、目录结构

网络代理信息
→ 本机代理端口、内网服务地址
```

公开文章中只保留：

- MCP 服务名称
- 包名
- 启动方式
- 环境依赖
- 权限模型
- 占位符格式

不保留：

- 真实 `FIGMA_API_KEY`
- 真实 `GITHUB_PERSONAL_ACCESS_TOKEN`
- 真实数据库地址
- 真实数据库账号和密码
- 可直接连接生产或个人资源的完整配置

## 维护原则

后续维护这份配置时，我会按这个流程处理：

```text
先在本地私有配置中验证 MCP 能启动
→ 再把结构同步到文章
→ 同步前替换所有敏感值
→ 保留环境要求和权限说明
→ 不发布可直接连接私有资源的配置
```

MCP 的价值是把工具能力接到工作流里；公开记录的价值是保留结构和经验，而不是泄露可执行凭据。