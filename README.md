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
├── assets/files/        # 10MB 以内小文件
├── data/content.json    # 博客、知识库、文件索引
├── scripts/app.js       # 页面渲染、搜索、AI 代理交互
├── styles/site.css      # 页面样式
├── index.html           # GitHub Pages 入口
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

1. 推送到 GitHub 仓库。
2. 打开仓库 `Settings` → `Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main` 或 `master`，目录选择 `/root`。
5. 保存后等待 GitHub Pages 构建完成。

部署检查项：

- `index.html` 在仓库根目录。
- `data/content.json` 可以被公开访问。
- `scripts/app.js` 和 `styles/site.css` 路径保持不变。
- 文件链接使用相对路径，例如 `assets/files/example.pdf`。

## 本地预览

可以用任意静态服务器打开，例如：

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。