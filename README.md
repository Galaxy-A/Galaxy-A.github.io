# Galaxy-A Knowledge Base

一个可部署到 GitHub Pages 的个人博客、代码知识库和小文件索引站点。

## 功能范围

- 博客文章索引
- 代码知识库索引
- 10MB 以内小文件托管入口
- 浏览器端统一搜索
- 标签筛选
- AI 代理接口接入

## 项目结构

```text
.
├── .github/workflows/   # GitHub Pages Jekyll 部署流程
├── _layouts/            # Jekyll 页面布局
├── assets/files/        # 10MB 以内小文件
├── data/content.json    # 博客、知识库、文件索引
├── scripts/app.js       # 页面渲染、搜索、AI 代理交互
├── styles/site.css      # 页面样式
├── _config.yml          # Jekyll 站点配置
├── Gemfile              # GitHub Pages/Jekyll 依赖
├── index.html           # Jekyll 首页
└── README.md
```

## 内容维护

核心数据在 `data/content.json`：

- `posts`：博客文章
- `knowledge`：代码知识库
- `files`：小文件索引

新增博客文章示例：

```json
{
  "id": "my-post-id",
  "title": "文章标题",
  "date": "2026-06-04",
  "summary": "文章摘要",
  "tags": ["GitHub Pages", "知识管理"],
  "url": "#posts",
  "content": "用于搜索的正文片段"
}
```

新增代码知识库示例：

```json
{
  "id": "my-note-id",
  "title": "排障笔记标题",
  "category": "Debug",
  "summary": "这条知识解决什么问题",
  "tags": ["JavaScript", "调试"],
  "url": "#knowledge",
  "content": "用于搜索的命令、关键词或处理过程"
}
```

新增小文件索引示例：

```json
{
  "id": "cheatsheet-pdf",
  "title": "速查表 PDF",
  "size": "2.4MB",
  "kind": "pdf",
  "summary": "文件用途说明",
  "tags": ["速查表", "PDF"],
  "url": "assets/files/cheatsheet.pdf",
  "content": "用于搜索的文件说明"
}
```

## 小文件规则

小文件放在 `assets/files/`，建议单文件不超过 10MB。

适合放：

- PDF 速查表
- 示例代码压缩包
- 图片素材
- 配置模板
- 轻量数据样例

不适合放：

- 大型视频
- 超大压缩包
- 私密文件
- 带密钥、Token、账号信息的文件

大文件建议使用 GitHub Releases、对象存储或网盘链接，再把链接写入 `data/content.json`。

## 搜索机制

页面加载 `data/content.json` 后，会把以下内容合并成浏览器端搜索索引：

- 标题
- 摘要
- 标签
- 分类
- 文件类型和大小
- `content` 搜索片段

搜索不依赖后端，适合个人博客和中小规模知识库。

## AI 接入

页面只填写代理接口地址，不要把 OpenAI、Claude 或其他模型密钥写进前端代码。

前端发送格式：

```json
{
  "question": "用户问题",
  "context": {
    "site": {},
    "posts": [],
    "knowledge": [],
    "files": []
  }
}
```

推荐代理返回格式：

```json
{
  "answer": "AI 返回内容"
}
```

代理服务建议放在 Cloudflare Worker、Vercel Function、Netlify Function 或自建 API 中。模型密钥只放在代理服务的环境变量里。

## GitHub Pages 部署

当前项目使用 Jekyll 模式，通过 GitHub Actions 构建并发布。

部署链路：

```text
main 分支提交
  ↓
.github/workflows/jekyll-pages.yml
  ↓
Jekyll 构建到 _site/
  ↓
GitHub Pages 发布
```

部署检查项：

- `index.html` 带有 Jekyll front matter。
- `_layouts/default.html` 提供页面外壳。
- `_config.yml` 中的 `url` 是 `https://galaxy-a.github.io`。
- `Gemfile` 使用 GitHub Pages 支持的 Jekyll 依赖。
- `data/content.json`、`scripts/app.js` 和 `styles/site.css` 保持公开静态路径。

## 本地预览

推荐使用 Bundler 按 GitHub Pages 依赖启动 Jekyll：

```bash
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

然后访问 `http://127.0.0.1:4000`。