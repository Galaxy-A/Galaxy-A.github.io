# Galaxy-A Blog

一个可部署到 GitHub Pages 的个人博客、工程札记和公开资料索引站点。

## 功能范围

- 博客文章索引
- 主题笔记索引
- 公开小文件入口
- 浏览器端站内搜索
- 标签筛选

## 项目结构

```text
.
├── .github/workflows/   # GitHub Pages Jekyll 部署流程
├── _layouts/            # Jekyll 页面布局
├── assets/files/        # 10MB 以内小文件和可下载 Markdown
├── content/notes/       # 可选的笔记 Markdown 正文
├── data/content.json    # 文章、笔记、资料索引元数据
├── scripts/app.js       # 页面渲染和搜索交互
├── styles/site.css      # 页面样式
├── _config.yml          # Jekyll 站点配置
├── Gemfile              # GitHub Pages/Jekyll 依赖
├── index.html           # Jekyll 首页
└── README.md
```

## 内容维护

核心索引在 `data/content.json`，具体正文建议拆到 Markdown：

- `posts`：博客文章索引
- `knowledge`：主题笔记索引
- `files`：小文件索引
- `source`：可选字段，指向 Markdown 正文；页面会统一加载、解析并加入搜索

新增博客文章示例：

```json
{
  "id": "my-post-id",
  "title": "文章标题",
  "date": "2026-06-04",
  "summary": "文章摘要",
  "tags": ["GitHub Pages", "知识管理"],
  "url": "content/notes/my-post-id.md",
  "source": "content/notes/my-post-id.md",
  "content": "用于搜索的关键词和正文摘要"
}
```

新增主题笔记示例：

```json
{
  "id": "my-note-id",
  "title": "排障笔记标题",
  "category": "Debug",
  "summary": "这条知识解决什么问题",
  "tags": ["JavaScript", "调试"],
  "url": "content/notes/my-note-id.md",
  "source": "content/notes/my-note-id.md",
  "content": "用于搜索的命令、关键词或处理过程"
}
```

对应 Markdown 示例：

````markdown
# 排障笔记标题

## 现象

这里写具体问题。

## 处理步骤

1. 确认现象和影响范围。
2. 按最小变量复现问题。
3. 记录可稳定复用的处理方式。

## 命令

```bash
<command>
```

## 注意事项

- 不要写入真实路径、密钥、账号或 token。
````

新增小文件索引示例：

```json
{
  "id": "cheatsheet-md",
  "title": "速查表 Markdown",
  "size": "4KB",
  "kind": "md",
  "summary": "文件用途说明",
  "tags": ["速查表", "Markdown"],
  "url": "assets/files/cheatsheet.md",
  "source": "assets/files/cheatsheet.md",
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

页面加载 `data/content.json` 后，会继续按 `source` 加载 Markdown 正文，并把以下内容合并成浏览器端搜索索引：

- 标题
- 摘要
- 标签
- 分类
- 文件类型和大小
- `content` 搜索片段
- Markdown 正文纯文本

搜索不依赖后端，适合个人博客和中小规模知识库。

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